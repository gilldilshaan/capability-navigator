"""FastAPI REST API for the PARALLAX Capability Graph and Dependency Engine."""

import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.engine import CapabilityEngine
from src.models import (
    CapabilityImpact,
    DisruptionAnalysis,
    DisruptionRequest,
    ResourceType,
)

# Global engine instance
engine: CapabilityEngine = None  # type: ignore


# Cross-origin access for the Vercel-deployed frontend. Any additional origins
# can be supplied via CORS_ORIGINS (comma-separated) without changing code.
_CORS_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS",
        "https://capability-navigator-six.vercel.app",
    ).split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager to initialize the capability engine on startup."""
    global engine
    engine = CapabilityEngine()
    yield


app = FastAPI(
    title="PARALLAX Capability Graph & Dependency Engine API",
    description=(
        "Supply-chain dependency modeling, failure propagation, capability redundancy, "
        "and single-point-of-failure analysis service."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check endpoint",
    response_model=Dict[str, Any],
)
async def health_check() -> Dict[str, Any]:
    """Return service health status and loaded graph statistics."""
    global engine
    if engine is None:
        engine = CapabilityEngine()
    total_nodes = len(engine.graph.graph.nodes)
    total_edges = len(engine.graph.graph.edges)
    return {
        "status": "healthy",
        "service": "parallax-capability-engine",
        "graph_stats": {
            "total_nodes": total_nodes,
            "total_edges": total_edges,
        },
    }


@app.post(
    "/analyze-disruption",
    tags=["Disruption Analysis"],
    summary="Analyze impact of a supply chain resource failure",
    response_model=DisruptionAnalysis,
    responses={
        404: {"description": "Resource not found in graph"},
        400: {"description": "Invalid request payload"},
    },
)
async def analyze_disruption(request: DisruptionRequest) -> DisruptionAnalysis:
    """Analyze the downstream impacts of a resource failure.

    Traces dependency propagation, determines capability availability (available, at_risk, lost),
    computes remaining redundancy, identifies alternative resources, and detects single points of failure.
    """
    global engine
    if engine is None:
        engine = CapabilityEngine()

    try:
        analysis = engine.analyze_disruption(request.resource_id)
        return analysis
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during disruption analysis: {str(e)}",
        )


# ---------------------------------------------------------------------------
# Frontend-facing endpoints.
#
# These expose a small subset of the engine to the Vercel-deployed frontend
# under the /api/* prefix it expects. They are pure adapters over the real
# engine functions above -- they do NOT invent data that the engine does not
# produce. Every field is derived from the loaded capability graph or from the
# analysis the engine actually computes.
#
# Endpoints the engine genuinely cannot back (incident store, recovery planning/
# approvals, chaos simulation, agent orchestration, and the MedCore master-data
# register -- which uses different entity IDs than this graph) are intentionally
# NOT implemented here; the frontend falls back to its demo data for those.
# ---------------------------------------------------------------------------


@app.get(
    "/api/health",
    tags=["Health"],
    summary="Frontend health check",
    response_model=Dict[str, Any],
)
async def frontend_health() -> Dict[str, Any]:
    """Health payload shaped for the frontend shell's connectivity signal."""
    global engine
    if engine is None:
        engine = CapabilityEngine()
    total_nodes = len(engine.graph.graph.nodes)
    total_edges = len(engine.graph.graph.edges)
    return {
        "status": "ok",
        "database": f"connected ({total_nodes} nodes, {total_edges} edges)",
        "graph_stats": {
            "total_nodes": total_nodes,
            "total_edges": total_edges,
        },
    }


# Map the engine's lower-case enum values to the frontend's upper-case ones.
_STATUS_MAP = {
    "available": "AVAILABLE",
    "at_risk": "AT_RISK",
    "lost": "LOST",
}

# Resource type -> frontend resource kind. Only types the graph models are
# mapped; anything else is reported verbatim.
_KIND_MAP: Dict[str, str] = {
    ResourceType.SUPPLIER.value: "supplier",
    ResourceType.MATERIAL.value: "material",
    ResourceType.FACTORY.value: "factory",
    ResourceType.MACHINE.value: "machine",
    ResourceType.WORKFORCE.value: "workforce",
    ResourceType.CAPABILITY.value: "capability",
}


