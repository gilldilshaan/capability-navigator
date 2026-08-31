import type {
  ApprovalRequest,
  Capability,
  Disruption,
  DisruptionSeverity,
  DisruptionStatus,
  Factory,
  InventoryItem,
  LogisticsRoute,
  Machine,
  Supplier,
  WorkforceRecord,
} from "@/types/parallax";

import type {
  ApprovalRequestRow,
  CapabilityRow,
  DisruptionRow,
  FactoryRow,
  InventoryRow,
  LogisticsRouteRow,
  MachineRow,
  SupplierRow,
  WorkforceRow,
} from "../db/schema";

/**
 * Row → canonical API interface mappers.
 *
 * Every function strips internal columns (createdAt/updatedAt) and unwraps JSON
 * columns so the HTTP response exactly matches the interfaces in
 * src/types/parallax.ts.
 */

export function toSupplier(row: SupplierRow): Supplier {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    status: row.status,
    tier: row.tier as 1 | 2 | 3,
    capabilities: row.capabilities,
    leadTimeDays: row.leadTimeDays,
    certifications: row.certifications,
    constraints: row.constraints,
  };
}

export function toFactory(row: FactoryRow): Factory {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    status: row.status,
    freeCapacityPct: row.freeCapacityPct,
    lines: row.lines,
    capabilities: row.capabilities,
    constraints: row.constraints,
  };
}

export function toMachine(row: MachineRow): Machine {
  return {
    id: row.id,
    name: row.name,
    factoryId: row.factoryId,
    status: row.status,
    utilisationPct: row.utilisationPct,
    capability: row.capability,
    toleranceMicron: row.toleranceMicron,
  };
}

export function toInventoryItem(row: InventoryRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    units: row.units,
    uom: row.uom,
    location: row.location,
    status: row.status,
    coversDays: row.coversDays,
  };
}

export function toWorkforceRecord(row: WorkforceRow): WorkforceRecord {
  return {
    id: row.id,
    role: row.role,
    site: row.site,
    compatibility: row.compatibility,
    machineOperation: row.machineOperation,
    qualityInspection: row.qualityInspection,
    precisionForming: row.precisionForming,
    coldChain: row.coldChain,
    trainingHours: row.trainingHours,
    recommendation: row.recommendation,
  };
}

export function toLogisticsRoute(row: LogisticsRouteRow): LogisticsRoute {
  return {
    id: row.id,
    from: row.from,
    to: row.to,
    mode: row.mode,
    status: row.status,
    transitHours: row.transitHours,
    coldChain: row.coldChain,
    constraints: row.constraints,
  };
}

export function toCapability(row: CapabilityRow, requirements: string[]): Capability {
  return {
    id: row.id,
    name: row.name,
    requirements,
    redundancy: row.redundancy,
    targetRedundancy: row.targetRedundancy,
    status: row.status,
    owner: row.owner,
  };
}

export function toDisruption(row: DisruptionRow): Disruption {
  return {
    id: row.id,
    title: row.title,
    ...(row.supplierId ? { supplierId: row.supplierId } : {}),
    ...(row.supplier ? { supplier: row.supplier } : {}),
    ...(row.component ? { component: row.component } : {}),
    ...(row.dependency ? { dependency: row.dependency } : {}),
    ...(row.capabilityId ? { capabilityId: row.capabilityId } : {}),
    severity: row.severity as DisruptionSeverity,
    detectedAt: row.detectedAt,
    ...(row.impactHours != null ? { impactHours: row.impactHours } : {}),
    ...(row.impact ? { impact: row.impact } : {}),
    ...(row.affectedSkus != null ? { affectedSkus: row.affectedSkus } : {}),
    ...(row.exposedUnits ? { exposedUnits: row.exposedUnits } : {}),
    ...(row.status ? { status: row.status as DisruptionStatus } : {}),
  };
}

export function toApprovalRequest(row: ApprovalRequestRow): ApprovalRequest {
  return {
    id: row.id,
    disruptionId: row.disruptionId,
    ...(row.workflowId ? { workflowId: row.workflowId } : {}),
    pathId: row.pathId,
    recommendation: row.recommendation ?? "",
    ...(row.complianceStatus ? { complianceStatus: row.complianceStatus } : {}),
    status: row.status as ApprovalRequest["status"],
    requestedAt: row.requestedAt,
    ...(row.decidedBy ? { decidedBy: row.decidedBy } : {}),
    ...(row.decidedAt ? { decidedAt: row.decidedAt } : {}),
    ...(row.note ? { note: row.note } : {}),
  };
}