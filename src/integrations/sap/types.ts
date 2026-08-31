/**
 * PARALLAX — SAP integration types.
 *
 * SAP-shaped source entities (per the Enterprise Integration Fabric contract)
 * plus the provider interface that a real SAP implementation would satisfy.
 * Core fields follow the SAP integration contract; `demo` enrichment fields
 * are documented extensions the mock provider supplies so the adapter can
 * produce the full PARALLAX domain model without a real backend.
 *
 * IMPORTANT: the current provider is MockSAPDataProvider — nothing here
 * connects to a real SAP system. See sapConfig.
 */

export type SAPSourceSystem = "SAP_S4HANA" | "SAP_MM" | "SAP_PP" | "SAP_APO" | "SAP_HCM";

export type SAPConnectionMode = "demo" | "live";

export interface SAPConnectionConfig {
  mode: SAPConnectionMode;
  system: string;
  status: "simulated" | "connected";
  endpoint: string | null;
}

export interface SAPSupplier {
  supplierId: string;
  name: string;
  material: string;
  availability: "AVAILABLE" | "PARTIAL" | "OFFLINE";
  plant: string;
  sourceSystem: SAPSourceSystem;
  /* demo-provider enrichments — real S/4HANA BP/MM data would supply equivalents */
  region?: string;
  tier?: 1 | 2 | 3;
  capabilities?: string[];
  leadTimeDays?: number;
  certifications?: string[];
  constraints?: string;
}

export interface SAPMaterial {
  materialId: string;
  description: string;
  stock: number;
  unit: string;
  plant: string;
  sourceSystem: SAPSourceSystem;
  /* demo-provider enrichments */
  coversDays?: number;
  status?: "AVAILABLE" | "PARTIAL" | "AT RISK" | "OFFLINE" | "IDLE";
}

export interface SAPPlant {
  plantId: string;
  name: string;
  location: string;
  status: "AVAILABLE" | "PARTIAL" | "AT RISK" | "OFFLINE" | "IDLE";
  sourceSystem: SAPSourceSystem;
  /* demo-provider enrichments */
  freeCapacityPct?: number;
  lines?: number;
  capabilities?: string[];
  constraints?: string;
}

export interface SAPMachine {
  machineId: string;
  /** Human-readable capability label, per the SAP integration contract. */
  capability: string;
  availability: "AVAILABLE" | "PARTIAL" | "AT RISK" | "OFFLINE" | "IDLE";
  plant: string;
  sourceSystem: SAPSourceSystem;
  /* demo-provider enrichments */
  name?: string;
  capabilityId?: string;
  utilisationPct?: number;
  toleranceMicron?: number;
}

export interface SAPInventory {
  inventoryId: string;
  material: string;
  quantity: number;
  available: boolean;
  sourceSystem: SAPSourceSystem;
  /* demo-provider enrichments */
  name?: string;
  uom?: string;
  location?: string;
  coversDays?: number;
  status?: "AVAILABLE" | "PARTIAL" | "AT RISK" | "OFFLINE" | "IDLE";
}

export interface SAPWorkforce {
  employeeId: string;
  role: string;
  skills: string[];
  availability: "AVAILABLE" | "PARTIAL" | "AT RISK" | "OFFLINE" | "IDLE";
  sourceSystem: SAPSourceSystem;
  /* demo-provider enrichments */
  site?: string;
  /** Skill → proficiency 0-100; real SAP HCM data would differ in shape. */
  proficiencies?: Record<string, number>;
  compatibility?: number;
  trainingHours?: number;
  recommendation?: string;
}

/** Contract any SAP data source must satisfy — mock today, OData/BTP later. */
export interface SAPDataProvider {
  getSuppliers(): Promise<SAPSupplier[]>;
  getMaterials(): Promise<SAPMaterial[]>;
  getPlants(): Promise<SAPPlant[]>;
  getMachines(): Promise<SAPMachine[]>;
  getInventory(): Promise<SAPInventory[]>;
  getWorkforce(): Promise<SAPWorkforce[]>;
}

/** Status catalog for the Enterprise Integration Fabric page. */
export interface SAPSystemStatus {
  id: string;
  name: string;
  status: "DEMO MODE" | "NOT CONNECTED" | "OPTIONAL" | "DEMO ADAPTER" | "FUTURE EXTENSION";
  detail: string;
  simulated: boolean;
}
