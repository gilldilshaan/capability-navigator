import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  activeDisruption,
  agentDefs,
  capabilities,
  factories,
  hiddenDependencies,
  inventory,
  logisticsRoutes,
  machines,
  recoveryPaths,
  suppliers,
  thermoShieldDecomposition,
  user,
  workforce,
} from "./data";
import * as agentService from "@/services/agentService";
import * as disruptionService from "@/services/disruptionService";
import * as graphService from "@/services/graphService";
import * as masterService from "@/services/masterService";
import * as recoveryService from "@/services/recoveryService";
import * as simulationService from "@/services/simulationService";
import { apiConfig, getLastFallbackReason, type ApiSource, type HealthStatus } from "@/services";
import type {
  AgentWorkflow,
  ApprovalDecisionType,
  Capability,
  Disruption,
  DisruptionSeverity,
  Factory,
  GraphAnalysisResult,
  HiddenDependency,
  InventoryItem,
  LogisticsRoute,
  Machine,
  RecoveryPath,
  ResourceKind,
  SimulationResult,
  Supplier,
  WorkforceRecord,
} from "@/types/parallax";

export type AgentStatus = "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED";

export interface AgentState {
  id: string;
  code: string;
  name: string;
  status: AgentStatus;
  message: string;
}

export interface ActivityEntry {
  id: number;
  time: string;
  channel: string;
  text: string;
}

export interface AuditEntry {
  id: number;
  time: string;
  label: string;
  detail: string;
  tone: "info" | "critical" | "success" | "warning";
}

/**
 * idle → running → complete, with "error" when the pipeline fails and no mock
 * fallback is available. Progress/stage text comes from the real pipeline —
 * no fake timers.
 */
export type AnalysisState = "idle" | "running" | "complete" | "error";
export type RecoveryStatus =
  "NOT STARTED" | "AWAITING APPROVAL" | "APPROVED" | "REJECTED" | "ALTERNATIVE REQUESTED";

export interface BackendNotice {
  tone: "warning" | "critical";
  message: string;
}

interface ParallaxState {
  /* incident + analysis */
  incident: Disruption;
  incidentOpen: boolean;
  analysis: AnalysisState;
  analysisProgress: number;
  /** Human-readable pipeline stage, e.g. "Analyzing dependencies". */
  pipelineStage: string;
  /** Where the latest results came from: live backend or mock fallback. */
  dataSource: ApiSource | null;
  /** Non-blocking banner state for backend problems. */
  backendNotice: BackendNotice | null;
  /** True once the on-mount backend hydration pass has settled (live or mock). */
  hydrated: boolean;
  agents: AgentState[];
  activity: ActivityEntry[];
  audit: AuditEntry[];
  graphAnalysis: GraphAnalysisResult | null;
  lastWorkflow: AgentWorkflow | null;
  capabilityIdentified: boolean;
  resourcesDiscovered: boolean;
  pathsGenerated: boolean;
  paths: RecoveryPath[];
  selectedPathId: RecoveryPath["id"] | null;
  recommendedPathId: RecoveryPath["id"] | null;
  recoveryStatus: RecoveryStatus;
  approving: boolean;
  /* network */
  resilience: number;
  activeDisruptions: number;
  redundancy: number;
  readiness: number;
  capabilityRegister: Capability[];
  decomposition: typeof thermoShieldDecomposition;
  /* master data (hydrated from Bani /api/*) */
  suppliers: Supplier[];
  factories: Factory[];
  machines: Machine[];
  inventory: InventoryItem[];
  workforce: WorkforceRecord[];
  logisticsRoutes: LogisticsRoute[];
  capabilities: Capability[];
  healthStatus: HealthStatus | null;
  /* chaos */
  chaosToggles: string[];
  chaosRunning: boolean;
  chaosProgress: number;
  chaosResult: SimulationResult | null;
  vulnerabilities: HiddenDependency[];
  resiliencePlans: string[];
  /* presentation + demo */
  presentation: boolean;
  demoRunning: boolean;
  demoStep: number;
  demoLabel: string;
  agentPanelOpen: boolean;
}

export interface InjectDisruptionTarget {
  resourceType: ResourceKind;
  resourceId: string;
  severity?: DisruptionSeverity;
  note?: string;
}

