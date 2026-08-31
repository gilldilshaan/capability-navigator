/**
 * PARALLAX — SAP integration barrel.
 *
 * Demo-mode architecture:
 *   SAP S/4HANA demo data → SAPDataProvider (mock) → SAPAdapter → PARALLAX domain
 */

export { sapConfig, isSapDemoMode, sapSystemCatalog } from "./config";
export { mockSapDataProvider } from "./sapMockData";
export {
  adaptSapInventory,
  adaptSapMachine,
  adaptSapPlant,
  adaptSapSnapshot,
  adaptSapSupplier,
  adaptSapWorkforce,
} from "./sapAdapter";
export {
  getNormalizedSnapshot,
  getSapInventory,
  getSapInventoryNormalized,
  getSapMachines,
  getSapMachinesNormalized,
  getSapMaterials,
  getSapPlants,
  getSapPlantsNormalized,
  getSapSuppliers,
  getSapSuppliersNormalized,
  getSapWorkforce,
  getSapWorkforceNormalized,
  type SapNormalizedSnapshot,
} from "./sapService";
export type {
  SAPConnectionConfig,
  SAPDataProvider,
  SAPInventory,
  SAPMachine,
  SAPMaterial,
  SAPPlant,
  SAPSourceSystem,
  SAPSupplier,
  SAPSystemStatus,
  SAPWorkforce,
} from "./types";
