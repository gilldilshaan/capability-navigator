"""Comprehensive test suite for Capability Graph, Capability Engine, Analyzer, and API."""

import json
from typing import Any, Dict, Optional
import pytest
from fastapi import HTTPException

from src.analyzer import (
    calculate_capability_redundancy,
    compare_before_after,
    detect_single_points_of_failure,
    find_alternative_resources,
)
from src.api import analyze_disruption, app, health_check
from src.engine import CapabilityEngine
from src.graph import CapabilityGraph
from src.models import CapabilityStatus, DisruptionRequest


@pytest.fixture
def clean_graph() -> CapabilityGraph:
    """Fixture providing a newly constructed CapabilityGraph for arbitrary topology tests."""
    cg = CapabilityGraph(name="TestCustomGraph")
    # Arbitrary non-hardcoded IDs
    cg.add_node("S_ALPHA", "supplier", name="Supplier Alpha")
    cg.add_node("S_BETA", "supplier", name="Supplier Beta")
    cg.add_node("M_RAW_1", "material", name="Raw Material 1")
    cg.add_node("M_RAW_2", "material", name="Raw Material 2")
    cg.add_node("F_PLANT_1", "factory", name="Plant 1")
    cg.add_node("EQ_001", "machine", name="Machine 1")
    cg.add_node("EQ_002", "machine", name="Machine 2")
    cg.add_node("TEAM_OPS", "workforce", name="Ops Team")
    cg.add_node("CAP_ASSEMBLE", "capability", name="Precision Assembly")
    cg.add_node("CAP_INSPECT", "capability", name="Automated Inspection")

    # Relationships
    cg.add_relationship("S_ALPHA", "M_RAW_1", "supplies")
    cg.add_relationship("S_BETA", "M_RAW_2", "supplies")
    cg.add_relationship("M_RAW_1", "F_PLANT_1", "delivered_to")
    cg.add_relationship("M_RAW_2", "F_PLANT_1", "delivered_to")
    cg.add_relationship("F_PLANT_1", "EQ_001", "houses")
    cg.add_relationship("F_PLANT_1", "EQ_002", "houses")
    cg.add_relationship("F_PLANT_1", "TEAM_OPS", "employs")
    cg.add_relationship("EQ_001", "CAP_ASSEMBLE", "provides")
    cg.add_relationship("EQ_002", "CAP_ASSEMBLE", "provides")
    cg.add_relationship("TEAM_OPS", "CAP_INSPECT", "provides")

    return cg


@pytest.fixture
def sample_engine() -> CapabilityEngine:
    """Fixture providing CapabilityEngine loaded with the standard sample_supply_chain dataset."""
    return CapabilityEngine()


async def _dispatch_asgi_request(
    method: str,
    path: str,
    body: Optional[Dict[str, Any]] = None,
) -> tuple[int, Dict[str, Any]]:
    """Helper to dispatch in-memory HTTP requests directly to the FastAPI ASGI application."""
    body_bytes = json.dumps(body).encode("utf-8") if body is not None else b""
    headers = [
        (b"host", b"testserver"),
        (b"content-type", b"application/json"),
        (b"content-length", str(len(body_bytes)).encode("ascii")),
    ]

    scope = {
        "type": "http",
        "asgi": {"version": "3.0", "spec_version": "2.3"},
        "http_version": "1.1",
        "method": method.upper(),
        "scheme": "http",
        "path": path,
        "raw_path": path.encode("ascii"),
        "query_string": b"",
        "headers": headers,
        "client": ("127.0.0.1", 12345),
        "server": ("127.0.0.1", 80),
        "app": app,
    }

    sent_events = []

    async def receive():
        return {
            "type": "http.request",
            "body": body_bytes,
            "more_body": False,
        }

    async def send(event):
        sent_events.append(event)

    await app(scope, receive, send)

    start_event = next(e for e in sent_events if e["type"] == "http.response.start")
    body_event = next(e for e in sent_events if e["type"] == "http.response.body")
    status_code = start_event["status"]
    data = json.loads(body_event["body"].decode("utf-8"))
    return status_code, data