def _capability_impacts(
    analysis: DisruptionAnalysis,
) -> List[Dict[str, Any]]:
    """Adapt the engine's real CapabilityImpact records to the frontend shape."""
    out: List[Dict[str, Any]] = []
    for impact in analysis.affected_capabilities:
        dependents = engine.graph.get_dependents(impact.capability_id, recursive=True)
        out.append(
            {
                "id": impact.capability_id,
                "name": impact.capability_name,
                "status": _STATUS_MAP.get(impact.status.value, impact.status.value),
                "redundancy": impact.remaining_redundancy,
                "targetRedundancy": impact.initial_redundancy,
                "dependencies": len(dependents),
                "provider": ", ".join(impact.remaining_providers) or None,
                "impacted": impact.status.value != "available",
            }
        )
    return out


def _affected_resources(analysis: DisruptionAnalysis) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for node in analysis.affected_resources:
        rtype = node.get("type", "")
        out.append(
            {
                "id": node.get("id"),
                "kind": _KIND_MAP.get(rtype, rtype),
                "name": node.get("name", node.get("id")),
                "status": "AT_RISK",
                "role": "affected",
            }
        )
    return out


def _alternative_resources(analysis: DisruptionAnalysis) -> List[Dict[str, Any]]:
    seen: set = set()
    out: List[Dict[str, Any]] = []
    for group in analysis.alternative_resources:
        for provider in group.get("alternative_providers", []):
            pid = provider.get("id")
            if not pid or pid in seen:
                continue
            seen.add(pid)
            attrs = provider.get("attributes", {}) or {}
            out.append(
                {
                    "id": pid,
                    "name": provider.get("name", pid),
                    "kind": _KIND_MAP.get(provider.get("type", ""), provider.get("type", "")),
                    "leadTimeDays": attrs.get("lead_time_days"),
                    "qualified": True,
                }
            )
    return out


def _redundancy_scores(analysis: DisruptionAnalysis) -> List[Dict[str, Any]]:
    return [
        {
            "capabilityId": impact.capability_id,
            "capabilityName": impact.capability_name,
            "redundancy": impact.remaining_redundancy,
            "target": impact.initial_redundancy,
        }
        for impact in analysis.affected_capabilities
    ]


def _most_impacted(
    analysis: DisruptionAnalysis,
) -> Optional[CapabilityImpact]:
    """Pick the worst-affected capability (lost > at_risk > available)."""
    rank = {"lost": 0, "at_risk": 1, "available": 2}
    impacts = analysis.affected_capabilities or []
    if not impacts:
        return None
    return min(impacts, key=lambda i: rank.get(i.status.value, 3))


class GraphAnalyzeRequest(BaseModel):
    """Frontend graph-analysis payload.

    Accepts the frontend's analyse-graph body ({disruptionId, capabilityId,
    resourceId}) and resolves to the engine's required resource_id. The
    primary failed resource is resource_id when supplied, otherwise capability_id.
    Both snake_case and camelCase field names are accepted.
    """

    model_config = {"populate_by_name": True}

    disruption_id: Optional[str] = Field(
        default=None, description="Disruption identifier", alias="disruptionId"
    )
    capability_id: Optional[str] = Field(
        default=None, description="Capability to analyze", alias="capabilityId"
    )
    resource_id: Optional[str] = Field(
        default=None, description="Resource to analyze", alias="resourceId"
    )


@app.post(
    "/api/graph/analyze",
    tags=["Frontend"],
    summary="Analyze a resource failure using the capability engine",
    response_model=Dict[str, Any],
    responses={
        404: {"description": "Resource not found in graph"},
        400: {"description": "Invalid request payload"},
    },
)
async def graph_analyze(request: GraphAnalyzeRequest) -> Dict[str, Any]:
    """Bridge the frontend's graph analysis to the real disruption engine.

    Returns a GraphAnalysisResult-shaped payload derived entirely from the
    engine's real output. If the requested resource is not present in the
    loaded graph the request returns 404 so the frontend can fall back to its
    demo analysis.
    """
    global engine
    if engine is None:
        engine = CapabilityEngine()

    resource_id = request.resource_id or request.capability_id
    if not resource_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either resource_id or capability_id is required.",
        )

    try:
        analysis = engine.analyze_disruption(resource_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    primary = _most_impacted(analysis)
    return {
        "disruptionId": request.disruption_id or resource_id,
        "capabilityId": primary.capability_id if primary else resource_id,
        "capabilityName": primary.capability_name if primary else None,
        "affectedCapabilities": _capability_impacts(analysis),
        "affectedResources": _affected_resources(analysis),
        "hiddenDependencies": [],
        "alternativeResources": _alternative_resources(analysis),
        "redundancyScores": _redundancy_scores(analysis),
    }
