import { factories, inventory, logisticsRoutes, machines, suppliers, workforce } from "../../data";
import type { WorkflowResource, WorkflowState } from "../schema";

const usable = (status: string) => status !== "OFFLINE";

export function runResourceDiscoveryStage(state: WorkflowState): WorkflowState {
  const capabilityIds = new Set(state.affectedCapabilities.map((capability) => capability.id));
  const resources: WorkflowResource[] = [
    ...suppliers
      .filter(
        (supplier) =>
          usable(supplier.status) &&
          supplier.id !== state.disruption?.supplierId &&
          supplier.capabilities.some((id) => capabilityIds.has(id)),
      )
      .map((supplier) => ({
        id: supplier.id,
        kind: "supplier" as const,
        name: supplier.name,
        status: supplier.status,
        capabilityIds: supplier.capabilities.filter((id) => capabilityIds.has(id)),
        metrics: { leadTimeDays: supplier.leadTimeDays },
        rationale: `Provides ${supplier.capabilities.filter((id) => capabilityIds.has(id)).length} affected capability inputs.`,
      })),
    ...factories
      .filter(
        (factory) =>
          usable(factory.status) && factory.capabilities.some((id) => capabilityIds.has(id)),
      )
      .map((factory) => ({
        id: factory.id,
        kind: "factory" as const,
        name: factory.name,
        status: factory.status,
        capabilityIds: factory.capabilities.filter((id) => capabilityIds.has(id)),
        metrics: { freeCapacityPct: factory.freeCapacityPct },
        rationale: `${factory.freeCapacityPct}% free capacity.`,
      })),
    ...machines
      .filter((machine) => usable(machine.status) && capabilityIds.has(machine.capability))
      .map((machine) => ({
        id: machine.id,
        kind: "machine" as const,
        name: machine.name,
        status: machine.status,
        capabilityIds: [machine.capability],
        metrics: { freeCapacityPct: 100 - machine.utilisationPct },
        rationale: `${100 - machine.utilisationPct}% unutilised capacity.`,
      })),
    ...inventory
      .filter((item) => usable(item.status))
      .map((item) => ({
        id: item.id,
        kind: "inventory" as const,
        name: item.name,
        status: item.status,
        capabilityIds: [],
        metrics: { coversDays: item.coversDays },
        rationale: `Covers ${item.coversDays} days at ${item.location}.`,
      })),
    ...workforce
      .filter((person) => person.compatibility >= 70)
      .map((person) => ({
        id: person.id,
        kind: "workforce" as const,
        name: person.role,
        status: "AVAILABLE",
        capabilityIds: ["CAP-WPK-007"],
        metrics: { compatibility: person.compatibility },
        rationale: `${person.compatibility}% compatibility.`,
      })),
    ...logisticsRoutes
      .filter((route) => usable(route.status) && route.coldChain)
      .map((route) => ({
        id: route.id,
        kind: "route" as const,
        name: `${route.from} → ${route.to}`,
        status: route.status,
        capabilityIds: ["CAP-CCH-003", "CAP-RLG-005"],
        metrics: { transitHours: route.transitHours },
        rationale: `${route.transitHours}h cold-chain transit.`,
      })),
  ];
  return {
    ...state,
    availableResources: resources,
    trace: [
      ...state.trace,
      {
        stage: "RESOURCE_DISCOVERY",
        status: "COMPLETE",
        summary: `${resources.length} usable resources discovered from live workflow inputs.`,
      },
    ],
  };
}
