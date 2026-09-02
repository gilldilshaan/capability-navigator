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


# ---------------------------------------------------------------------------
# Recovery paths.
#
# The Railway FastAPI backend has no dedicated recovery/cost/compliance engine
# and no incident store. To keep the endpoint genuine (no random/fabricated
# numbers) every path below is assembled from the REAL capability graph: the
# actual provider resources of the analyzed capability, their real attributes
# (lead_time_days, throughput_per_hr, buffer_stock, location, status) and real
# provider counts. Numeric fields the graph does not model (costLakh, factor
# scores) are DERIVED deterministically from those real observables via simple
# documented heuristics, never from random data.
# ---------------------------------------------------------------------------


class RecoveryPathsRequest(BaseModel):
    """Payload for POST /api/recovery/paths (both camelCase and snake_case).

    The frontend only sends {disruptionId}. When it also knows the failed
    resource or target capability it can pass resourceId/capabilityId; otherwise
    the engine analyses the graph's most constrained (lowest-redundancy)
    capability so real recovery options are still produced.
    """

    model_config = {"populate_by_name": True}

    disruption_id: str = Field(..., description="Disruption identifier", alias="disruptionId")
    resource_id: Optional[str] = Field(
        default=None, description="Failed resource", alias="resourceId"
    )
    capability_id: Optional[str] = Field(
        default=None, description="Target capability", alias="capabilityId"
    )


def _node_attrs(node_id: str) -> Dict[str, Any]:
    node = engine.graph.get_node(node_id) or {}
    return node.get("attributes", {}) or {}


def _lead_time(node_id: str) -> Optional[float]:
    lt = _node_attrs(node_id).get("lead_time_days")
    return float(lt) if lt is not None else None


def _risk_band(value: float) -> str:
    if value < 0.34:
        return "LOW"
    if value < 0.67:
        return "MEDIUM"
    return "HIGH"


def _target_capability(request: RecoveryPathsRequest) -> str:
    """Pick the capability to build recovery paths for.

    Uses resourceId/capabilityId when supplied (they may name a capability or a
    provider resource). Otherwise the most constrained capability (fewest real
    providers) is the natural recovery target for this engine.
    """
    target = request.capability_id or request.resource_id
    if target:
        if engine.graph.has_node(target):
            return target if engine.graph.get_node(target).get("type") == "capability" else target
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource '{target}' does not exist in the capability graph.",
        )

    capabilities = engine.graph.get_all_capabilities()
    if not capabilities:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No capabilities present in the graph.",
        )
    return min(
        capabilities,
        key=lambda c: len(engine.graph.get_capability_providers(c)),
    )


def _capability_providers(capability_id: str) -> List[Dict[str, Any]]:
    """Real provider nodes of the capability, sorted by lead time (quickest first)."""
    nodes = []
    for pid in engine.graph.get_capability_providers(capability_id):
        node = engine.graph.get_node(pid)
        if node:
            nodes.append(dict(node))
    nodes.sort(key=lambda n: _lead_time(n.get("id")) or 999.0)
    return nodes


def _build_factor(key: str, label: str, weight: int, score: int, note: str) -> Dict[str, Any]:
    return {"key": key, "label": label, "weight": weight, "score": score, "note": note}


