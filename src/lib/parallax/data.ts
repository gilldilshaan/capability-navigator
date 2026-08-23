/**
 * PARALLAX — illustrative enterprise data set.
 * All companies, plants, IDs and people are fictional. Demo environment only.
 */

export type Availability = "AVAILABLE" | "PARTIAL" | "AT RISK" | "OFFLINE" | "IDLE";

export interface Supplier {
  id: string;
  name: string;
  region: string;
  status: Availability;
  tier: 1 | 2 | 3;
  capabilities: string[];
  leadTimeDays: number;
  certifications: string[];
  constraints: string;
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  status: Availability;
  freeCapacityPct: number;
  lines: number;
  capabilities: string[];
  constraints: string;
}

export interface Machine {
  id: string;
  name: string;
  factoryId: string;
  status: Availability;
  utilisationPct: number;
  capability: string;
  toleranceMicron: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  units: number;
  uom: string;
  location: string;
  status: Availability;
  coversDays: number;
}

export interface WorkforceRecord {
  id: string;
  role: string;
  site: string;
  compatibility: number;
  machineOperation: number;
  qualityInspection: number;
  precisionForming: number;
  coldChain: number;
  trainingHours: number;
  recommendation: string;
}

export interface LogisticsRoute {
  id: string;
  from: string;
  to: string;
  mode: string;
  status: Availability;
  transitHours: number;
  coldChain: boolean;
  constraints: string;
}

export interface Capability {
  id: string;
  name: string;
  requirements: string[];
  redundancy: number;
  targetRedundancy: number;
  status: Availability;
  owner: string;
}

export interface AgentDef {
  id: string;
  code: string;
  name: string;
  queuedMessage: string;
  runningMessage: string;
  doneMessage: string;
  durationMs: number;
}

export interface PathFactor {
  key: string;
  label: string;
  weight: number;
  score: number;
  note: string;
}

export interface RecoveryPath {
  id: "A" | "B" | "C";
  title: string;
  strategy: string;
  composition: string[];
  recoveryDays: number;
  costLakh: number;
  risk: "Medium" | "Medium-Low" | "LOW";
  capacityCoveragePct: number;
  dependencyConcentration: string;
  compliance: string;
  factors: PathFactor[];
  chain: string[];
  rationale: string;
}

/* ------------------------------- SUPPLIERS ------------------------------- */

export const suppliers: Supplier[] = [
  {
    id: "SUP-1001",
    name: "MedCore Components Ltd.",
    region: "Pune, IN",
    status: "OFFLINE",
    tier: 1,
    capabilities: ["CAP-THS-017", "CAP-PPC-004"],
    leadTimeDays: 12,
    certifications: ["ISO 15378", "Precision Polymer Certification"],
    constraints: "Sole-source for ThermoShield module. Plant shutdown, indefinite.",
  },
  {
    id: "SUP-1002",
    name: "BioPack Systems",
    region: "Ahmedabad, IN",
    status: "AVAILABLE",
    tier: 1,
    capabilities: ["CAP-THS-017", "CAP-QCF-002"],
    leadTimeDays: 14,
    certifications: ["ISO 15378", "Precision Polymer Certification"],
    constraints: "Qualification audit required before first shipment.",
  },
  {
    id: "SUP-1003",
    name: "NorthStar Materials",
    region: "Chandigarh, IN",
    status: "AVAILABLE",
    tier: 2,
    capabilities: ["CAP-POL-001", "CAP-TRS-006"],
    leadTimeDays: 4,
    certifications: ["ISO 9001", "Precision Polymer Certification"],
    constraints: "Max 2,400 units/week of ThermoShield-grade resin.",
  },
  {
    id: "SUP-1004",
    name: "Aegis Polymers",
    region: "Vadodara, IN",
    status: "AVAILABLE",
    tier: 2,
    capabilities: ["CAP-POL-001"],
    leadTimeDays: 6,
    certifications: ["ISO 9001", "Precision Polymer Certification"],
    constraints: "Certification renewal due in 61 days.",
  },
  {
    id: "SUP-1005",
    name: "Helix Substrates",
    region: "Hyderabad, IN",
    status: "AVAILABLE",
    tier: 2,
    capabilities: ["CAP-POL-001", "CAP-CFM-009"],
    leadTimeDays: 9,
    certifications: ["Precision Polymer Certification"],
    constraints: "Shares certifying lab with Aegis Polymers.",
  },
  {
    id: "SUP-1006",
    name: "Cryolink Logistics",
    region: "Delhi NCR, IN",
    status: "AVAILABLE",
    tier: 2,
    capabilities: ["CAP-CCH-003", "CAP-RLG-005"],
    leadTimeDays: 1,
    certifications: ["GDP Cold Chain"],
    constraints: "Reefer fleet at 78% commitment.",
  },
  {
    id: "SUP-1007",
    name: "Meridian Sterile Supply",
    region: "Chennai, IN",
    status: "PARTIAL",
    tier: 2,
    capabilities: ["CAP-QCF-002"],
    leadTimeDays: 11,
    certifications: ["ISO 15378"],
    constraints: "Sterile line under revalidation until day 21.",
  },
  {
    id: "SUP-1008",
    name: "Vantage Toolworks",
    region: "Coimbatore, IN",
    status: "AVAILABLE",
    tier: 3,
    capabilities: ["CAP-PRF-008"],
    leadTimeDays: 8,
    certifications: ["ISO 9001"],
    constraints: "Tooling only; no volume forming capacity.",
  },
  {
    id: "SUP-1009",
    name: "Solstice Films",
    region: "Surat, IN",
    status: "AVAILABLE",
    tier: 3,
    capabilities: ["CAP-CFM-009"],
    leadTimeDays: 5,
    certifications: ["ISO 9001"],
    constraints: "Film width limited to 480 mm.",
  },
  {
    id: "SUP-1010",
    name: "Orbit Labs Certification",
    region: "Mumbai, IN",
    status: "PARTIAL",
    tier: 3,
    capabilities: ["CAP-PPC-004"],
    leadTimeDays: 15,
    certifications: ["Precision Polymer Certification"],
    constraints: "Single accredited lab serving 5 tier-1/2 suppliers.",
  },
];

