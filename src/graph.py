"""Graph representation of supply chain capability and dependency topology."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Union
import networkx as nx


class CapabilityGraph:
    """Directed graph modeling supply chain entities and capability dependencies."""

    def __init__(self, name: str = "SupplyChainCapabilityGraph"):
        self.name = name
        self._graph = nx.DiGraph(name=name)

    @property
    def graph(self) -> nx.DiGraph:
        """Access the underlying NetworkX DiGraph instance."""
        return self._graph

    def add_node(
        self,
        node_id: str,
        node_type: str,
        name: Optional[str] = None,
        attributes: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        """Add a resource node to the graph.

        Args:
            node_id: Stable unique ID for the node.
            node_type: Type of resource (e.g. 'supplier', 'material', 'machine', 'capability').
            name: Optional human-readable name. Defaults to node_id if omitted.
            attributes: Optional metadata dictionary.
            **kwargs: Any additional custom node attributes.
        """
        node_data: Dict[str, Any] = {
            "id": node_id,
            "type": node_type.lower(),
            "name": name if name is not None else node_id,
            "attributes": attributes or {},
        }
        node_data.update(kwargs)
        self._graph.add_node(node_id, **node_data)

    def add_relationship(
        self,
        source_id: str,
        target_id: str,
        relationship_type: str = "depends_on",
        attributes: Optional[Dict[str, Any]] = None,
        **kwargs: Any,
    ) -> None:
        """Add a directed relationship between two resource nodes (source -> target).

        Args:
            source_id: Upstream provider/source resource ID.
            target_id: Downstream consumer/dependent resource or capability ID.
            relationship_type: Semantic relationship descriptor (e.g., 'supplies', 'provides').
            attributes: Optional edge metadata dictionary.
            **kwargs: Any additional custom edge attributes.
        """
        if not self._graph.has_node(source_id):
            raise ValueError(f"Source node '{source_id}' does not exist in graph.")
        if not self._graph.has_node(target_id):
            raise ValueError(f"Target node '{target_id}' does not exist in graph.")

        edge_data: Dict[str, Any] = {
            "relationship": relationship_type,
            "attributes": attributes or {},
        }
        edge_data.update(kwargs)
        self._graph.add_edge(source_id, target_id, **edge_data)

    def remove_resource(self, resource_id: str) -> None:
        """Remove a resource node and all its connected edges from the graph.

        Args:
            resource_id: Node ID to remove.
        """
        if self._graph.has_node(resource_id):
            self._graph.remove_node(resource_id)

    def has_node(self, node_id: str) -> bool:
        """Check if a node exists in the graph."""
        return self._graph.has_node(node_id)

    def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve node data dictionary by ID. Returns None if node does not exist."""
        if not self._graph.has_node(node_id):
            return None
        return dict(self._graph.nodes[node_id])

    def get_all_nodes(self) -> Dict[str, Dict[str, Any]]:
        """Retrieve all nodes in the graph as a dict mapping node_id -> node_data."""
        return {n: dict(self._graph.nodes[n]) for n in self._graph.nodes()}

    def get_nodes_by_type(self, node_type: str) -> List[Dict[str, Any]]:
        """Retrieve all nodes matching a specific node_type."""
        target_type = node_type.lower()
        return [
            dict(data)
            for _, data in self._graph.nodes(data=True)
            if data.get("type", "").lower() == target_type
        ]

    def get_all_capabilities(self) -> List[str]:
        """Return IDs of all capability nodes in the graph."""
        return [
            node_id
            for node_id, data in self._graph.nodes(data=True)
            if data.get("type", "").lower() == "capability"
        ]

    def get_dependencies(self, resource_id: str, recursive: bool = False) -> List[str]:
        """Get resources that `resource_id` depends on (upstream resources).

        Args:
            resource_id: The ID of the resource.
            recursive: If True, returns all upstream ancestor IDs. If False, returns direct predecessors.

        Returns:
            List of upstream resource IDs.
        """
        if not self._graph.has_node(resource_id):
            raise ValueError(f"Resource '{resource_id}' does not exist in graph.")

        if recursive:
            return list(nx.ancestors(self._graph, resource_id))
        return list(self._graph.predecessors(resource_id))

    def get_dependents(self, resource_id: str, recursive: bool = False) -> List[str]:
        """Get resources that depend on `resource_id` (downstream resources).

        Args:
            resource_id: The ID of the resource.
            recursive: If True, returns all downstream descendant IDs. If False, returns direct successors.

        Returns:
            List of downstream resource IDs.
        """
        if not self._graph.has_node(resource_id):
            raise ValueError(f"Resource '{resource_id}' does not exist in graph.")

        if recursive:
            return list(nx.descendants(self._graph, resource_id))
        return list(self._graph.successors(resource_id))

    def get_capability_providers(self, capability_id: str) -> List[str]:
        """Get all direct resource providers connected to the specified capability.

        Args:
            capability_id: ID of the capability node.

        Returns:
            List of provider resource IDs (direct predecessors of the capability).
        """
        if not self._graph.has_node(capability_id):
            raise ValueError(f"Capability '{capability_id}' does not exist in graph.")
        return list(self._graph.predecessors(capability_id))

    def get_capability_dependencies(self, capability_id: str) -> List[str]:
        """Get all upstream dependencies required to deliver a capability.

        Args:
            capability_id: ID of the capability node.

        Returns:
            List of all upstream ancestor resource IDs.
        """
        if not self._graph.has_node(capability_id):
            raise ValueError(f"Capability '{capability_id}' does not exist in graph.")
        return list(nx.ancestors(self._graph, capability_id))

    def load_from_dict(self, data: Dict[str, Any]) -> None:
        """Populate graph from a dictionary with 'nodes' and 'edges' lists."""
        self._graph.clear()
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])

        for node in nodes:
            node_id = node["id"]
            node_type = node.get("type", "unknown")
            name = node.get("name", node_id)
            attributes = node.get("attributes", {})
            self.add_node(node_id=node_id, node_type=node_type, name=name, attributes=attributes)

        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            rel = edge.get("relationship", edge.get("type", "depends_on"))
            attributes = edge.get("attributes", {})
            self.add_relationship(
                source_id=source, target_id=target, relationship_type=rel, attributes=attributes
            )

    def load_from_json(self, file_path: Union[str, Path]) -> None:
        """Load graph topology from a JSON file."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Supply chain data file not found: {file_path}")
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.load_from_dict(data)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize current graph topology to dictionary format."""
        nodes = [dict(data) for _, data in self._graph.nodes(data=True)]
        edges = [
            {
                "source": u,
                "target": v,
                "relationship": data.get("relationship", "depends_on"),
                "attributes": data.get("attributes", {}),
            }
            for u, v, data in self._graph.edges(data=True)
        ]
        return {"nodes": nodes, "edges": edges}

    def clone(self) -> "CapabilityGraph":
        """Create a deep clone of this CapabilityGraph."""
        cloned = CapabilityGraph(name=f"{self.name}_clone")
        cloned._graph = self._graph.copy()
        return cloned
