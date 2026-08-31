"""Pydantic models for the Capability Graph and Dependency Engine."""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ResourceType(str, Enum):
    """Resource types supported in the supply chain capability model."""

    SUPPLIER = "supplier"
    MATERIAL = "material"
    FACTORY = "factory"
    MACHINE = "machine"
    WORKFORCE = "workforce"
    CAPABILITY = "capability"


class CapabilityStatus(str, Enum):
    """Capability status outcomes following a disruption."""

    AVAILABLE = "available"
    AT_RISK = "at_risk"
    LOST = "lost"


class ResourceNode(BaseModel):
    """Generic base representation of any node in the graph."""

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    id: str = Field(..., description="Unique resource identifier")
    name: str = Field(..., description="Human-readable resource name")
    type: str = Field(..., description="Type of resource")
    attributes: Dict[str, Any] = Field(
        default_factory=dict, description="Arbitrary resource attributes/metadata"
    )


class Supplier(ResourceNode):
    """Supplier entity in the supply chain."""

    type: str = Field(default=ResourceType.SUPPLIER.value)


class Material(ResourceNode):
    """Material or intermediate component in the supply chain."""

    type: str = Field(default=ResourceType.MATERIAL.value)


class Factory(ResourceNode):
    """Manufacturing facility or production plant."""

    type: str = Field(default=ResourceType.FACTORY.value)


class Machine(ResourceNode):
    """Machine or equipment resource within a factory."""

    type: str = Field(default=ResourceType.MACHINE.value)


class Workforce(ResourceNode):
    """Workforce crew, labor team, or operational unit."""

    type: str = Field(default=ResourceType.WORKFORCE.value)


class Capability(ResourceNode):
    """Operational or manufacturing capability delivered by resources."""

    type: str = Field(default=ResourceType.CAPABILITY.value)


class ResourceFailure(BaseModel):
    """Model representing an initiated or simulated resource failure."""

    resource_id: str = Field(..., description="ID of the failed resource")
    reason: Optional[str] = Field(default=None, description="Optional failure reason or trigger")
    timestamp: Optional[str] = Field(default=None, description="Timestamp of the disruption")


class CapabilityImpact(BaseModel):
    """Detailed disruption impact on a specific capability."""

    capability_id: str = Field(..., description="Capability ID")
    capability_name: str = Field(..., description="Capability name")
    status: CapabilityStatus = Field(
        ..., description="Capability status: available, at_risk, or lost"
    )
    initial_redundancy: int = Field(
        ..., description="Baseline number of active providers before failure"
    )
    remaining_redundancy: int = Field(
        ..., description="Remaining number of active providers after failure"
    )
    lost_providers: List[str] = Field(
        default_factory=list, description="IDs of providers incapacitated by the disruption"
    )
    remaining_providers: List[str] = Field(
        default_factory=list, description="IDs of still-operational alternative providers"
    )
    is_single_point_of_failure: bool = Field(
        ..., description="True if capability has exactly 1 remaining active provider"
    )


class AlternativeResource(BaseModel):
    """Alternative active resources capable of providing a capability."""

    capability_id: str = Field(..., description="Capability ID")
    capability_name: Optional[str] = Field(default=None, description="Capability name")
    alternative_providers: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="List of alternative provider resource definitions still functional",
    )


class DisruptionSummary(BaseModel):
    """High-level summary metrics of a disruption analysis."""

    failed_resource_id: str
    total_affected_resources: int
    total_affected_capabilities: int
    available_capabilities: int
    at_risk_capabilities: int
    lost_capabilities: int
    single_points_of_failure_count: int


class DisruptionAnalysis(BaseModel):
    """Complete disruption analysis output response."""

    failed_resource: Dict[str, Any] = Field(
        ..., description="Information on the primary failed resource"
    )
    affected_resources: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="All downstream supply chain resources affected by the failure",
    )
    affected_capabilities: List[CapabilityImpact] = Field(
        default_factory=list,
        description="Detailed impact evaluation for affected capabilities",
    )
    alternative_resources: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Available alternative resources for impacted capabilities",
    )
    single_points_of_failure: List[str] = Field(
        default_factory=list,
        description="Capability IDs that currently have only 1 active provider (SPOF)",
    )
    summary: Dict[str, Any] = Field(
        default_factory=dict, description="Summary statistics of the disruption"
    )


class DisruptionRequest(BaseModel):
    """Input payload for POST /analyze-disruption."""

    resource_id: str = Field(..., description="ID of the resource to simulate disruption on")
