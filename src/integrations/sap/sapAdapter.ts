/**
 * PARALLAX — SAP adapter.
 *
 * Normalizes SAP-shaped source entities into the PARALLAX domain model
 * (src/types/parallax.ts). This is the layer that makes the frontend
 * SAP-ready: the capability graph, resource discovery and recovery
 * simulation only ever see domain objects, never SAP payloads.
 *
 *   SAP S/4HANA demo data → SAP Data Provider → SAP Adapter → PARALLAX domain
 */

import type { InventoryItem, Machine, Supplier, WorkforceRecord } from "@/types/parallax";
import type { Factory } from "@/types/parallax";
import type {
  SAPInventory,
  SAPMachine,
  SAPMaterial,
  SAPPlant,
  SAPSupplier,
  SAPWorkforce,
} from "./types";

export function adaptSapSupplier(e: SAPSupplier): Supplier {
  return {
    id: e.supplierId,
    name: e.name,
    region: e.region ?? e.plant,
    status: e.availability,
    tier: e.tier ?? 3,
    capabilities: e.capabilities ?? [],
    leadTimeDays: e.leadTimeDays ?? 0,
    certifications: e.certifications ?? [],
    constraints: e.constraints ?? "—",
  };
}

export function adaptSapPlant(e: SAPPlant): Factory {
  return {
    id: e.plantId,
    name: e.name,
    location: e.location,
    status: e.status,
    freeCapacityPct: e.freeCapacityPct ?? 0,
    lines: e.lines ?? 0,
    capabilities: e.capabilities ?? [],
    constraints: e.constraints ?? "—",
  };
}

export function adaptSapMachine(e: SAPMachine): Machine {
  return {
    id: e.machineId,
    name: e.name ?? e.machineId,
    factoryId: e.plant,
    status: e.availability,
    utilisationPct: e.utilisationPct ?? 0,
    capability: e.capabilityId ?? e.capability,
    toleranceMicron: e.toleranceMicron ?? 0,
  };
}

export function adaptSapInventory(e: SAPInventory): InventoryItem {
  return {
    id: e.inventoryId,
    name: e.name ?? e.material,
    units: e.quantity,
    uom: (e.uom ?? "ea").toLowerCase(),
    location: e.location ?? "Unassigned",
    status: e.status ?? (e.available ? "AVAILABLE" : "AT RISK"),
    coversDays: e.coversDays ?? 0,
  };
}

export function adaptSapWorkforce(e: SAPWorkforce): WorkforceRecord {
  const p = e.proficiencies ?? {};
  return {
    id: e.employeeId,
    role: e.role,
    site: e.site ?? "—",
    compatibility: p["compatibility"] ?? e.compatibility ?? 0,
    machineOperation: p["machineOperation"] ?? 0,
    qualityInspection: p["qualityInspection"] ?? 0,
    precisionForming: p["precisionForming"] ?? 0,
    coldChain: p["coldChain"] ?? 0,
    trainingHours: e.trainingHours ?? 0,
    recommendation: e.recommendation ?? "—",
  };
}

/** All five collections in one round-trip — what a real OData $batch would return. */
export async function adaptSapSnapshot(provider: {
  getSuppliers(): Promise<SAPSupplier[]>;
  getMaterials(): Promise<SAPMaterial[]>;
  getPlants(): Promise<SAPPlant[]>;
  getMachines(): Promise<SAPMachine[]>;
  getInventory(): Promise<SAPInventory[]>;
  getWorkforce(): Promise<SAPWorkforce[]>;
}) {
  const [suppliers, plants, machines, inventory, workforce] = await Promise.all([
    provider.getSuppliers(),
    provider.getPlants(),
    provider.getMachines(),
    provider.getInventory(),
    provider.getWorkforce(),
  ]);
  return {
    suppliers: suppliers.map(adaptSapSupplier),
    factories: plants.map(adaptSapPlant),
    machines: machines.map(adaptSapMachine),
    inventory: inventory.map(adaptSapInventory),
    workforce: workforce.map(adaptSapWorkforce),
  };
}