/* -------------------------------- FACTORIES ------------------------------- */

export const factories: Factory[] = [
  {
    id: "FAC-02",
    name: "Plant 02",
    location: "Chandigarh, IN",
    status: "AVAILABLE",
    freeCapacityPct: 72,
    lines: 4,
    capabilities: ["CAP-PRF-008", "CAP-THS-017", "CAP-QCF-002"],
    constraints: "Cleanroom class D on lines 2–3.",
  },
  {
    id: "FAC-04",
    name: "Plant 04",
    location: "Baddi, IN",
    status: "AVAILABLE",
    freeCapacityPct: 41,
    lines: 3,
    capabilities: ["CAP-THS-017", "CAP-CFM-009"],
    constraints: "Shared changeover window with parenteral line.",
  },
  {
    id: "FAC-01",
    name: "Plant 01",
    location: "Pune, IN",
    status: "PARTIAL",
    freeCapacityPct: 12,
    lines: 5,
    capabilities: ["CAP-QCF-002"],
    constraints: "Committed to oncology packaging through Q3.",
  },
  {
    id: "FAC-03",
    name: "Plant 03",
    location: "Vizag, IN",
    status: "AVAILABLE",
    freeCapacityPct: 58,
    lines: 2,
    capabilities: ["CAP-POL-001"],
    constraints: "No cold-chain staging area on site.",
  },
  {
    id: "FAC-05",
    name: "Plant 05",
    location: "Indore, IN",
    status: "AT RISK",
    freeCapacityPct: 27,
    lines: 3,
    capabilities: ["CAP-CFM-009", "CAP-PRF-008"],
    constraints: "Monsoon power derating advisory active.",
  },
  {
    id: "FAC-06",
    name: "Plant 06 (Contract)",
    location: "Nashik, IN",
    status: "AVAILABLE",
    freeCapacityPct: 64,
    lines: 2,
    capabilities: ["CAP-THS-017"],
    constraints: "Contract manufacturer; 10-day qualification.",
  },
];

/* -------------------------------- MACHINES -------------------------------- */

export const machines: Machine[] = [
  { id: "CNC-17", name: "CNC-17 Precision Former", factoryId: "FAC-02", status: "IDLE", utilisationPct: 8, capability: "CAP-PRF-008", toleranceMicron: 12 },
  { id: "FORM-08", name: "FORM-08 Thermoformer", factoryId: "FAC-02", status: "AVAILABLE", utilisationPct: 34, capability: "CAP-THS-017", toleranceMicron: 25 },
  { id: "CNC-09", name: "CNC-09 Precision Former", factoryId: "FAC-04", status: "AVAILABLE", utilisationPct: 51, capability: "CAP-PRF-008", toleranceMicron: 18 },
  { id: "FORM-11", name: "FORM-11 Thermoformer", factoryId: "FAC-04", status: "PARTIAL", utilisationPct: 77, capability: "CAP-THS-017", toleranceMicron: 30 },
  { id: "SEAL-04", name: "SEAL-04 Cold Seal Unit", factoryId: "FAC-02", status: "AVAILABLE", utilisationPct: 44, capability: "CAP-CCH-003", toleranceMicron: 40 },
  { id: "SEAL-06", name: "SEAL-06 Cold Seal Unit", factoryId: "FAC-06", status: "AVAILABLE", utilisationPct: 22, capability: "CAP-CCH-003", toleranceMicron: 45 },
  { id: "QC-SCAN-03", name: "QC-SCAN-03 Vision Inspector", factoryId: "FAC-02", status: "AVAILABLE", utilisationPct: 39, capability: "CAP-QCF-002", toleranceMicron: 5 },
  { id: "QC-SCAN-05", name: "QC-SCAN-05 Vision Inspector", factoryId: "FAC-01", status: "PARTIAL", utilisationPct: 88, capability: "CAP-QCF-002", toleranceMicron: 5 },
  { id: "EXT-02", name: "EXT-02 Resin Extruder", factoryId: "FAC-03", status: "AVAILABLE", utilisationPct: 46, capability: "CAP-POL-001", toleranceMicron: 60 },
  { id: "EXT-05", name: "EXT-05 Resin Extruder", factoryId: "FAC-05", status: "AT RISK", utilisationPct: 63, capability: "CAP-POL-001", toleranceMicron: 60 },
  { id: "LAM-07", name: "LAM-07 Film Laminator", factoryId: "FAC-05", status: "AVAILABLE", utilisationPct: 30, capability: "CAP-CFM-009", toleranceMicron: 22 },
  { id: "AUT-12", name: "AUT-12 Autoclave", factoryId: "FAC-04", status: "AVAILABLE", utilisationPct: 55, capability: "CAP-QCF-002", toleranceMicron: 0 },
];

