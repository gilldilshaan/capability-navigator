/**
 * PARALLAX — SAP service.
 *
 * High-level access to SAP source data: raw SAP-shaped payloads for
 * transparency (Integration page) and adapter-normalized domain objects for
 * the rest of the app. Provider binding is centralized here — today it binds
 * MockSAPDataProvider; a real OData/BTP provider would be swapped in this
 * file only, satisfying the same SAPDataProvider interface.
 */

import type { Factory, InventoryItem, Machine, Supplier, WorkforceRecord } from "@/types/parallax";
import type {
  SAPInventory,
  SAPMachine,
  SAPMaterial,
  SAPPlant,
  SAPSupplier,
  SAPWorkforce,
} from "./types";
import { sapConfig } from "./config";
import { mockSapDataProvider } from "./sapMockData";
import {
  adaptSapInventory,
  adaptSapMachine,
  adaptSapPlant,
  adaptSapSnapshot,
  adaptSapSupplier,
  adaptSapWorkforce,
} from "./sapAdapter";

/* ------------------------------------------------------------------ */
/* Provider binding — the single seam to replace for a live SAP system */
/* ------------------------------------------------------------------ */

const provider = mockSapDataProvider;

// A real implementation would satisfy SAPDataProvider over OData / BTP APIs:
//
// const liveSapDataProvider: SAPDataProvider = {
//   async getSuppliers() {
//     const res = await fetch(`${sapConfig.endpoint}/API_BusinessPartner/A_Supplier...`);
//     ...
//   },
// }

/* ------------------------------- raw SAP ---------------------------------- */

export async function getSapSuppliers(): Promise<SAPSupplier[]> {
  return provider.getSuppliers();
}
export async function getSapMaterials(): Promise<SAPMaterial[]> {
  return provider.getMaterials();
}
export async function getSapPlants(): Promise<SAPPlant[]> {
  return provider.getPlants();
}
export async function getSapMachines(): Promise<SAPMachine[]> {
  return provider.getMachines();
}
export async function getSapInventory(): Promise<SAPInventory[]> {
  return provider.getInventory();
}
export async function getSapWorkforce(): Promise<SAPWorkforce[]> {
  return provider.getWorkforce();
}

/* --------------------------- normalized domain ---------------------------- */

export interface SapNormalizedSnapshot {
  source: "SAP_S4HANA";
  mode: typeof sapConfig.mode;
  suppliers: Supplier[];
  factories: Factory[];
  machines: Machine[];
  inventory: InventoryItem[];
  workforce: WorkforceRecord[];
}

export async function getSapSuppliersNormalized(): Promise<Supplier[]> {
  return (await provider.getSuppliers()).map(adaptSapSupplier);
}

export async function getNormalizedSnapshot(): Promise<SapNormalizedSnapshot> {
  const adapted = await adaptSapSnapshot(provider);
  return { source: "SAP_S4HANA", mode: sapConfig.mode, ...adapted };
}

/** Convenience: single-entity normalized fetchers. */
export async function getSapPlantsNormalized(): Promise<Factory[]> {
  return (await provider.getPlants()).map(adaptSapPlant);
}
export async function getSapMachinesNormalized(): Promise<Machine[]> {
  return (await provider.getMachines()).map(adaptSapMachine);
}
export async function getSapInventoryNormalized(): Promise<InventoryItem[]> {
  return (await provider.getInventory()).map(adaptSapInventory);
}
export async function getSapWorkforceNormalized(): Promise<WorkforceRecord[]> {
  return (await provider.getWorkforce()).map(adaptSapWorkforce);
}

export { sapConfig, isSapDemoMode } from "./config";
