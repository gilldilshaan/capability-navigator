"""FastAPI REST API for the PARALLAX Capability Graph and Dependency Engine."""

from contextlib import asynccontextmanager
from typing import Any, Dict
from fastapi import FastAPI, HTTPException, status

from src.engine import CapabilityEngine
from src.models import DisruptionAnalysis, DisruptionRequest

# Global engine instance
engine: CapabilityEngine = None  # type: ignore


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