/* -------------------------------- INVENTORY ------------------------------- */

export const inventory: InventoryItem[] = [
  { id: "INV-3301", name: "ThermoShield Resin", units: 1840, uom: "kg", location: "Plant 02 / WH-A", status: "AVAILABLE", coversDays: 9 },
  { id: "INV-3302", name: "Packaging Film (480 mm)", units: 5200, uom: "rolls", location: "Plant 02 / WH-B", status: "AVAILABLE", coversDays: 21 },
  { id: "INV-3303", name: "ThermoShield Module (FG)", units: 410, uom: "units", location: "Plant 04 / FG", status: "PARTIAL", coversDays: 2 },
  { id: "INV-3304", name: "Cold Seal Adhesive", units: 780, uom: "kg", location: "Plant 02 / WH-A", status: "AVAILABLE", coversDays: 14 },
  { id: "INV-3305", name: "Phase-Change Gel Packs", units: 12400, uom: "units", location: "Cryolink DEL Hub", status: "AVAILABLE", coversDays: 18 },
  { id: "INV-3306", name: "Precision Forming Tooling Set", units: 3, uom: "sets", location: "Plant 02 / Tool Crib", status: "AVAILABLE", coversDays: 120 },
  { id: "INV-3307", name: "Barrier Laminate Sheet", units: 2600, uom: "sheets", location: "Plant 05 / WH-C", status: "AT RISK", coversDays: 6 },
  { id: "INV-3308", name: "Sterile Liner Inserts", units: 9100, uom: "units", location: "Plant 01 / WH-A", status: "AVAILABLE", coversDays: 26 },
  { id: "INV-3309", name: "QC Reference Standards", units: 46, uom: "kits", location: "Plant 02 / QC Lab", status: "AVAILABLE", coversDays: 90 },
  { id: "INV-3310", name: "Secondary Carton Stock", units: 18500, uom: "units", location: "Plant 06 / WH-A", status: "AVAILABLE", coversDays: 33 },
];

/* -------------------------------- WORKFORCE ------------------------------- */

