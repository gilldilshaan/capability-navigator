/**
 * PARALLAX — MockSAPDataProvider.
 *
 * Emits SAP-shaped demo entities. The entities are derived from the same
 * seeded facts as the PARALLAX demo data set (src/lib/parallax/data.ts) so the
 * whole story stays coherent: one fictional enterprise, viewed through the
 * SAP source-system lens. All companies/plants/IDs are fictional.
 */

import type {
  SAPDataProvider,
  SAPInventory,
  SAPMachine,
  SAPMaterial,
  SAPPlant,
  SAPSupplier,
  SAPWorkforce,
} from "./types";
import {
  factories,
  inventory,
  logisticsRoutes as _logisticsRoutes,
  machines,
  suppliers,
  workforce,
} from "@/lib/parallax/data";

void _logisticsRoutes;

const capabilityLabels: Record<string, string> = {
  "CAP-THS-017": "ThermoShield Packaging",
  "CAP-POL-001": "Polymer Material Supply",
  "CAP-QCF-002": "Quality Certification",
  "CAP-CCH-003": "Cold-Chain Handling",
  "CAP-PPC-004": "Precision Polymer Certification",
  "CAP-RLG-005": "Regional Logistics",
  "CAP-TRS-006": "Temperature Resistance",
  "CAP-WPK-007": "Packaging Workforce",
  "CAP-PRF-008": "Precision Forming",
  "CAP-CFM-009": "Barrier Film Lamination",
};

/** Key material master entries for the demo enterprise. */
const materials: SAPMaterial[] = [
  {
    materialId: "MAT-THS-017",
    description: "ThermoShield Packaging Material",
    stock: 12400,
    unit: "EA",
    plant: "FAC-02",
    sourceSystem: "SAP_MM",
    status: "AVAILABLE",
    coversDays: 9,
  },
  {
    materialId: "MAT-CFM-009",
    description: "Barrier Packaging Film 480mm",
    stock: 5200,
    unit: "EA",
    plant: "FAC-02",
    sourceSystem: "SAP_MM",
    status: "AVAILABLE",
    coversDays: 21,
  },
  {
    materialId: "MAT-CCH-003",
    description: "Cold Seal Adhesive",
    stock: 780,
    unit: "KG",
    plant: "FAC-02",
    sourceSystem: "SAP_MM",
    status: "AVAILABLE",
    coversDays: 14,
  },
  {
    materialId: "MAT-POL-001",
    description: "ThermoShield-Grade Polymer Resin",
    stock: 1840,
    unit: "KG",
    plant: "FAC-03",
    sourceSystem: "SAP_MM",
    status: "AVAILABLE",
    coversDays: 9,
  },
];

/** MockSAPDataProvider — the only provider implementation in this build. */
export const mockSapDataProvider: SAPDataProvider = {
  async getSuppliers(): Promise<SAPSupplier[]> {
    return suppliers.map((s) => ({
      supplierId: s.id,
      name: s.name,
      material: s.capabilities.includes("CAP-THS-017")
        ? "ThermoShield Packaging Module"
        : (capabilityLabels[s.capabilities[0] ?? ""] ?? "General components"),
      availability:
        s.status === "AVAILABLE" || s.status === "PARTIAL" || s.status === "OFFLINE"
          ? s.status
          : "AVAILABLE",
      plant: "FAC-02",
      sourceSystem: "SAP_S4HANA",
      region: s.region,
      tier: s.tier,
      capabilities: s.capabilities,
      leadTimeDays: s.leadTimeDays,
      certifications: s.certifications,
      constraints: s.constraints,
    }));
  },

  async getMaterials(): Promise<SAPMaterial[]> {
    return materials;
  },

  async getPlants(): Promise<SAPPlant[]> {
    return factories.map((f) => ({
      plantId: f.id,
      name: f.name,
      location: f.location,
      status: f.status,
      sourceSystem: "SAP_S4HANA",
      freeCapacityPct: f.freeCapacityPct,
      lines: f.lines,
      capabilities: f.capabilities,
      constraints: f.constraints,
    }));
  },

  async getMachines(): Promise<SAPMachine[]> {
    return machines.map((m) => ({
      machineId: m.id,
      capability: capabilityLabels[m.capability] ?? m.capability,
      availability: m.status,
      plant: m.factoryId,
      sourceSystem: "SAP_PP",
      name: m.name,
      capabilityId: m.capability,
      utilisationPct: m.utilisationPct,
      toleranceMicron: m.toleranceMicron,
    }));
  },

  async getInventory(): Promise<SAPInventory[]> {
    return inventory.map((i) => ({
      inventoryId: i.id,
      material: i.name,
      quantity: i.units,
      available: i.status === "AVAILABLE",
      sourceSystem: "SAP_MM",
      name: i.name,
      uom: i.uom.toUpperCase(),
      location: i.location,
      coversDays: i.coversDays,
      status: i.status,
    }));
  },

  async getWorkforce(): Promise<SAPWorkforce[]> {
    return workforce.map((w) => ({
      employeeId: w.id,
      role: w.role,
      skills: [
        w.machineOperation >= 70 && "Machine Operation",
        w.qualityInspection >= 70 && "Quality Inspection",
        w.precisionForming >= 70 && "Precision Forming",
        w.coldChain >= 70 && "Cold-Chain Handling",
      ].filter((x): x is string => typeof x === "string"),
      availability: w.compatibility >= 70 ? "AVAILABLE" : "PARTIAL",
      sourceSystem: "SAP_HCM",
      site: w.site,
      proficiencies: {
        machineOperation: w.machineOperation,
        qualityInspection: w.qualityInspection,
        precisionForming: w.precisionForming,
        coldChain: w.coldChain,
        compatibility: w.compatibility,
      },
      compatibility: w.compatibility,
      trainingHours: w.trainingHours,
      recommendation: w.recommendation,
    }));
  },
};