interface ParallaxApi extends ParallaxState {
  recommendedPath: RecoveryPath | null;
  openIncident: () => void;
  runAnalysis: () => void;
  injectDisruption: (target: InjectDisruptionTarget) => void;
  selectPath: (id: RecoveryPath["id"] | null) => void;
  approveRecovery: () => void;
  requestAlternative: () => void;
  rejectRecovery: () => void;
  toggleChaos: (id: string) => void;
  runChaos: () => void;
  clearChaos: () => void;
  addResiliencePlan: (id: string) => void;
  setPresentation: (on: boolean) => void;
  setAgentPanelOpen: (on: boolean) => void;
  startDemo: () => void;
  demoTotalSteps: number;
  stopDemo: () => void;
  resetDemo: () => void;
  dismissNotice: () => void;
  score: (p: RecoveryPath) => number;
}

const BASE_RESILIENCE = 87;

/** Delay between automatic demo stages — long enough for each stage to be read. */
const DEMO_AUTO_MS = 2500;
/** Small pause before the tour starts so the page settles. */
const DEMO_HOLD_MS = 600;

const initialState: ParallaxState = {
  incident: activeDisruption,
  incidentOpen: false,
  analysis: "idle",
  analysisProgress: 0,
  pipelineStage: "",
  dataSource: null,
  backendNotice: null,
  agents: agentDefs.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    status: a.id === "AGT-01" ? "COMPLETE" : "QUEUED",
    message: a.id === "AGT-01" ? a.doneMessage : a.queuedMessage,
  })),
  activity: [
    {
      id: 1,
      time: "08:42:11",
      channel: "SENSING",
      text: "Supplier disruption detected — MedCore Components Ltd. (SUP-1001).",
    },
    {
      id: 2,
      time: "08:42:12",
      channel: "SYSTEM",
      text: "Incident INC-2048 opened. Severity CRITICAL.",
    },
  ],
  audit: [
    {
      id: 1,
      time: "08:42",
      label: "Disruption detected",
      detail: "SUP-1001 availability event · INC-2048 opened",
      tone: "critical",
    },
  ],
  graphAnalysis: null,
  lastWorkflow: null,
  capabilityIdentified: false,
  resourcesDiscovered: false,
  pathsGenerated: false,
  paths: recoveryPaths,
  selectedPathId: null,
  recommendedPathId: null,
  recoveryStatus: "NOT STARTED",
  approving: false,
  resilience: BASE_RESILIENCE,
  activeDisruptions: 1,
  redundancy: 3.8,
  readiness: 92,
  capabilityRegister: capabilities,
  decomposition: thermoShieldDecomposition,
  suppliers,
  factories,
  machines,
  inventory,
  workforce,
  logisticsRoutes,
  capabilities,
  healthStatus: null,
  hydrated: false,
  chaosToggles: [],
  chaosRunning: false,
  chaosProgress: 0,
  chaosResult: null,
  vulnerabilities: hiddenDependencies,
  resiliencePlans: [],
  presentation: false,
  demoRunning: false,
  demoStep: 0,
  demoLabel: "",
  /* Activity rail defaults to collapsed (56px) — expand via the rail. */
  agentPanelOpen: false,
};

/** Transparent weighted scoring: 30% speed, 25% risk, 20% cost, 15% capacity, 10% dependency. */
export function scorePath(p: RecoveryPath): number {
  const total = p.factors.reduce((sum, f) => sum + (f.weight / 100) * f.score, 0);
  return Math.round(total);
}

const ParallaxContext = createContext<ParallaxApi | null>(null);

let seq = 100;
const nextId = () => ++seq;