export const workforce: WorkforceRecord[] = [
  { id: "EMP-1842", role: "Machine Operator II", site: "Plant 02", compatibility: 87, machineOperation: 92, qualityInspection: 81, precisionForming: 76, coldChain: 68, trainingHours: 12, recommendation: "Deploy after targeted training." },
  { id: "EMP-2197", role: "Line Technician", site: "Plant 02", compatibility: 79, machineOperation: 84, qualityInspection: 74, precisionForming: 71, coldChain: 62, trainingHours: 18, recommendation: "Deploy after targeted training." },
  { id: "EMP-2044", role: "QC Inspector", site: "Plant 04", compatibility: 74, machineOperation: 61, qualityInspection: 94, precisionForming: 58, coldChain: 71, trainingHours: 24, recommendation: "Pair with senior former operator." },
  { id: "EMP-1766", role: "Tooling Specialist", site: "Plant 02", compatibility: 83, machineOperation: 88, qualityInspection: 69, precisionForming: 90, coldChain: 41, trainingHours: 14, recommendation: "Deploy after targeted training." },
  { id: "EMP-3120", role: "Cold-Chain Handler", site: "Cryolink DEL", compatibility: 66, machineOperation: 52, qualityInspection: 63, precisionForming: 38, coldChain: 95, trainingHours: 36, recommendation: "Assign to cold-chain leg only." },
  { id: "EMP-2588", role: "Machine Operator I", site: "Plant 06", compatibility: 71, machineOperation: 80, qualityInspection: 62, precisionForming: 64, coldChain: 55, trainingHours: 22, recommendation: "Shortlist — secondary wave." },
  { id: "EMP-1903", role: "Process Engineer", site: "Plant 02", compatibility: 81, machineOperation: 70, qualityInspection: 86, precisionForming: 84, coldChain: 60, trainingHours: 10, recommendation: "Deploy as shift capability lead." },
  { id: "EMP-2731", role: "Packaging Operator", site: "Plant 04", compatibility: 69, machineOperation: 73, qualityInspection: 66, precisionForming: 59, coldChain: 64, trainingHours: 26, recommendation: "Shortlist — secondary wave." },
  { id: "EMP-2410", role: "Maintenance Technician", site: "Plant 02", compatibility: 64, machineOperation: 89, qualityInspection: 45, precisionForming: 57, coldChain: 40, trainingHours: 32, recommendation: "Support role only." },
  { id: "EMP-1655", role: "Line Supervisor", site: "Plant 02", compatibility: 77, machineOperation: 75, qualityInspection: 79, precisionForming: 72, coldChain: 66, trainingHours: 16, recommendation: "Deploy after targeted training." },
  { id: "EMP-3302", role: "QA Documentation", site: "Plant 01", compatibility: 52, machineOperation: 34, qualityInspection: 88, precisionForming: 29, coldChain: 44, trainingHours: 48, recommendation: "Not viable for line deployment." },
  { id: "EMP-2860", role: "Machine Operator II", site: "Plant 05", compatibility: 73, machineOperation: 82, qualityInspection: 68, precisionForming: 66, coldChain: 52, trainingHours: 20, recommendation: "Shortlist — secondary wave." },
  { id: "EMP-1998", role: "Forming Specialist", site: "Plant 04", compatibility: 85, machineOperation: 86, qualityInspection: 72, precisionForming: 91, coldChain: 49, trainingHours: 11, recommendation: "Deploy after targeted training." },
  { id: "EMP-2233", role: "Logistics Coordinator", site: "Plant 02", compatibility: 58, machineOperation: 44, qualityInspection: 57, precisionForming: 33, coldChain: 83, trainingHours: 40, recommendation: "Assign to route orchestration." },
  { id: "EMP-3055", role: "Cleanroom Operator", site: "Plant 06", compatibility: 76, machineOperation: 78, qualityInspection: 77, precisionForming: 68, coldChain: 58, trainingHours: 19, recommendation: "Deploy after targeted training." },
];

/* ------------------------------- LOGISTICS -------------------------------- */

export const logisticsRoutes: LogisticsRoute[] = [
  { id: "RTE-DEL-CHD", from: "DEL", to: "CHD", mode: "Reefer road", status: "AVAILABLE", transitHours: 7, coldChain: true, constraints: "Night-run restriction on 3 segments." },
  { id: "RTE-BOM-CHD", from: "BOM", to: "CHD", mode: "Reefer road", status: "AT RISK", transitHours: 34, coldChain: true, constraints: "Corridor congestion; 2 of 3 carriers committed." },
  { id: "RTE-PNQ-CHD", from: "PNQ", to: "CHD", mode: "Air + reefer", status: "AVAILABLE", transitHours: 19, coldChain: true, constraints: "Air leg capacity 400 kg/day." },
  { id: "RTE-CHD-BDI", from: "CHD", to: "BDI", mode: "Reefer road", status: "AVAILABLE", transitHours: 3, coldChain: true, constraints: "None." },
  { id: "RTE-HYD-CHD", from: "HYD", to: "CHD", mode: "Rail + reefer", status: "PARTIAL", transitHours: 41, coldChain: true, constraints: "Reefer wagon availability 2 days/week." },
  { id: "RTE-AMD-CHD", from: "AMD", to: "CHD", mode: "Reefer road", status: "AVAILABLE", transitHours: 22, coldChain: true, constraints: "None." },
  { id: "RTE-MAA-CHD", from: "MAA", to: "CHD", mode: "Air + reefer", status: "AVAILABLE", transitHours: 26, coldChain: true, constraints: "Cost premium 2.1x baseline." },
  { id: "RTE-CHD-DEL", from: "CHD", to: "DEL", mode: "Ambient road", status: "AVAILABLE", transitHours: 6, coldChain: false, constraints: "Ambient only — not FG qualified." },
];

/* ------------------------------ CAPABILITIES ------------------------------ */

