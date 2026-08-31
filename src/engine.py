"""CapabilityEngine for end-to-end supply chain disruption and dependency impact analysis."""

from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Union
import networkx as nx

from src.analyzer import (
    calculate_capability_redundancy,
    detect_single_points_of_failure,
    find_alternative_resources,
)
from src.graph import CapabilityGraph
from src.models import (
    CapabilityImpact,
    CapabilityStatus,
    DisruptionAnalysis,
)


class CapabilityEngine:
    """Core engine responsible for analyzing supply-chain failures and capability dependencies."""

    def __init__(
        self,
        graph: Optional[CapabilityGraph] = None,
        data_path: Optional[Union[str, Path]] = None,
    ):
        """Initialize CapabilityEngine with a graph instance or data file.

        Args:
            graph: Existing CapabilityGraph instance.
            data_path: Optional path to JSON dataset file. If graph is not provided and data_path is
                omitted, attempts to load default data/sample_supply_chain.json if present.
        """
        if graph is not None:
            self.graph = graph
        else:
            self.graph = CapabilityGraph()
            if data_path:
                self.graph.load_from_json(data_path)
            else:
                default_path = (
                    Path(__file__).resolve().parent.parent / "data" / "sample_supply_chain.json"
                )
                if default_path.exists():
                    self.graph.load_from_json(default_path)

    def analyze_disruption(
        self,
        resource_id: str,
    ) -> DisruptionAnalysis:
        """Perform comprehensive disruption analysis when a resource fails.

        Traces downstream dependencies, determines capability impacts, evaluates
        remaining provider redundancy, finds alternative providers, and detects SPOFs.

        Args:
            resource_id: Unique ID of the failed resource.

        Returns:
            DisruptionAnalysis instance containing full impact assessment.

        Raises:
            ValueError: If resource_id does not exist in the graph.
        """
        # 1. Validate the resource
        if not self.graph.has_node(resource_id):
            raise ValueError(f"Resource '{resource_id}' does not exist in the capability graph.")

        # 2. Identify the failed resource details
        failed_resource_node = self.graph.get_node(resource_id) or {}
        failed_resource = dict(failed_resource_node)

        # 3. Trace downstream dependencies
        downstream_ids = self.graph.get_dependents(resource_id, recursive=True)
        incapacitated_set: Set[str] = {resource_id}.union(downstream_ids)

        # Affected non-capability resources
        affected_resources: List[Dict[str, Any]] = []
        for r_id in downstream_ids:
            node_data = self.graph.get_node(r_id)
            if node_data and node_data.get("type") != "capability":
                affected_resources.append(node_data)

        # 4. Identify affected capabilities
        all_capabilities = self.graph.get_all_capabilities()
        affected_capabilities: List[CapabilityImpact] = []
        alternative_resources: List[Dict[str, Any]] = []

        for cap_id in all_capabilities:
            impact = calculate_capability_redundancy(
                graph=self.graph,
                capability_id=cap_id,
                failed_resources=[resource_id],
            )

            # A capability is considered affected if it lost at least one provider
            # or if it was directly in the downstream path
            if (
                impact.status in (CapabilityStatus.AT_RISK, CapabilityStatus.LOST)
                or len(impact.lost_providers) > 0
                or cap_id in downstream_ids
            ):
                affected_capabilities.append(impact)

                # Identify alternative resources if capability still has active providers
                if impact.remaining_providers:
                    alt_nodes = find_alternative_resources(
                        graph=self.graph,
                        capability_id=cap_id,
                        excluded_resources=list(incapacitated_set),
                    )
                    alternative_resources.append(
                        {
                            "capability_id": cap_id,
                            "capability_name": impact.capability_name,
                            "alternative_providers": alt_nodes,
                        }
                    )

        # 5. Identify single points of failure post-disruption
        single_points_of_failure = detect_single_points_of_failure(
            graph=self.graph,
            failed_resources=[resource_id],
        )

        # 6. Summary metrics
        lost_count = sum(
            1 for c in affected_capabilities if c.status == CapabilityStatus.LOST
        )
        at_risk_count = sum(
            1 for c in affected_capabilities if c.status == CapabilityStatus.AT_RISK
        )
        available_count = sum(
            1 for c in affected_capabilities if c.status == CapabilityStatus.AVAILABLE
        )

        summary = {
            "failed_resource_id": resource_id,
            "total_affected_resources": len(affected_resources),
            "total_affected_capabilities": len(affected_capabilities),
            "at_risk_capabilities_count": at_risk_count,
            "lost_capabilities_count": lost_count,
            "available_capabilities_count": available_count,
            "single_points_of_failure_count": len(single_points_of_failure),
        }

        return DisruptionAnalysis(
            failed_resource=failed_resource,
            affected_resources=affected_resources,
            affected_capabilities=affected_capabilities,
            alternative_resources=alternative_resources,
            single_points_of_failure=single_points_of_failure,
            summary=summary,
        )
