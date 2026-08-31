"""Deterministic analysis functions for capability redundancy, alternatives, and SPOFs."""

from typing import Any, Dict, List, Optional, Set, Union
import networkx as nx

from src.graph import CapabilityGraph
from src.models import CapabilityImpact, CapabilityStatus


def _expand_incapacitated_resources(
    graph: CapabilityGraph,
    failed_resources: Optional[Union[List[str], Set[str]]] = None,
) -> Set[str]:
    """Given a set or list of failed resource IDs, expand them to include all downstream descendants.

    Args:
        graph: The CapabilityGraph instance.
        failed_resources: Resource IDs directly failed.

    Returns:
        Complete set of incapacitated resource IDs (failed + all downstream descendants).
    """
    if not failed_resources:
        return set()

    incapacitated = set(failed_resources)
    for res_id in failed_resources:
        if graph.has_node(res_id):
            descendants = nx.descendants(graph.graph, res_id)
            incapacitated.update(descendants)
    return incapacitated


def calculate_capability_redundancy(
    graph: CapabilityGraph,
    capability_id: str,
    failed_resources: Optional[Union[List[str], Set[str]]] = None,
) -> CapabilityImpact:
    """Calculate the operational redundancy and status for a specific capability.

    Args:
        graph: CapabilityGraph instance.
        capability_id: ID of the capability to analyze.
        failed_resources: Optional set/list of failed or disrupted resource IDs.

    Returns:
        CapabilityImpact model describing status, redundancy, lost, and remaining providers.
    """
    if not graph.has_node(capability_id):
        raise ValueError(f"Capability '{capability_id}' not found in graph.")

    node_data = graph.get_node(capability_id) or {}
    capability_name = node_data.get("name", capability_id)

    all_providers = graph.get_capability_providers(capability_id)
    initial_redundancy = len(all_providers)

    incapacitated_set = _expand_incapacitated_resources(graph, failed_resources)

    lost_providers = [p for p in all_providers if p in incapacitated_set]
    remaining_providers = [p for p in all_providers if p not in incapacitated_set]
    remaining_redundancy = len(remaining_providers)

    # Determine status according to specified rules:
    # - lost: zero valid providers
    # - at_risk: at least one provider remains, but disruption reduced redundancy
    # - available: disruption did not reduce effective provider availability
    if remaining_redundancy == 0:
        status = CapabilityStatus.LOST
    elif remaining_redundancy < initial_redundancy:
        status = CapabilityStatus.AT_RISK
    else:
        status = CapabilityStatus.AVAILABLE

    # SPOF rule: A capability is a single point of failure when only one currently available provider can provide it
    is_spof = remaining_redundancy == 1

    return CapabilityImpact(
        capability_id=capability_id,
        capability_name=capability_name,
        status=status,
        initial_redundancy=initial_redundancy,
        remaining_redundancy=remaining_redundancy,
        lost_providers=lost_providers,
        remaining_providers=remaining_providers,
        is_single_point_of_failure=is_spof,
    )


def find_alternative_resources(
    graph: CapabilityGraph,
    capability_id: str,
    excluded_resources: Optional[Union[List[str], Set[str]]] = None,
) -> List[Dict[str, Any]]:
    """Find functional alternative resource providers for a given capability.

    Args:
        graph: CapabilityGraph instance.
        capability_id: ID of the capability.
        excluded_resources: Resources that are failed or incapacitated.

    Returns:
        List of node data dictionaries for available alternative providers.
    """
    if not graph.has_node(capability_id):
        raise ValueError(f"Capability '{capability_id}' not found in graph.")

    all_providers = graph.get_capability_providers(capability_id)
    incapacitated_set = _expand_incapacitated_resources(graph, excluded_resources)

    alternatives = []
    for provider_id in all_providers:
        if provider_id not in incapacitated_set:
            node_info = graph.get_node(provider_id)
            if node_info:
                alternatives.append(node_info)

    return alternatives


def detect_single_points_of_failure(
    graph: CapabilityGraph,
    failed_resources: Optional[Union[List[str], Set[str]]] = None,
) -> List[str]:
    """Identify all capabilities that have exactly 1 active provider in the given state.

    Args:
        graph: CapabilityGraph instance.
        failed_resources: Optional set/list of failed or disrupted resources.

    Returns:
        List of capability IDs that are currently single points of failure.
    """
    capabilities = graph.get_all_capabilities()
    spofs: List[str] = []

    for cap_id in capabilities:
        impact = calculate_capability_redundancy(graph, cap_id, failed_resources)
        if impact.remaining_redundancy == 1:
            spofs.append(cap_id)

    return spofs


def compare_before_after(
    graph: CapabilityGraph,
    disruption: Union[str, List[str], Set[str]],
) -> Dict[str, Any]:
    """Compare capability status, redundancy, and SPOFs before and after a disruption.

    Args:
        graph: CapabilityGraph instance.
        disruption: Failed resource ID or collection of failed resource IDs.

    Returns:
        Comprehensive comparison dictionary of pre vs post disruption metrics.
    """
    failed_ids = [disruption] if isinstance(disruption, str) else list(disruption)
    all_caps = graph.get_all_capabilities()

    # Pre-disruption baseline
    before_status: Dict[str, Dict[str, Any]] = {}
    for cap_id in all_caps:
        impact = calculate_capability_redundancy(graph, cap_id, failed_resources=None)
        before_status[cap_id] = {
            "status": impact.status.value,
            "redundancy": impact.initial_redundancy,
            "is_spof": impact.is_single_point_of_failure,
            "providers": impact.remaining_providers,
        }

    # Post-disruption state
    after_status: Dict[str, Dict[str, Any]] = {}
    for cap_id in all_caps:
        impact = calculate_capability_redundancy(graph, cap_id, failed_resources=failed_ids)
        after_status[cap_id] = {
            "status": impact.status.value,
            "redundancy": impact.remaining_redundancy,
            "is_spof": impact.is_single_point_of_failure,
            "providers": impact.remaining_providers,
            "lost_providers": impact.lost_providers,
        }

    # Identify changes
    status_changes = {}
    redundancy_changes = {}
    newly_created_spofs = []
    lost_capabilities = []
    at_risk_capabilities = []

    for cap_id in all_caps:
        b = before_status[cap_id]
        a = after_status[cap_id]

        if b["status"] != a["status"]:
            status_changes[cap_id] = {"before": b["status"], "after": a["status"]}

        if b["redundancy"] != a["redundancy"]:
            redundancy_changes[cap_id] = {
                "before": b["redundancy"],
                "after": a["redundancy"],
                "delta": a["redundancy"] - b["redundancy"],
            }

        if not b["is_spof"] and a["is_spof"]:
            newly_created_spofs.append(cap_id)

        if a["status"] == CapabilityStatus.LOST.value:
            lost_capabilities.append(cap_id)
        elif a["status"] == CapabilityStatus.AT_RISK.value:
            at_risk_capabilities.append(cap_id)

    return {
        "disruption": failed_ids,
        "before": before_status,
        "after": after_status,
        "diff": {
            "status_changes": status_changes,
            "redundancy_changes": redundancy_changes,
            "newly_created_spofs": newly_created_spofs,
            "lost_capabilities": lost_capabilities,
            "at_risk_capabilities": at_risk_capabilities,
        },
    }