export const capabilities: Capability[] = [
  {
    id: "CAP-THS-017",
    name: "ThermoShield Packaging",
    requirements: ["CAP-POL-001", "CAP-TRS-006", "CAP-PRF-008", "CAP-QCF-002", "CAP-CCH-003", "CAP-WPK-007", "CAP-RLG-005"],
    redundancy: 1,
    targetRedundancy: 3,
    status: "AT RISK",
    owner: "Packaging Engineering",
  },
  { id: "CAP-POL-001", name: "Polymer Material Supply", requirements: [], redundancy: 4, targetRedundancy: 3, status: "AVAILABLE", owner: "Direct Materials" },
  { id: "CAP-QCF-002", name: "Quality Certification", requirements: ["CAP-PPC-004"], redundancy: 3, targetRedundancy: 3, status: "AVAILABLE", owner: "Quality Assurance" },
  { id: "CAP-CCH-003", name: "Cold-Chain Handling", requirements: ["CAP-RLG-005"], redundancy: 2, targetRedundancy: 3, status: "AVAILABLE", owner: "Distribution" },
  { id: "CAP-PPC-004", name: "Precision Polymer Certification", requirements: [], redundancy: 1, targetRedundancy: 3, status: "AT RISK", owner: "Regulatory Affairs" },
  { id: "CAP-RLG-005", name: "Regional Logistics", requirements: [], redundancy: 2, targetRedundancy: 3, status: "AT RISK", owner: "Logistics" },
  { id: "CAP-TRS-006", name: "Temperature Resistance", requirements: ["CAP-POL-001"], redundancy: 3, targetRedundancy: 3, status: "AVAILABLE", owner: "Materials R&D" },
  { id: "CAP-WPK-007", name: "Packaging Workforce", requirements: [], redundancy: 2, targetRedundancy: 3, status: "PARTIAL", owner: "Operations HR" },
  { id: "CAP-PRF-008", name: "Precision Forming", requirements: ["CAP-PPC-004"], redundancy: 3, targetRedundancy: 3, status: "AVAILABLE", owner: "Manufacturing Engineering" },
  { id: "CAP-CFM-009", name: "Barrier Film Lamination", requirements: ["CAP-POL-001"], redundancy: 3, targetRedundancy: 3, status: "AVAILABLE", owner: "Packaging Engineering" },
];

export const capabilityById = Object.fromEntries(capabilities.map((c) => [c.id, c])) as Record<string, Capability>;

/* ------------------------------- DISRUPTION ------------------------------- */

export const activeDisruption = {
  id: "INC-2048",
  title: "Critical Supplier Disruption",
  supplierId: "SUP-1001",
  supplier: "MedCore Components Ltd.",
  component: "ThermoShield Packaging Module",
  dependency: "Cold-chain packaging component",
  capabilityId: "CAP-THS-017",
  severity: "CRITICAL" as const,
  detectedAt: "08:42 IST",
  impactHours: 72,
  impact: "Production risk in 72 hours",
  affectedSkus: 14,
  exposedUnits: "62,400 units",
};

/* --------------------------------- AGENTS --------------------------------- */

export const agentDefs: AgentDef[] = [
  {
    id: "AGT-01",
    code: "SENSING",
    name: "Sensing Agent",
    queuedMessage: "Awaiting event stream.",
    runningMessage: "Correlating supplier availability signals...",
    doneMessage: "Supplier availability event detected.",
    durationMs: 700,
  },
  {
    id: "AGT-02",
    code: "CAPABILITY",
    name: "Capability Analysis Agent",
    queuedMessage: "Queued.",
    runningMessage: "Determining downstream capabilities affected...",
    doneMessage: "Capability CAP-THS-017 identified. 7 sub-capabilities mapped.",
    durationMs: 900,
  },
  {
    id: "AGT-03",
    code: "RESOURCE",
    name: "Resource Discovery Agent",
    queuedMessage: "Queued.",
    runningMessage: "Scanning 48 available enterprise resources...",
    doneMessage: "31 of 48 resources usable for reconstruction.",
    durationMs: 900,
  },
  {
    id: "AGT-04",
    code: "RECONSTRUCTION",
    name: "Reconstruction Agent",
    queuedMessage: "Queued.",
    runningMessage: "Generating alternative capability configurations...",
    doneMessage: "3 viable configurations generated.",
    durationMs: 1000,
  },
  {
    id: "AGT-05",
    code: "SCENARIO",
    name: "Scenario Agent",
    queuedMessage: "Queued.",
    runningMessage: "Simulating recovery paths against demand plan...",
    doneMessage: "Path C scored highest — 94/100.",
    durationMs: 1000,
  },
  {
    id: "AGT-06",
    code: "COMPLIANCE",
    name: "Compliance Agent",
    queuedMessage: "Queued.",
    runningMessage: "Checking certification and cold-chain constraints...",
    doneMessage: "Path C compliant. Human verification required for GDP sign-off.",
    durationMs: 800,
  },
];

/* ----------------------------- RECOVERY PATHS ----------------------------- */