# ---------------------------------------------------------------------------
# 1. Graph Structure and Traversal Tests
# ---------------------------------------------------------------------------


def test_arbitrary_ids_and_graph_traversal(clean_graph: CapabilityGraph):
    """Verify graph handles arbitrary IDs without hardcoded constraints and traverses correctly."""
    assert clean_graph.has_node("S_ALPHA")
    assert clean_graph.has_node("CAP_ASSEMBLE")

    # Direct dependencies and dependents
    direct_deps = clean_graph.get_dependencies("M_RAW_1", recursive=False)
    assert direct_deps == ["S_ALPHA"]

    direct_dependents = clean_graph.get_dependents("S_ALPHA", recursive=False)
    assert direct_dependents == ["M_RAW_1"]

    # Transitive / Recursive ancestors and descendants
    all_downstream = set(clean_graph.get_dependents("S_ALPHA", recursive=True))
    assert "M_RAW_1" in all_downstream
    assert "F_PLANT_1" in all_downstream
    assert "EQ_001" in all_downstream
    assert "CAP_ASSEMBLE" in all_downstream

    all_upstream = set(clean_graph.get_dependencies("CAP_ASSEMBLE", recursive=True))
    assert "EQ_001" in all_upstream
    assert "EQ_002" in all_upstream
    assert "F_PLANT_1" in all_upstream
    assert "S_ALPHA" in all_upstream
    assert "S_BETA" in all_upstream

    # Providers
    providers = clean_graph.get_capability_providers("CAP_ASSEMBLE")
    assert set(providers) == {"EQ_001", "EQ_002"}

    # Removal
    clean_graph.remove_resource("EQ_001")
    assert not clean_graph.has_node("EQ_001")
    assert clean_graph.get_capability_providers("CAP_ASSEMBLE") == ["EQ_002"]


# ---------------------------------------------------------------------------
# 2. Supplier Failure Propagation
# ---------------------------------------------------------------------------


def test_supplier_failure_propagation(sample_engine: CapabilityEngine):
    """Verify that failing a supplier propagates downstream through materials, factories, machines to capabilities."""
    # Disruption of SUP-003 (Houston Polymer Supplier)
    analysis = sample_engine.analyze_disruption("SUP-003")

    assert analysis.failed_resource["id"] == "SUP-003"
    affected_ids = [r["id"] for r in analysis.affected_resources]

    # Downstream path: SUP-003 -> MAT-003 -> FAC-002 -> MAC-004
    assert "MAT-003" in affected_ids
    assert "FAC-002" in affected_ids
    assert "MAC-004" in affected_ids

    # Unrelated resources should NOT be affected
    assert "MAT-001" not in affected_ids
    assert "FAC-001" not in affected_ids
    assert "MAC-001" not in affected_ids

    # Impact on CAP-003 (High-Pressure Injection Molding)
    impact_map = {c.capability_id: c for c in analysis.affected_capabilities}
    assert "CAP-003" in impact_map
    cap3_impact = impact_map["CAP-003"]
    assert cap3_impact.status == CapabilityStatus.LOST
    assert cap3_impact.remaining_redundancy == 0
    assert "MAC-004" in cap3_impact.lost_providers


# ---------------------------------------------------------------------------
# 3. Machine Failure & Redundant Provider Surviving
# ---------------------------------------------------------------------------


def test_machine_failure_redundant_provider_surviving(sample_engine: CapabilityEngine):
    """Verify that when one redundant machine fails, the capability remains active with status 'at_risk'."""
    # Fail MAC-001 (one of two CNC milling machines providing CAP-001)
    analysis = sample_engine.analyze_disruption("MAC-001")

    assert analysis.failed_resource["id"] == "MAC-001"

    # CAP-001 impact check
    impact_map = {c.capability_id: c for c in analysis.affected_capabilities}
    assert "CAP-001" in impact_map
    cap1_impact = impact_map["CAP-001"]

    assert cap1_impact.status == CapabilityStatus.AT_RISK
    assert cap1_impact.initial_redundancy == 2
    assert cap1_impact.remaining_redundancy == 1
    assert cap1_impact.lost_providers == ["MAC-001"]
    assert cap1_impact.remaining_providers == ["MAC-002"]
    assert cap1_impact.is_single_point_of_failure is True

    # Check alternative resources for CAP-001
    alt_entry = next(
        (a for a in analysis.alternative_resources if a["capability_id"] == "CAP-001"), None
    )
    assert alt_entry is not None
    alt_provider_ids = [p["id"] for p in alt_entry["alternative_providers"]]
    assert "MAC-002" in alt_provider_ids


