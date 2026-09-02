/**
 * PARALLAX — canonical domain + API types.
 *
 * This is the single source of truth shared by the UI, the mock data
 * (`src/lib/parallax/data.ts`) and the API service layer (`src/services/*`).
 * The backend modules (Bani — backend/DB, Suvreen — capability graph,
 * Diya — recovery/simulation, Riya — agent orchestrator) should return JSON
 * matching these shapes; see FRONTEND_INTEGRATION_PLAN.md for the endpoint map.
 */

/* ------------------------------ shared enums ------------------------------ */

export type Availability = "AVAILABLE" | "PARTIAL" | "AT RISK" | "OFFLINE" | "IDLE";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | string;

/* ------------------------------ master data ------------------------------- */

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

/**
 * Generic resource handle used when a user picks "something" in the network
 * (a supplier, a factory, a machine…) and hands it to the disruption API.
 */
export type ResourceKind =
  "supplier" | "factory" | "machine" | "inventory" | "route" | "workforce" | "capability";

export interface Resource {
  id: string;
  kind: ResourceKind;
  name: string;
  status: Availability;
  location?: string;
  capabilityIds?: string[];
  constraints?: string;
  meta?: string;
}

/* ------------------------------- disruption ------------------------------- */

export type DisruptionSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type DisruptionStatus = "OPEN" | "ANALYZING" | "AWAITING APPROVAL" | "RESOLVED" | "CLOSED";

export interface Disruption {
  id: string;
  title: string;
  supplierId?: string;
  supplier?: string;
  component?: string;
  dependency?: string;
  capabilityId?: string;
  severity: DisruptionSeverity;
  detectedAt: string;
  impactHours?: number;
  impact?: string;
  affectedSkus?: number;
  exposedUnits?: string;
  status?: DisruptionStatus;
}

export interface InjectDisruptionPayload {
  resourceType: ResourceKind;
  resourceId: string;
  severity?: DisruptionSeverity;
  note?: string;
}

/* ---------------------- capability graph analysis (B) ---------------------- */

export interface AffectedCapability {
  id: string;
  name: string;
  status: Availability;
  redundancy: number;
  targetRedundancy: number;
  /** How many downstream capabilities/resources depend on this one. */
  dependencies: number;
  provider?: string;
  /** True when the disruption severed this sub-capability's primary source. */
  impacted?: boolean;
}

export interface AffectedResource {
  id: string;
  kind: ResourceKind;
  name: string;
  status: Availability;
  /** "affected" = lost/impacted, "alternative" = can step in, "supporting" = still contributing. */
  role: "affected" | "alternative" | "supporting";
  note?: string;
}

export interface AlternativeResource {
  id: string;
  name: string;
  kind: ResourceKind;
  leadTimeDays?: number;
  capacityPct?: number;
  qualified: boolean;
  note?: string;
}

export interface RedundancyScore {
  capabilityId: string;
  capabilityName?: string;
  redundancy: number;
  target: number;
}

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

export interface GraphAnalysisResult {
  disruptionId: string;
  capabilityId: string;
  capabilityName?: string;
  affectedCapabilities: AffectedCapability[];
  affectedResources: AffectedResource[];
  hiddenDependencies: HiddenDependency[];
  alternativeResources: AlternativeResource[];
  redundancyScores: RedundancyScore[];
}

/* -------------------------- recovery engine (C, F) ------------------------- */

export interface PathFactor {
  key: string;
  label: string;
  weight: number;
  score: number;
  note: string;
}

export interface RecoveryPath {
  id: string;
  title: string;
  strategy: string;
  composition: string[];
  recoveryDays: number;
  costLakh: number;
  risk: RiskLevel;
  capacityCoveragePct: number;
  dependencyConcentration: string;
  compliance: string;
  factors: PathFactor[];
  chain: string[];
  rationale: string;
}

export interface RecoveryResult {
  disruptionId: string;
  paths: RecoveryPath[];
  recommendedPathId: string;
  requiresApproval: boolean;
  complianceNote?: string;
  resilienceAfter?: number;
}

export type ApprovalDecisionType = "APPROVED" | "REJECTED" | "ALTERNATIVE_REQUESTED";

export interface ApprovalRequest {
  id: string;
  disruptionId: string;
  workflowId?: string;
  pathId: string;
  recommendation: string;
  complianceStatus?: string;
  status: "PENDING" | ApprovalDecisionType;
  requestedAt: string;
  decidedBy?: string;
  decidedAt?: string;
  note?: string;
}

export interface ApprovalDecision {
  requestId?: string;
  disruptionId: string;
  workflowId?: string;
  pathId: string;
  decision: ApprovalDecisionType;
  decidedBy: string;
  note?: string;
}

/* ------------------------ simulation / chaos (D) -------------------------- */

export interface SimulationResult {
  simulationId?: string;
  failureIds: string[];
  removed: string[];
  resilienceBefore: number;
  resilienceAfter: number;
  affectedCapabilities: AffectedCapability[];
  vulnerabilities: HiddenDependency[];
  supplierRedundancy: number;
  capabilityRedundancy: number;
}

export interface FailureToggle {
  id: string;
  label: string;
  detail: string;
  resilienceHit: number;
  removes: string[];
}

/* --------------------------- agent workflow (E) --------------------------- */

export type AgentStepStatus = "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED";

export interface AgentStep {
  id: string;
  code: string;
  name: string;
  status: AgentStepStatus;
  message: string;
  reasoning?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AgentWorkflow {
  workflowId: string;
  disruptionId: string;
  status: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
  progress: number;
  currentStepId?: string;
  steps: AgentStep[];
  recommendation?: {
    pathId: string;
    summary: string;
    score?: number;
  };
  compliance?: {
    status: string;
    requiresHumanVerification: boolean;
    note?: string;
  };
  requiresHumanApproval: boolean;
  summary?: string;
}

/** Static definition of an agent used by the mock orchestrator / UI labels. */
export interface AgentDef {
  id: string;
  code: string;
  name: string;
  queuedMessage: string;
  runningMessage: string;
  doneMessage: string;
  durationMs: number;
}

/* ------------------------- decomposition + graph UI ----------------------- */

export interface DecompNode {
  id: string;
  label: string;
  status: Availability;
  dependencies: number;
  provider: string;
}

export type NodeKind =
  | "supplier"
  | "material"
  | "factory"
  | "machine"
  | "workforce"
  | "route"
  | "capability"
  | "outcome";

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  x: number;
  y: number;
  status: Availability;
  risk: RiskLevel;
  meta: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  critical?: boolean;
}

export interface CapabilityNetwork {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/* ----------------------------- LLM analysis ------------------------------- */

export interface LlmAnalysisResponse {
  disruptionId: string;
  summary: string;
  explanation: string;
  recoveryStrategies: Array<{
    id: string;
    title: string;
    reasoning: string;
    risk: string;
    tradeoff: string;
    timelineDays: number;
  }>;
  recommendedAction: string;
  risks: string[];
}

/* --------------------- endpoint aggregate response types ------------------ */

export interface GraphResponse {
  network: CapabilityNetwork;
  hiddenDependencies: HiddenDependency[];
}

export interface RecoveryResponse {
  result: RecoveryResult;
  approvals: ApprovalRequest[];
}

export interface SimulationResponse {
  result: SimulationResult;
  history: SimulationResult[];
}

export interface AgentsResponse {
  agents: AgentDef[];
  workflows: AgentWorkflow[];
}