export const recoveryPaths: RecoveryPath[] = [
  {
    id: "A",
    title: "Direct Supplier Replacement",
    strategy: "Replace the broken link",
    composition: ["BioPack Systems (SUP-1002)"],
    recoveryDays: 14,
    costLakh: 18.4,
    risk: "Medium",
    capacityCoveragePct: 100,
    dependencyConcentration: "HIGH — single tier-1 substitute",
    compliance: "Supplier qualification audit required",
    chain: ["BioPack Systems", "Qualification Audit", "ThermoShield Packaging", "Pharma Production"],
    rationale: "Restores full volume but concentrates the outcome on one new tier-1 dependency and a 14-day qualification window.",
    factors: [
      { key: "speed", label: "Recovery speed", weight: 30, score: 34, note: "14 days vs 72-hour impact horizon" },
      { key: "risk", label: "Risk", weight: 25, score: 58, note: "Unproven supplier, audit pending" },
      { key: "cost", label: "Cost", weight: 20, score: 32, note: "₹18.4L — premium spot pricing" },
      { key: "capacity", label: "Capacity coverage", weight: 15, score: 100, note: "Full volume from day 15" },
      { key: "dependency", label: "Dependency resilience", weight: 10, score: 30, note: "1 node carries the whole outcome" },
    ],
  },
  {
    id: "B",
    title: "Alternate Manufacturing",
    strategy: "Shift production internally",
    composition: ["Plant 04 (FAC-04)", "NorthStar Materials (SUP-1003)", "Existing inventory (INV-3301)"],
    recoveryDays: 7,
    costLakh: 9.2,
    risk: "Medium-Low",
    capacityCoveragePct: 78,
    dependencyConcentration: "MEDIUM — shared changeover window",
    compliance: "Line changeover validation required",
    chain: ["ThermoShield Resin", "NorthStar Materials", "Plant 04", "FORM-11", "ThermoShield Packaging", "Pharma Production"],
    rationale: "Halves recovery time using internal capacity, but Plant 04 is 41% free and shares a changeover window with the parenteral line.",
    factors: [
      { key: "speed", label: "Recovery speed", weight: 30, score: 62, note: "7 days to first qualified output" },
      { key: "risk", label: "Risk", weight: 25, score: 72, note: "Known plant, contended line" },
      { key: "cost", label: "Cost", weight: 20, score: 66, note: "₹9.2L — internal transfer pricing" },
      { key: "capacity", label: "Capacity coverage", weight: 15, score: 78, note: "78% of committed volume" },
      { key: "dependency", label: "Dependency resilience", weight: 10, score: 58, note: "3 nodes, one contended" },
    ],
  },
  {
    id: "C",
    title: "Capability Reconstruction",
    strategy: "Rebuild the capability from what already exists",
    composition: [
      "Existing inventory (INV-3301, INV-3306)",
      "CNC-17 (idle precision former)",
      "Plant 02 (72% free capacity)",
      "NorthStar Materials (SUP-1003)",
      "Transferable workforce (12 records)",
      "Route DEL → CHD (RTE-DEL-CHD)",
    ],
    recoveryDays: 3.2,
    costLakh: 3.4,
    risk: "LOW",
    capacityCoveragePct: 91,
    dependencyConcentration: "LOW — 6 independent contributors",
    compliance: "REQUIRES HUMAN VERIFICATION",
    chain: [
      "Inventory",
      "NorthStar Materials",
      "Plant 02",
      "CNC-17",
      "Transferable Workforce",
      "Alternative Logistics",
      "ThermoShield Packaging",
      "Pharma Production",
    ],
    rationale: "Highest recovery speed with lowest dependency concentration. Reconstructs the outcome from assets already inside the network.",
    factors: [
      { key: "speed", label: "Recovery speed", weight: 30, score: 96, note: "3.2 days — inside the 72-hour horizon" },
      { key: "risk", label: "Risk", weight: 25, score: 91, note: "All resources already qualified" },
      { key: "cost", label: "Cost", weight: 20, score: 94, note: "₹3.4L — mostly internal reallocation" },
      { key: "capacity", label: "Capacity coverage", weight: 15, score: 91, note: "91% of committed volume" },
      { key: "dependency", label: "Dependency resilience", weight: 10, score: 96, note: "No single node above 22% of the outcome" },
    ],
  },
];

/* -------------------------- CAPABILITY DECOMPOSITION ---------------------- */

export interface DecompNode {
  id: string;
  label: string;
  status: Availability;
  dependencies: number;
  provider: string;
}