# ---------------------------------------------------------------------------
# 4. Complete Capability Loss
# ---------------------------------------------------------------------------


def test_complete_capability_loss_when_factory_fails(sample_engine: CapabilityEngine):
    """Verify that when a shared upstream factory fails, all dependent machines fail and capabilities are LOST."""
    # Fail FAC-001 which houses MAC-001, MAC-002, MAC-003, WF-001, WF-002
    analysis = sample_engine.analyze_disruption("FAC-001")

    impact_map = {c.capability_id: c for c in analysis.affected_capabilities}

    # CAP-001 (Milling) relied on MAC-001 and MAC-002: both lost
    assert impact_map["CAP-001"].status == CapabilityStatus.LOST
    assert impact_map["CAP-001"].remaining_redundancy == 0

    # CAP-002 (SMT) relied on MAC-003: lost
    assert impact_map["CAP-002"].status == CapabilityStatus.LOST

    # CAP-004 (Metrology) relied on WF-001: lost
    assert impact_map["CAP-004"].status == CapabilityStatus.LOST

    # CAP-003 (Molding) in FAC-002 should NOT be in affected capabilities
    assert "CAP-003" not in impact_map


# ---------------------------------------------------------------------------
# 5. Single Point of Failure (SPOF) Detection
# ---------------------------------------------------------------------------


def test_single_point_of_failure_detection(sample_engine: CapabilityEngine):
    """Verify SPOF detection under normal baseline and after single provider failure."""
    # Baseline SPOFs
    baseline_spofs = detect_single_points_of_failure(sample_engine.graph, failed_resources=None)
    # In sample data: CAP-002 (MAC-003), CAP-003 (MAC-004), CAP-004 (WF-001) have 1 provider
    assert "CAP-002" in baseline_spofs
    assert "CAP-003" in baseline_spofs
    assert "CAP-004" in baseline_spofs
    # CAP-001 has 2 providers (MAC-001, MAC-002), so NOT baseline SPOF
    assert "CAP-001" not in baseline_spofs

    # Post failure of MAC-001: CAP-001 drops to 1 provider and becomes an SPOF
    post_spofs = detect_single_points_of_failure(sample_engine.graph, failed_resources=["MAC-001"])
    assert "CAP-001" in post_spofs


# ---------------------------------------------------------------------------
# 6. Alternative Resource Discovery
# ---------------------------------------------------------------------------


def test_alternative_resource_discovery(sample_engine: CapabilityEngine):
    """Verify alternative provider discovery with exclusions."""
    # For CAP-001 without failures
    all_alts = find_alternative_resources(sample_engine.graph, "CAP-001", excluded_resources=[])
    assert len(all_alts) == 2
    assert {a["id"] for a in all_alts} == {"MAC-001", "MAC-002"}

    # Exclude MAC-001
    alts_after_fail = find_alternative_resources(
        sample_engine.graph, "CAP-001", excluded_resources=["MAC-001"]
    )
    assert len(alts_after_fail) == 1
    assert alts_after_fail[0]["id"] == "MAC-002"

    # Exclude both
    alts_none = find_alternative_resources(
        sample_engine.graph, "CAP-001", excluded_resources=["MAC-001", "MAC-002"]
    )
    assert len(alts_none) == 0


# ---------------------------------------------------------------------------
# 7. Before vs After Comparison
# ---------------------------------------------------------------------------