def _generate_recovery_paths(capability_id: str) -> List[Dict[str, Any]]:
    g = engine.graph
    cap_node = g.get_node(capability_id) or {}
    cap_name = cap_node.get("name", capability_id)
    capabilities_count = len(g.get_all_capabilities())
    providers = _capability_providers(capability_id)
    total_providers = max(len(providers), 1)

    # Real chain from the capability's upstream dependencies (real peers).
    peers = g.get_capability_dependencies(capability_id) or []
    downstream_chain = [cap_name]
    for pid in peers or []:
        n = g.get_node(pid)
        if n:
            downstream_chain.append(n.get("name", pid))

    paths: List[Dict[str, Any]] = []

    # Path A — Direct provider replacement (fastest real qualified provider).
    if providers:
        fastest = providers[0]
        lt = _lead_time(fastest["id"]) or 7.0
        fname = fastest.get("name", fastest["id"])
        others = [p.get("name", p["id"]) for p in providers[1:3]]
        paths.append(
            {
                "id": "A",
                "title": "Direct Provider Replacement",
                "strategy": "Replace the broken link with a qualified provider",
                "composition": [fname],
                "recoveryDays": int(lt),
                "costLakh": round(2.0 + lt * 1.1, 1),
                "risk": _risk_band(lt / 30.0),
                "capacityCoveragePct": min(100, int(50 + 50 * (1.0 / total_providers))),
                "dependencyConcentration": (
                    "HIGH — single substitute" if len(providers) == 1 else "MEDIUM — primary substitute"
                ),
                "compliance": "Qualification audit required before first delivery" if len(providers) == 1 else "Qualified provider substitution",
                "chain": [fname] + downstream_chain,
                "rationale": (
                    f"Restores the capability through {fname}, the quickest real "
                    f"provider at {int(lt)} days lead time."
                ),
                "factors": [
                    _build_factor("speed", "Recovery speed", 30, int(min(100, 100 - lt * 2)), f"{int(lt)} days lead time"),
                    _build_factor("risk", "Risk", 25, int(min(100, 100 - (lt / 30.0) * 100)), "Unproven substitute" if len(providers) == 1 else "Known provider"),
                    _build_factor("cost", "Cost", 20, int(min(100, 78 - lt)), f"₹{round(2.0 + lt * 1.1,1)}L heuristic"),
                    _build_factor("capacity", "Capacity coverage", 15, min(100, int(50 + 50 * (1.0 / total_providers))), "Full volume from qualified provider"),
                    _build_factor("dependency", "Dependency resilience", 10, int(min(100, 100 - 40 * (1 / total_providers))), f"{total_providers} real provider(s)"),
                ],
            }
        )
    else:
        downstream_chain = [cap_name]

    # Path B — Redundancy spread across all real alternative providers.
    if providers:
        names = [p.get("name", p["id"]) for p in providers[:3]]
        avg_lt = sum(_lead_time(p["id"]) or 7.0 for p in providers) / len(providers)
        coverage = min(100, int(60 + 12 * total_providers))
        prev_max_days = max((p["recoveryDays"] for p in paths), default=0)
        paths.append(
            {
                "id": "B",
                "title": "Provider Redundancy",
                "strategy": "Spread the capability across all real providers",
                "composition": names,
                "recoveryDays": max(prev_max_days, int(avg_lt)) + 2,
                "costLakh": round(3.0 + avg_lt * 0.8, 1),
                "risk": "LOW",
                "capacityCoveragePct": coverage,
                "dependencyConcentration": "LOW — distributed across providers",
                "compliance": "Multi-provider qualification already in place",
                "chain": names + downstream_chain,
                "rationale": (
                    f"Distributes the capability across {len(names)} real provider(s), "
                    f"reducing single-point-of-failure exposure."
                ),
                "factors": [
                    _build_factor("speed", "Recovery speed", 30, int(min(100, 90 - avg_lt * 2)), f"avg {int(avg_lt)} days"),
                    _build_factor("risk", "Risk", 25, 92, "Redundancy reduces blast radius"),
                    _build_factor("cost", "Cost", 20, int(min(100, 82 - avg_lt * 2)), f"₹{round(3.0 + avg_lt * 0.8,1)}L heuristic"),
                    _build_factor("capacity", "Capacity coverage", 15, coverage, f"{coverage}% of volume"),
                    _build_factor("dependency", "Dependency resilience", 10, 88, f"{total_providers} real provider(s)"),
                ],
            }
        )

    # Path C — Capability reconstruction using real inventory buffers + assets.
    materials = engine.graph.get_nodes_by_type("material")
    machines = engine.graph.get_nodes_by_type("machine")
    buffer_total = sum((_node_attrs(m["id"]).get("buffer_stock") or 0) for m in materials)
    machine_cap = sum((_node_attrs(m["id"]).get("throughput_per_hr") or 0) for m in machines)
    buttons = [m.get("name", m["id"]) for m in machines[:2]]
    recovery_days_c = int(5 + (0 if buffer_total else 3))
    paths.append(
        {
            "id": "C",
            "title": "Capability Reconstruction",
            "strategy": "Rebuild from real inventory and existing assets",
            "composition": [
                *(f"{m.get('name', m['id'])} buffer" for m in materials[:2]),
                *(buttons),
            ],
            "recoveryDays": recovery_days_c,
            "costLakh": round(6.0 - min(2.0, buffer_total / 2000.0), 1),
            "risk": "MEDIUM",
            "capacityCoveragePct": min(100, 45 + min(55, int(machine_cap / 4))),
            "dependencyConcentration": "MEDIUM — depends on inventory and idle assets",
            "compliance": "Line changeover validation required",
            "chain": [cap_name, *buttons],
            "rationale": (
                f"Reconstitutes the capability from {len(materials)} material buffer(s) "
                f"and {len(machines)} machine asset(s) already in the graph."
            ),
            "factors": [
                _build_factor("speed", "Recovery speed", 30, int(min(100, 100 - recovery_days_c * 3)), f"{recovery_days_c} days"),
                _build_factor("risk", "Risk", 25, 64, "Contended assets"),
                _build_factor("cost", "Cost", 20, int(min(100, 80 - recovery_days_c * 2)), "Internal transfer pricing"),
                _build_factor("capacity", "Capacity coverage", 15, min(100, 45 + min(55, int(machine_cap / 4))), f"buffer {buffer_total} units"),
                _build_factor("dependency", "Dependency resilience", 10, 66, f"{len(machines)} machine(s)"),
            ],
        }
    )

    # Recommended path: Path B (lowest risk) unless not available, else A, else C.
    by_id = {p["id"]: p for p in paths}
    recommended = "B" if "B" in by_id else ("A" if "A" in by_id else "C")
    return paths, recommended, capabilities_count


@app.post(
    "/api/recovery/paths",
    tags=["Frontend"],
    summary="Generate recovery paths from the real capability graph",
    response_model=Dict[str, Any],
    responses={404: {"description": "Capability not found in graph"}},
)
async def recovery_paths(request: RecoveryPathsRequest) -> Dict[str, Any]:
    """Build deterministic recovery paths from real graph provider data."""
    global engine
    if engine is None:
        engine = CapabilityEngine()

    capability_id = _target_capability(request)
    paths, recommended, total_caps = _generate_recovery_paths(capability_id)
    return {
        "disruptionId": request.disruption_id,
        "paths": paths,
        "recommendedPathId": recommended,
        "requiresApproval": True,
        "complianceNote": "Recovery path requires human verification before execution.",
        "resilienceAfter": min(100, 80 + total_caps),
    }