export const thermoShieldDecomposition: DecompNode[] = [
  { id: "CAP-POL-001", label: "Material", status: "AVAILABLE", dependencies: 4, provider: "NorthStar / Aegis / Helix" },
  { id: "CAP-TRS-006", label: "Temperature Resistance", status: "AVAILABLE", dependencies: 2, provider: "Materials R&D spec MS-441" },
  { id: "CAP-PRF-008", label: "Precision Forming", status: "AVAILABLE", dependencies: 3, provider: "CNC-17 / CNC-09" },
  { id: "CAP-QCF-002", label: "Quality Certification", status: "AVAILABLE", dependencies: 2, provider: "QC-SCAN-03, Orbit Labs" },
  { id: "CAP-CCH-003", label: "Cold-Chain Handling", status: "AVAILABLE", dependencies: 2, provider: "Cryolink, SEAL-04" },
  { id: "CAP-WPK-007", label: "Packaging Workforce", status: "PARTIAL", dependencies: 1, provider: "12 transferable records" },
  { id: "CAP-RLG-005", label: "Regional Logistics", status: "AT RISK", dependencies: 2, provider: "RTE-DEL-CHD / RTE-BOM-CHD" },
];

/* ------------------------------ CHAOS SCENARIOS --------------------------- */

export interface FailureToggle {
  id: string;
  label: string;
  detail: string;
  resilienceHit: number;
  removes: string[];
}

export const failureToggles: FailureToggle[] = [
  { id: "supplier", label: "Remove critical supplier", detail: "MedCore Components Ltd. (SUP-1001)", resilienceHit: 14, removes: ["SUP-1001"] },
  { id: "factory", label: "Disable factory", detail: "Plant 02 (FAC-02)", resilienceHit: 11, removes: ["FAC-02"] },
  { id: "machine", label: "Disable machine", detail: "CNC-17 precision former", resilienceHit: 6, removes: ["CNC-17"] },
  { id: "route", label: "Block logistics route", detail: "RTE-DEL-CHD cold corridor", resilienceHit: 9, removes: ["RTE-DEL-CHD"] },
  { id: "workforce", label: "Remove specialized workforce", detail: "Precision packaging skill pool", resilienceHit: 8, removes: ["WF-PRF"] },
  { id: "cert", label: "Multiple simultaneous failures", detail: "Certification lab + BOM corridor + Plant 05", resilienceHit: 19, removes: ["SUP-1010", "RTE-BOM-CHD", "FAC-05"] },
];

export interface HiddenDependency {
  id: string;
  name: string;
  impact: string;
  alternatives: string;
  redundancy: number;
  target: number;
  mitigation: string;
  sharedBy: string[];
}

export const hiddenDependencies: HiddenDependency[] = [
  {
    id: "CAP-PPC-004",
    name: "Precision Polymer Certification",
    impact: "Blocks 5 suppliers simultaneously. 62,400 units exposed.",
    alternatives: "0 qualified alternates. 1 lab in accreditation queue.",
    redundancy: 1,
    target: 3,
    mitigation: "Qualify secondary capability provider (Orbit Labs alternate + EU notified body).",
    sharedBy: ["MedCore Components", "BioPack Systems", "NorthStar Materials", "Aegis Polymers", "Helix Substrates"],
  },
  {
    id: "CAP-RLG-005",
    name: "Cold-chain regional transport",
    impact: "Two of three northern corridors converge on the same reefer fleet.",
    alternatives: "Air + reefer via PNQ at 2.1x cost; rail 2 days/week.",
    redundancy: 2,
    target: 3,
    mitigation: "Contract a second GDP-certified reefer operator on the CHD corridor.",
    sharedBy: ["Cryolink Logistics", "RTE-DEL-CHD", "RTE-BOM-CHD"],
  },
  {
    id: "CAP-WPK-007",
    name: "Specialized packaging workforce",
    impact: "Precision forming skill concentrated in a single shift at Plant 02.",
    alternatives: "12 transferable records; 9% average training gap.",
    redundancy: 2,
    target: 4,
    mitigation: "Run targeted 12-hour cross-training for 6 operators across Plant 04 and Plant 06.",
    sharedBy: ["Plant 02 Shift A", "CNC-17", "FORM-08"],
  },
];

/* ------------------------------- SAP MAPPING ------------------------------ */

export const sapLayers = [
  { id: "S/4HANA", name: "SAP S/4HANA", role: "Enterprise operational data", detail: "Materials, plants, orders, supplier master." },
  { id: "HANA", name: "SAP HANA Cloud", role: "Capability / dependency intelligence", detail: "Graph store for the capability network." },
  { id: "BTP", name: "SAP BTP", role: "Agent orchestration", detail: "Sensing, capability, resource, reconstruction, scenario agents." },
  { id: "GENAI", name: "SAP Generative AI Hub", role: "AI reasoning", detail: "Configuration generation and rationale synthesis." },
  { id: "BUILD", name: "SAP Build", role: "User interface", detail: "Resilience command center and approval workflow." },
];

/* ------------------------------ NETWORK GRAPH ----------------------------- */

export type NodeKind = "supplier" | "material" | "factory" | "machine" | "workforce" | "route" | "capability" | "outcome";

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  x: number;
  y: number;
  status: Availability;
  risk: "LOW" | "MEDIUM" | "HIGH";
  meta: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  critical?: boolean;
}