def test_before_after_comparison(sample_engine: CapabilityEngine):
    """Verify before/after disruption comparison output."""
    comparison = compare_before_after(sample_engine.graph, "MAC-001")

    assert comparison["disruption"] == ["MAC-001"]
    diff = comparison["diff"]

    assert "CAP-001" in diff["status_changes"]
    assert diff["status_changes"]["CAP-001"]["before"] == "available"
    assert diff["status_changes"]["CAP-001"]["after"] == "at_risk"

    assert diff["redundancy_changes"]["CAP-001"]["before"] == 2
    assert diff["redundancy_changes"]["CAP-001"]["after"] == 1
    assert diff["redundancy_changes"]["CAP-001"]["delta"] == -1

    assert "CAP-001" in diff["newly_created_spofs"]
    assert "CAP-001" in diff["at_risk_capabilities"]


# ---------------------------------------------------------------------------
# 8. Invalid Resource ID Handling
# ---------------------------------------------------------------------------


def test_invalid_resource_id_raises_value_error(sample_engine: CapabilityEngine):
    """Verify engine raises ValueError on non-existent resource ID."""
    with pytest.raises(ValueError, match="does not exist"):
        sample_engine.analyze_disruption("NON_EXISTENT_RESOURCE_XYZ")


# ---------------------------------------------------------------------------
# 9. FastAPI REST API Endpoint Direct & In-Memory ASGI Tests
# ---------------------------------------------------------------------------


@pytest.mark.anyio
async def test_api_health_endpoint():
    """Test health_check() function returns valid service status and graph metrics."""
    result = await health_check()
    assert result["status"] == "healthy"
    assert result["service"] == "parallax-capability-engine"
    assert result["graph_stats"]["total_nodes"] > 0
    assert result["graph_stats"]["total_edges"] > 0


@pytest.mark.anyio
async def test_api_analyze_disruption_success():
    """Test analyze_disruption() endpoint handler returns complete DisruptionAnalysis."""
    req = DisruptionRequest(resource_id="SUP-001")
    analysis = await analyze_disruption(req)

    assert analysis.failed_resource["id"] == "SUP-001"
    assert isinstance(analysis.affected_resources, list)
    assert isinstance(analysis.affected_capabilities, list)
    assert isinstance(analysis.alternative_resources, list)
    assert isinstance(analysis.single_points_of_failure, list)
    assert analysis.summary["failed_resource_id"] == "SUP-001"


@pytest.mark.anyio
async def test_api_analyze_disruption_not_found():
    """Test analyze_disruption() endpoint handler raises 404 HTTPException for unknown resource."""
    req = DisruptionRequest(resource_id="INVALID-RES-999")
    with pytest.raises(HTTPException) as exc_info:
        await analyze_disruption(req)
    assert exc_info.value.status_code == 404
    assert "does not exist" in exc_info.value.detail


@pytest.mark.anyio
async def test_asgi_http_health_dispatch():
    """Test GET /health over standard ASGI interface."""
    status_code, body = await _dispatch_asgi_request("GET", "/health")
    assert status_code == 200
    assert body["status"] == "healthy"
    assert body["service"] == "parallax-capability-engine"
    assert "graph_stats" in body


@pytest.mark.anyio
async def test_asgi_http_analyze_disruption_dispatch():
    """Test POST /analyze-disruption over standard ASGI interface."""
    status_code, body = await _dispatch_asgi_request(
        "POST", "/analyze-disruption", body={"resource_id": "SUP-001"}
    )
    assert status_code == 200
    assert body["failed_resource"]["id"] == "SUP-001"
    assert isinstance(body["affected_resources"], list)
    assert isinstance(body["affected_capabilities"], list)
    assert isinstance(body["alternative_resources"], list)
    assert isinstance(body["single_points_of_failure"], list)
    assert isinstance(body["summary"], dict)


@pytest.mark.anyio
async def test_asgi_http_analyze_disruption_not_found():
    """Test POST /analyze-disruption with invalid resource returns 404 over ASGI."""
    status_code, body = await _dispatch_asgi_request(
        "POST", "/analyze-disruption", body={"resource_id": "UNKNOWN_ID_999"}
    )
    assert status_code == 404
    assert "does not exist" in body["detail"]