function clock(offsetSec: number) {
  const base = 8 * 3600 + 42 * 60 + 20;
  const t = base + offsetSec;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Real wall-clock stamp for live backend results. */
function realNow(withSeconds = true) {
  const t = new Date().toLocaleTimeString("en-GB", { hour12: false });
  return withSeconds ? t : t.slice(0, 5);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function agentsFromWorkflow(workflow: AgentWorkflow): AgentState[] {
  return workflow.steps.map((step) => ({
    id: step.id,
    code: step.code,
    name: step.name,
    status: step.status,
    message: step.message,
  }));
}

function decompositionFromAnalysis(analysis: GraphAnalysisResult) {
  return analysis.affectedCapabilities.map((c) => ({
    id: c.id,
    label: c.name,
    status: c.status,
    dependencies: c.dependencies,
    provider: c.provider ?? "",
  }));
}

/** Banner text when a configured backend degraded to mock data. */
function mockNotice(): BackendNotice | null {
  if (apiConfig.demoMode) return null;
  const reason = getLastFallbackReason();
  return {
    tone: "warning",
    message: reason
      ? `Live results unavailable — showing demo data. ${reason}`
      : "Live results unavailable — showing demo data.",
  };
}

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ParallaxState>(initialState);
  const navigate = useNavigate();

  /* Latest state for async actions without stale-closure churn. */
  const stateRef = useRef(state);
  stateRef.current = state;

  /* Lets reset/unmount cancel an in-flight workflow poll. */
  const pollAbortRef = useRef<AbortController | null>(null);
  const pipelineRunningRef = useRef(false);
  /** True once the automatic pipeline has run after hydration to avoid double-starts. */
  const autoRanRef = useRef(false);
  useEffect(() => () => pollAbortRef.current?.abort(), []);

  /* Demo tour timer so start/reset/stop invalidate in-flight schedules. */
  const demoTimerRef = useRef<number | null>(null);
  const clearDemoTimer = useCallback(() => {
    if (demoTimerRef.current !== null) {
      window.clearTimeout(demoTimerRef.current);
      demoTimerRef.current = null;
    }
  }, []);

  const patch = useCallback((p: Partial<ParallaxState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const appendActivity = useCallback((row: Omit<ActivityEntry, "id">) => {
    setState((s) => ({ ...s, activity: [...s.activity, { ...row, id: nextId() }] }));
  }, []);

  const appendAudit = useCallback((row: Omit<AuditEntry, "id">) => {
    setState((s) => ({ ...s, audit: [...s.audit, { ...row, id: nextId() }] }));
  }, []);

  const openIncident = useCallback(() => {
    patch({ incidentOpen: true });
    navigate({ to: "/disruptions" });
  }, [navigate, patch]);

  /* ------------------------------------------------------------------ */
  /* Master data + active disruption hydration — runs once on mount.     */
  /* Live responses replace the mock seed; failures degrade to mock and  */
  /* the standard backendNotice banner explains why. No disruption is    */
  /* ever injected here — we only read.                                  */
  /* ------------------------------------------------------------------ */

  const hydrateFromBackend = useCallback(async () => {
    try {
      const [
        suppliersEnv,
        factoriesEnv,
        machinesEnv,
        inventoryEnv,
        workforceEnv,
        routesEnv,
        capsEnv,
        activeEnv,
        healthEnv,
      ] = await Promise.all([
        masterService.getSuppliers(),
        masterService.getFactories(),
        masterService.getMachines(),
        masterService.getInventory(),
        masterService.getWorkforce(),
        masterService.getLogisticsRoutes(),
        masterService.getCapabilities(),
        disruptionService.getActiveDisruptions(),
        masterService.getHealth(),
      ]);

      const sources = [
        suppliersEnv,
        factoriesEnv,
        machinesEnv,
        inventoryEnv,
        workforceEnv,
        routesEnv,
        capsEnv,
        activeEnv,
      ].map((envelope) => envelope.source);
      const anyLive = sources.includes("live");
      const activeLive = activeEnv.source === "live";

      setState((s) => ({
        ...s,
        suppliers: suppliersEnv.data,
        factories: factoriesEnv.data,
        machines: machinesEnv.data,
        inventory: inventoryEnv.data,
        workforce: workforceEnv.data,
        logisticsRoutes: routesEnv.data,
        capabilities: capsEnv.data,
        capabilityRegister: capsEnv.data,
        ...(activeLive && activeEnv.data.length > 0
          ? {
              activeDisruptions: activeEnv.data.length,
              incident: activeEnv.data[0]!,
            }
          : {}),
        healthStatus: healthEnv.source === "live" ? healthEnv.data : s.healthStatus,
        ...(anyLive ? { dataSource: "live" as ApiSource, backendNotice: null } : {}),
        ...(!anyLive && !apiConfig.demoMode ? { backendNotice: mockNotice() } : {}),
        hydrated: true,
      }));
    } catch (error) {
      /* Fallback disabled or unexpected failure — show a clean error. */
      setState((s) => ({
        ...s,
        backendNotice: {
          tone: "critical",
          message: `Could not load master data: ${errorMessage(error)}`,
        },
        hydrated: true,
      }));
    }
  }, []);

  useEffect(() => {
    void hydrateFromBackend();
  }, [hydrateFromBackend]);

  /* ------------------------------------------------------------------ */
  /* Analysis pipeline: disruption → graph → agents → recovery paths.   */
  /* Every stage reacts to real service responses; mock fallback keeps  */
  /* the demo behaviour (instant, deterministic, no timers).            */
  /* ------------------------------------------------------------------ */

  const executePipeline = useCallback(
    async (incident: Disruption) => {
      if (pipelineRunningRef.current) return;
      pipelineRunningRef.current = true;

      const sources: ApiSource[] = [];
      let mockOffset = 20;

      const stamp = (isMock: boolean, offset?: number) =>
        isMock ? clock(offset ?? mockOffset) : realNow();

      try {
        pollAbortRef.current?.abort();
        const pollAbort = new AbortController();
        pollAbortRef.current = pollAbort;

        patch({
          analysis: "running",
          analysisProgress: 5,
          pipelineStage: "Analyzing dependencies",
          backendNotice: null,
          incident,
          incidentOpen: true,
        });

        /* Stage 1 — capability graph analysis (Suvreen). */
        const graphEnv = await graphService.analyzeGraph({
          disruptionId: incident.id,
          ...(incident.capabilityId ? { capabilityId: incident.capabilityId } : {}),
        });
        sources.push(graphEnv.source);
        const graph = graphEnv.data;

        setState((s) => ({
          ...s,
          analysisProgress: 35,
          graphAnalysis: graph,
          capabilityIdentified: true,
          decomposition: decompositionFromAnalysis(graph),
          capabilityRegister: s.capabilityRegister,
        }));

        /* Stage 2 — agentic orchestrator (Riya). Poll while the workflow runs. */
        patch({ pipelineStage: "Coordinating agents" });
        const workflowEnv = await agentService.startWorkflow(incident.id);
        sources.push(workflowEnv.source);
        let workflow = workflowEnv.data;
        if (
          workflowEnv.source === "live" &&
          (workflow.status === "PENDING" || workflow.status === "RUNNING")
        ) {
          setState((s) => ({ ...s, lastWorkflow: workflow, agents: agentsFromWorkflow(workflow) }));
          try {
            workflow = await agentService.pollWorkflow(
              workflow.workflowId,
              (wf) => setState((s) => ({ ...s, lastWorkflow: wf, agents: agentsFromWorkflow(wf) })),
              { signal: pollAbort.signal },
            );
          } catch (pollError) {
            if (!pollAbort.signal.aborted) console.warn(errorMessage(pollError));
          }
        }
        setState((s) => ({
          ...s,
          analysisProgress: 70,
          lastWorkflow: workflow,
          agents: agentsFromWorkflow(workflow),
        }));

        /* Per-agent activity rows — mock mode replays the original demo script. */
        workflow.steps
          .filter((step) => step.status === "COMPLETE")
          .forEach((step) => {
            mockOffset += 6;
            appendActivity({
              time: stamp(workflowEnv.source === "mock", mockOffset),
              channel: step.code,
              text: step.message,
            });
          });
        if (workflow.requiresHumanApproval) {
          mockOffset += 8;
          appendActivity({
            time: stamp(workflowEnv.source === "mock", mockOffset),
            channel: "HUMAN",
            text: "Awaiting manager approval.",
          });
        }

        /* Stage 3 — recovery paths (Diya). */
        patch({ pipelineStage: "Generating recovery paths" });
        const recoveryEnv = await recoveryService.getRecoveryPaths(incident.id);
        sources.push(recoveryEnv.source);
        const recovery = recoveryEnv.data;
        const isMock = sources.includes("mock");
        const recommended = recovery.recommendedPathId;
        const recommendedPath = recovery.paths.find((p) => p.id === recommended);

        /* Audit trail — same narrative in mock mode, result-derived when live. */
        const auditTime = (hhmm: string) => (isMock ? hhmm : realNow(false));
        const auditRows: Omit<AuditEntry, "id">[] = [
          {
            time: auditTime("08:43"),
            label: "Capability identified",
            detail: `${graph.capabilityId} · ${graph.capabilityName ?? "capability"} · ${graph.affectedCapabilities.length} sub-capabilities`,
            tone: "info",
          },
          {
            time: auditTime("08:44"),
            label: "Resources discovered",
            detail: isMock
              ? "31 of 48 enterprise resources usable"
              : `${graph.affectedResources.length} affected · ${graph.alternativeResources.length} alternatives found`,
            tone: "info",
          },
          {
            time: auditTime("08:45"),
            label: `${recovery.paths.length} recovery paths generated`,
            detail: recovery.paths.map((p) => `Path ${p.id}`).join(" · "),
            tone: "info",
          },
          {
            time: auditTime("08:46"),
            label: "Scenario simulation completed",
            detail: "Weighted scoring across 5 factors",
            tone: "info",
          },
          {
            time: auditTime("08:47"),
            label: `Path ${recommended} recommended`,
            detail: recommendedPath
              ? `Recovery score ${scorePath(recommendedPath)}/100 · dependency risk ${recommendedPath.risk}`
              : "Recovery engine recommendation",
            tone: "success",
          },
          {
            time: auditTime("08:48"),
            label: "Awaiting human approval",
            detail: `Routed to ${user.name} · ${user.role.replace("Supply Chain ", "")}`,
            tone: "warning",
          },
        ];

        setState((s) => ({
          ...s,
          analysis: "complete",
          analysisProgress: 100,
          pipelineStage: "Completed",
          resourcesDiscovered: true,
          pathsGenerated: true,
          paths: recovery.paths,
          recommendedPathId: recommended,
          selectedPathId: null,
          recoveryStatus: recovery.requiresApproval ? "AWAITING APPROVAL" : s.recoveryStatus,
          readiness: 92,
          activity: [
            ...s.activity,
            {
              id: nextId(),
              time: stamp(isMock, mockOffset + 8),
              channel: "SYSTEM",
              text: `Pipeline complete — ${recovery.paths.length} paths, Path ${recommended} recommended.`,
            },
          ],
          audit: [...s.audit, ...auditRows.map((row) => ({ ...row, id: nextId() }))],
          dataSource: isMock ? "mock" : "live",
          backendNotice: isMock ? mockNotice() : null,
        }));
      } catch (error) {
        /* With fallback enabled services degrade to mock; reaching here means
           fallback is disabled or something unexpected failed. Show a clean
           error, keep the UI alive. */
        setState((s) => ({
          ...s,
          analysis: "error",
          analysisProgress: 0,
          pipelineStage: "Failed",
          backendNotice: {
            tone: "critical",
            message: `Analysis pipeline failed: ${errorMessage(error)}`,
          },
        }));
      } finally {
        pipelineRunningRef.current = false;
      }
    },
    [appendActivity, patch],
  );

  const runAnalysis = useCallback(() => {
    void executePipeline(stateRef.current.incident);
  }, [executePipeline]);

  /* ------------------------------------------------------------------ */
  /* Automatic pipeline — the single initial action. Once hydration      */
  /* settles and an active disruption is present, the full analysis      */
  /* chain runs without any further clicks: graph → agents → recovery.   */
  /* The user only interacts later for a real decision (approval/chaos). */
  /* ------------------------------------------------------------------ */

  const autoRunAnalysis = useCallback(() => {
    if (autoRanRef.current) return;
    autoRanRef.current = true;
    const hasActive = (stateRef.current.activeDisruptions ?? 0) > 0;
    if (hasActive) void executePipeline(stateRef.current.incident);
  }, [executePipeline]);

  /* Kick the pipeline once after the on-mount hydration pass settles. */
  useEffect(() => {
    if (!state.hydrated) return;
    autoRunAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated]);

  /** Flow A — user selected a supplier/resource; inject it, then run the pipeline. */
  const injectDisruption = useCallback(
    (target: InjectDisruptionTarget) => {
      void (async () => {
        if (pipelineRunningRef.current) return;
        pipelineRunningRef.current = true;
        try {
          patch({
            analysis: "idle",
            analysisProgress: 0,
            pipelineStage: "Processing disruption",
            backendNotice: null,
            capabilityIdentified: false,
            resourcesDiscovered: false,
            pathsGenerated: false,
            selectedPathId: null,
            recommendedPathId: null,
            recoveryStatus: "NOT STARTED",
            graphAnalysis: null,
            incidentOpen: true,
          });
          const env = await disruptionService.injectDisruption(target);
          const isMock = env.source === "mock";
          appendActivity({
            time: isMock ? clock(16) : realNow(),
            channel: "SENSING",
            text: `Disruption injected on ${target.resourceType} ${target.resourceId} — incident ${env.data.id}.`,
          });
          appendAudit({
            time: isMock ? "08:42" : realNow(false),
            label: "Disruption injected",
            detail: `${target.resourceType} ${target.resourceId} · ${env.data.id} opened`,
            tone: "critical",
          });
          pipelineRunningRef.current = false;
          await executePipeline(env.data);
        } catch (error) {
          pipelineRunningRef.current = false;
          patch({
            analysis: "error",
            pipelineStage: "Failed",
            backendNotice: {
              tone: "critical",
              message: `Could not inject disruption: ${errorMessage(error)}`,
            },
          });
        }
      })();
    },
    [appendActivity, appendAudit, executePipeline, patch],
  );

  const selectPath = useCallback(
    (id: RecoveryPath["id"] | null) => patch({ selectedPathId: id }),
    [patch],
  );

  /* ------------------------------------------------------------------ */
  /* Human approval (flow F) — decision is persisted via the recovery    */
  /* service; local state updates after the submission resolves.         */
  /* ------------------------------------------------------------------ */

  const decideRecovery = useCallback(
    async (decision: ApprovalDecisionType) => {
      const current = stateRef.current;
      const pathId =
        decision === "ALTERNATIVE_REQUESTED"
          ? (current.selectedPathId ?? current.recommendedPathId)
          : current.recommendedPathId;
      if (!pathId || current.approving) return;

      patch({ approving: true });
      try {
        const env = await recoveryService.submitApproval({
          disruptionId: current.incident.id,
          ...(current.lastWorkflow?.workflowId
            ? { workflowId: current.lastWorkflow.workflowId }
            : {}),
          pathId,
          decision,
          decidedBy: user.name,
        });
        const isMock = env.source === "mock";

        if (decision === "APPROVED") {
          appendActivity({
            time: isMock ? clock(72) : realNow(),
            channel: "HUMAN",
            text: `Path ${pathId} approved. Execution handoff ready.`,
          });
          appendAudit({
            time: isMock ? "08:51" : realNow(false),
            label: "Recovery plan approved",
            detail: `Path ${pathId} · approved by ${user.name} · execution handoff ready`,
            tone: "success",
          });
        } else if (decision === "REJECTED") {
          appendActivity({
            time: isMock ? clock(70) : realNow(),
            channel: "HUMAN",
            text: "Recommendation rejected. Incident remains open.",
          });
          appendAudit({
            time: isMock ? "08:50" : realNow(false),
            label: "Recommendation rejected",
            detail: `Path ${pathId} rejected · incident remains open`,
            tone: "critical",
          });
        } else {
          appendActivity({
            time: isMock ? clock(70) : realNow(),
            channel: "SCENARIO",
            text: "Re-ranking paths under manager constraint: prefer internal-only sourcing.",
          });
          appendAudit({
            time: isMock ? "08:50" : realNow(false),
            label: "Alternative requested",
            detail: `${user.name} requested review of Path ${pathId}`,
            tone: "warning",
          });
        }

        patch({
          approving: false,
          recoveryStatus:
            decision === "APPROVED"
              ? "APPROVED"
              : decision === "REJECTED"
                ? "REJECTED"
                : "ALTERNATIVE REQUESTED",
          ...(decision === "APPROVED"
            ? { activeDisruptions: 0, resilience: 93, redundancy: 4.4, readiness: 96 }
            : {}),
          ...(decision === "ALTERNATIVE_REQUESTED" && isMock ? { selectedPathId: "B" } : {}),
          dataSource: env.source === "live" ? "live" : current.dataSource,
          backendNotice: isMock ? mockNotice() : null,
        });
      } catch (error) {
        patch({
          approving: false,
          backendNotice: {
            tone: "critical",
            message: `Could not record decision: ${errorMessage(error)}`,
          },
        });
      }
    },
    [appendActivity, appendAudit, patch],
  );

  const approveRecovery = useCallback(() => void decideRecovery("APPROVED"), [decideRecovery]);
  const requestAlternative = useCallback(
    () => void decideRecovery("ALTERNATIVE_REQUESTED"),
    [decideRecovery],
  );
  const rejectRecovery = useCallback(() => void decideRecovery("REJECTED"), [decideRecovery]);

  const toggleChaos = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      chaosToggles: s.chaosToggles.includes(id)
        ? s.chaosToggles.filter((x) => x !== id)
        : [...s.chaosToggles, id],
      chaosResult: null,
      chaosProgress: 0,
    }));
  }, []);

  const clearChaos = useCallback(
    () => patch({ chaosToggles: [], chaosResult: null, chaosProgress: 0 }),
    [patch],
  );

  /** Flow D — simulation via the recovery/simulation engine (no local computation). */
  const runChaos = useCallback(() => {
    void (async () => {
      const failureIds = stateRef.current.chaosToggles;
      if (failureIds.length === 0 || stateRef.current.chaosRunning) return;

      patch({
        chaosRunning: true,
        chaosProgress: 25,
        pipelineStage: "Evaluating scenarios",
        backendNotice: null,
      });
      try {
        const env = await simulationService.runSimulation({ failureIds });
        const isMock = env.source === "mock";
        const result = env.data;

        appendActivity({
          time: isMock ? clock(150) : realNow(),
          channel: "SCENARIO",
          text: isMock
            ? "Chaos simulation complete. 3 critical dependencies found."
            : `Chaos simulation complete. ${result.vulnerabilities.length} critical dependencies found.`,
        });
        appendAudit({
          time: isMock ? "09:12" : realNow(false),
          label: "Chaos simulation completed",
          detail: isMock
            ? "Hidden dependency exposed · CAP-PPC-004 shared by 5 suppliers"
            : `Resilience ${result.resilienceBefore} → ${result.resilienceAfter} · ${result.vulnerabilities.length} hidden dependencies exposed`,
          tone: "critical",
        });

        patch({
          chaosRunning: false,
          chaosProgress: 100,
          chaosResult: result,
          vulnerabilities: result.vulnerabilities,
          dataSource: env.source === "live" ? "live" : stateRef.current.dataSource,
          backendNotice: isMock ? mockNotice() : null,
          pipelineStage: "Completed",
        });
      } catch (error) {
        patch({
          chaosRunning: false,
          chaosProgress: 0,
          backendNotice: {
            tone: "critical",
            message: `Chaos simulation failed: ${errorMessage(error)}`,
          },
        });
      }
    })();
  }, [appendActivity, appendAudit, patch]);

  const addResiliencePlan = useCallback(
    (id: string) => {
      setState((s) =>
        s.resiliencePlans.includes(id)
          ? s
          : {
              ...s,
              resiliencePlans: [...s.resiliencePlans, id],
              readiness: Math.min(99, s.readiness + 2),
            },
      );
      appendAudit({
        time: realNow(false),
        label: "Resilience plan added",
        detail: `Mitigation queued for ${id}`,
        tone: "success",
      });
    },
    [appendAudit],
  );

  const setPresentation = useCallback((on: boolean) => patch({ presentation: on }), [patch]);
  const setAgentPanelOpen = useCallback((on: boolean) => patch({ agentPanelOpen: on }), [patch]);
  const dismissNotice = useCallback(() => patch({ backendNotice: null }), [patch]);

  const stopDemo = useCallback(() => {
    clearDemoTimer();
    patch({ demoRunning: false, demoLabel: "", demoStep: 0 });
  }, [clearDemoTimer, patch]);

  const resetDemo = useCallback(() => {
    clearDemoTimer();
    pollAbortRef.current?.abort();
    pipelineRunningRef.current = false;
    autoRanRef.current = false;
    setState({ ...initialState, presentation: stateRef.current.presentation });
    navigate({ to: "/" });
  }, [clearDemoTimer, navigate]);

  /** Demo tour. Data stages (`auto`) advance on their own; `decision` stages
      pause until the user actually performs the action (`decided` returns true),
      then the tour resumes automatically. */
  type DemoStep = {
    label: string;
    kind: "auto" | "decision";
    run: () => void;
    decided?: (s: ParallaxState) => boolean;
  };
  const demoSteps = useMemo<DemoStep[]>(
    () => [
      {
        label: "Disruption detected",
        kind: "auto",
        run: () => {
          patch({ incidentOpen: true });
          navigate({ to: "/disruptions" });
        },
      },
      { label: "Agentic analysis", kind: "auto", run: () => runAnalysis() },
      {
        label: "Capability identified",
        kind: "auto",
        run: () => navigate({ to: "/capability-map" }),
      },
      { label: "Resource discovery", kind: "auto", run: () => navigate({ to: "/resources" }) },
      {
        label: "Recovery paths generated",
        kind: "auto",
        run: () => navigate({ to: "/recovery-paths" }),
      },
      {
        label: "Recommendation opened",
        kind: "auto",
        run: () => patch({ selectedPathId: stateRef.current.recommendedPathId ?? "C" }),
      },
      {
        label: "Human approval",
        kind: "decision",
        run: () => navigate({ to: "/audit" }),
        decided: (s) =>
          s.recoveryStatus === "APPROVED" ||
          s.recoveryStatus === "REJECTED" ||
          s.recoveryStatus === "ALTERNATIVE REQUESTED",
      },
      {
        label: "Break My Supply Chain",
        kind: "decision",
        run: () => {
          navigate({ to: "/break-my-supply-chain" });
          patch({ chaosToggles: ["supplier", "cert"] });
        },
        decided: (s) => s.chaosResult !== null,
      },
    ],
    [navigate, patch, runAnalysis],
  );

  const demoStepsRef = useRef<DemoStep[]>(demoSteps);
  demoStepsRef.current = demoSteps;
  const demoRunningRef = useRef(false);
  demoRunningRef.current = state.demoRunning;

  /** Run step `index` (0-based) and display it. Auto steps chain to the next
      step after a delay; decision steps pause until the user acts, at which
      point the effect below resumes the tour. */
  const runStep = useCallback(
    (index: number) => {
      if (!demoRunningRef.current) return;
      const step = demoStepsRef.current[index];
      if (!step) {
        patch({ demoRunning: false, demoStep: 0, demoLabel: "" });
        return;
      }
      step.run();
      patch({ demoStep: index + 1, demoLabel: step.label });
      if (step.kind === "auto") {
        demoTimerRef.current = window.setTimeout(() => runStep(index + 1), DEMO_AUTO_MS);
      }
    },
    [patch],
  );

  const startDemo = useCallback(() => {
    clearDemoTimer();
    pollAbortRef.current?.abort();
    pipelineRunningRef.current = false;
    autoRanRef.current = false;
    setState({
      ...initialState,
      presentation: stateRef.current.presentation,
      demoRunning: true,
      demoStep: 0,
      demoLabel: demoSteps[0]?.label ?? "",
    });
    navigate({ to: "/" });
    demoTimerRef.current = window.setTimeout(() => runStep(0), DEMO_HOLD_MS);
  }, [clearDemoTimer, demoSteps, navigate, runStep]);

  /** When a decision step's predicate is met, resume the tour at the
      following step (running the next step, or ending at the last one). */
  useEffect(() => {
    const current = state.demoStep - 1;
    const step = demoStepsRef.current[current];
    if (!step || step.kind !== "decision") return;
    if (step.decided?.(state) === true) runStep(state.demoStep);
  }, [state, runStep]);

  const value = useMemo<ParallaxApi>(
    () => ({
      ...state,
      recommendedPath: state.recommendedPathId
        ? (state.paths.find((p) => p.id === state.recommendedPathId) ?? null)
        : null,
      openIncident,
      runAnalysis,
      injectDisruption,
      selectPath,
      approveRecovery,
      requestAlternative,
      rejectRecovery,
      toggleChaos,
      runChaos,
      clearChaos,
      addResiliencePlan,
      setPresentation,
      setAgentPanelOpen,
      startDemo,
      demoTotalSteps: demoSteps.length,
      stopDemo,
      resetDemo,
      dismissNotice,
      score: scorePath,
    }),
    [
      state,
      openIncident,
      runAnalysis,
      injectDisruption,
      selectPath,
      approveRecovery,
      requestAlternative,
      rejectRecovery,
      toggleChaos,
      runChaos,
      clearChaos,
      addResiliencePlan,
      setPresentation,
      setAgentPanelOpen,
      startDemo,
      demoSteps,
      stopDemo,
      resetDemo,
      dismissNotice,
    ],
  );

  return <ParallaxContext.Provider value={value}>{children}</ParallaxContext.Provider>;
}

export function useParallax() {
  const ctx = useContext(ParallaxContext);
  if (!ctx) throw new Error("useParallax must be used inside ParallaxProvider");
  return ctx;
}