export const graphNodes: GraphNode[] = [
  { id: "SUP-1001", label: "MedCore", kind: "supplier", x: 90, y: 90, status: "OFFLINE", risk: "HIGH", meta: "Tier 1 · sole-source" },
  { id: "SUP-1002", label: "BioPack", kind: "supplier", x: 90, y: 200, status: "AVAILABLE", risk: "MEDIUM", meta: "Tier 1 · audit pending" },
  { id: "SUP-1003", label: "NorthStar", kind: "supplier", x: 90, y: 310, status: "AVAILABLE", risk: "LOW", meta: "Tier 2 · resin" },
  { id: "SUP-1010", label: "Orbit Labs", kind: "supplier", x: 90, y: 420, status: "PARTIAL", risk: "HIGH", meta: "Certification lab" },
  { id: "INV-3301", label: "Resin Stock", kind: "material", x: 290, y: 90, status: "AVAILABLE", risk: "LOW", meta: "1,840 kg" },
  { id: "CAP-PPC-004", label: "Polymer Cert.", kind: "capability", x: 290, y: 420, status: "AT RISK", risk: "HIGH", meta: "Redundancy 1x" },
  { id: "FAC-02", label: "Plant 02", kind: "factory", x: 470, y: 130, status: "AVAILABLE", risk: "LOW", meta: "72% free" },
  { id: "FAC-04", label: "Plant 04", kind: "factory", x: 470, y: 300, status: "AVAILABLE", risk: "MEDIUM", meta: "41% free" },
  { id: "CNC-17", label: "CNC-17", kind: "machine", x: 650, y: 70, status: "IDLE", risk: "LOW", meta: "Idle · 12µm" },
  { id: "FORM-08", label: "FORM-08", kind: "machine", x: 650, y: 180, status: "AVAILABLE", risk: "LOW", meta: "34% utilised" },
  { id: "FORM-11", label: "FORM-11", kind: "machine", x: 650, y: 300, status: "PARTIAL", risk: "MEDIUM", meta: "77% utilised" },
  { id: "WF-PRF", label: "Forming Crew", kind: "workforce", x: 650, y: 415, status: "PARTIAL", risk: "MEDIUM", meta: "12 transferable" },
  { id: "CAP-THS-017", label: "ThermoShield Capability", kind: "capability", x: 860, y: 240, status: "AT RISK", risk: "HIGH", meta: "CAP-THS-017" },
  { id: "RTE-DEL-CHD", label: "DEL → CHD", kind: "route", x: 1040, y: 150, status: "AVAILABLE", risk: "LOW", meta: "7h reefer" },
  { id: "RTE-BOM-CHD", label: "BOM → CHD", kind: "route", x: 1040, y: 330, status: "AT RISK", risk: "HIGH", meta: "34h · congested" },
  { id: "OUT-PROD", label: "Pharma Production", kind: "outcome", x: 1210, y: 240, status: "AT RISK", risk: "HIGH", meta: "14 SKUs" },
];

export const graphEdges: GraphEdge[] = [
  { from: "SUP-1001", to: "CAP-THS-017", critical: true },
  { from: "SUP-1002", to: "CAP-THS-017" },
  { from: "SUP-1003", to: "INV-3301" },
  { from: "SUP-1003", to: "FAC-02" },
  { from: "SUP-1010", to: "CAP-PPC-004", critical: true },
  { from: "CAP-PPC-004", to: "SUP-1002", critical: true },
  { from: "CAP-PPC-004", to: "SUP-1003", critical: true },
  { from: "CAP-PPC-004", to: "CNC-17", critical: true },
  { from: "INV-3301", to: "FAC-02" },
  { from: "FAC-02", to: "CNC-17" },
  { from: "FAC-02", to: "FORM-08" },
  { from: "FAC-04", to: "FORM-11" },
  { from: "WF-PRF", to: "CAP-THS-017" },
  { from: "CNC-17", to: "CAP-THS-017" },
  { from: "FORM-08", to: "CAP-THS-017" },
  { from: "FORM-11", to: "CAP-THS-017" },
  { from: "CAP-THS-017", to: "RTE-DEL-CHD" },
  { from: "CAP-THS-017", to: "RTE-BOM-CHD" },
  { from: "RTE-DEL-CHD", to: "OUT-PROD" },
  { from: "RTE-BOM-CHD", to: "OUT-PROD" },
];

export const resilienceTrend = [
  { month: "Feb", score: 71 },
  { month: "Mar", score: 74 },
  { month: "Apr", score: 76 },
  { month: "May", score: 80 },
  { month: "Jun", score: 82 },
  { month: "Jul", score: 84 },
  { month: "Aug", score: 87 },
];

export const user = {
  name: "Aditi Sharma",
  role: "Supply Chain Resilience Manager",
  initials: "AS",
};
