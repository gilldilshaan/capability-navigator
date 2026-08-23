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
  agentDefs,
  failureToggles,
  recoveryPaths,
  type RecoveryPath,
} from "./data";

export type AgentStatus = "QUEUED" | "RUNNING" | "COMPLETE";

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

export type AnalysisState = "idle" | "running" | "complete";
export type RecoveryStatus =
  | "NOT STARTED"
  | "AWAITING APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "ALTERNATIVE REQUESTED";

export interface ChaosResult {
  before: number;
  after: number;
  removed: string[];
  toggles: string[];
  supplierRedundancy: number;
  capabilityRedundancy: number;
}

interface ParallaxState {
  /* incident + analysis */
  incidentOpen: boolean;
  analysis: AnalysisState;
  analysisProgress: number;
  agents: AgentState[];
  activity: ActivityEntry[];
  audit: AuditEntry[];
  capabilityIdentified: boolean;
  resourcesDiscovered: boolean;
  pathsGenerated: boolean;
  selectedPathId: RecoveryPath["id"] | null;
  recommendedPathId: RecoveryPath["id"] | null;
  recoveryStatus: RecoveryStatus;
  /* network */
  resilience: number;
  activeDisruptions: number;
  redundancy: number;
  readiness: number;
  /* chaos */
  chaosToggles: string[];
  chaosRunning: boolean;
  chaosProgress: number;
  chaosResult: ChaosResult | null;
  resiliencePlans: string[];
  /* presentation + demo */
  presentation: boolean;
  demoRunning: boolean;
  demoStep: number;
  demoLabel: string;
  agentPanelOpen: boolean;
}

interface ParallaxApi extends ParallaxState {
  paths: RecoveryPath[];
  recommendedPath: RecoveryPath | null;
  openIncident: () => void;
  runAnalysis: () => void;
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
  nextDemoStep: () => void;
  demoTotalSteps: number;
  stopDemo: () => void;
  resetDemo: () => void;
  score: (p: RecoveryPath) => number;
}

const BASE_RESILIENCE = 87;

const initialState: ParallaxState = {
  incidentOpen: false,
  analysis: "idle",
  analysisProgress: 0,
  agents: agentDefs.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    status: a.id === "AGT-01" ? "COMPLETE" : "QUEUED",
    message: a.id === "AGT-01" ? a.doneMessage : a.queuedMessage,
  })),
  activity: [
    { id: 1, time: "08:42:11", channel: "SENSING", text: "Supplier disruption detected — MedCore Components Ltd. (SUP-1001)." },
    { id: 2, time: "08:42:12", channel: "SYSTEM", text: "Incident INC-2048 opened. Severity CRITICAL." },
  ],
  audit: [
    { id: 1, time: "08:42", label: "Disruption detected", detail: "SUP-1001 availability event · INC-2048 opened", tone: "critical" },
  ],
  capabilityIdentified: false,
  resourcesDiscovered: false,
  pathsGenerated: false,
  selectedPathId: null,
  recommendedPathId: null,
  recoveryStatus: "NOT STARTED",
  resilience: BASE_RESILIENCE,
  activeDisruptions: 1,
  redundancy: 3.8,
  readiness: 92,
  chaosToggles: [],
  chaosRunning: false,
  chaosProgress: 0,
  chaosResult: null,
  resiliencePlans: [],
  presentation: false,
  demoRunning: false,
  demoStep: 0,
  demoLabel: "",
  agentPanelOpen: true,
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

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ParallaxState>(initialState);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const navigate = useNavigate();

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const later = useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const patch = useCallback((p: Partial<ParallaxState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const log = useCallback((offset: number, channel: string, text: string) => {
    setState((s) => ({
      ...s,
      activity: [...s.activity, { id: nextId(), time: clock(offset), channel, text }],
    }));
  }, []);

  const audit = useCallback(
    (time: string, label: string, detail: string, tone: AuditEntry["tone"] = "info") => {
      setState((s) => ({
        ...s,
        audit: [...s.audit, { id: nextId(), time, label, detail, tone }],
      }));
    },
    [],
  );

  const openIncident = useCallback(() => {
    patch({ incidentOpen: true });
    navigate({ to: "/disruptions" });
  }, [navigate, patch]);

  const runAnalysis = useCallback(() => {
    setState((s) =>
      s.analysis === "running"
        ? s
        : {
            ...s,
            incidentOpen: true,
            analysis: "running",
            analysisProgress: 0,
            capabilityIdentified: false,
            resourcesDiscovered: false,
            pathsGenerated: false,
            recommendedPathId: null,
            recoveryStatus: "NOT STARTED",
            agents: agentDefs.map((a, i) => ({
              id: a.id,
              code: a.code,
              name: a.name,
              status: i === 0 ? "COMPLETE" : "QUEUED",
              message: i === 0 ? a.doneMessage : a.queuedMessage,
            })),
          },
    );

    let t = 0;
    agentDefs.forEach((def, i) => {
      if (i === 0) return;
      const start = t;
      t += def.durationMs;
      const end = t;

      later(start, () => {
        setState((s) => ({
          ...s,
          analysisProgress: Math.round((i / agentDefs.length) * 100),
          agents: s.agents.map((a) =>
            a.id === def.id ? { ...a, status: "RUNNING", message: def.runningMessage } : a,
          ),
        }));
        log(20 + Math.round(start / 100), def.code, def.runningMessage);
      });

      later(end, () => {
        setState((s) => ({
          ...s,
          agents: s.agents.map((a) =>
            a.id === def.id ? { ...a, status: "COMPLETE", message: def.doneMessage } : a,
          ),
        }));
        log(20 + Math.round(end / 100), def.code, def.doneMessage);

        if (def.code === "CAPABILITY") {
          patch({ capabilityIdentified: true });
          audit("08:43", "Capability identified", "CAP-THS-017 · ThermoShield Packaging · 7 sub-capabilities", "info");
        }
        if (def.code === "RESOURCE") {
          patch({ resourcesDiscovered: true });
          audit("08:44", "Resources discovered", "31 of 48 enterprise resources usable", "info");
        }
        if (def.code === "RECONSTRUCTION") {
          patch({ pathsGenerated: true });
          audit("08:45", "3 recovery paths generated", "Path A · Path B · Path C", "info");
        }
        if (def.code === "SCENARIO") {
          audit("08:46", "Scenario simulation completed", "Weighted scoring across 5 factors", "info");
        }
        if (def.code === "COMPLIANCE") {
          patch({
            analysis: "complete",
            analysisProgress: 100,
            recommendedPathId: "C",
            recoveryStatus: "AWAITING APPROVAL",
            readiness: 92,
          });
          audit("08:47", "Path C recommended", "Recovery score 94/100 · dependency risk LOW", "success");
          audit("08:48", "Awaiting human approval", "Routed to Aditi Sharma · Resilience Manager", "warning");
          log(60, "HUMAN", "Awaiting manager approval.");
        }
      });
    });
  }, [audit, later, log, patch]);

  const selectPath = useCallback((id: RecoveryPath["id"] | null) => patch({ selectedPathId: id }), [patch]);

  const approveRecovery = useCallback(() => {
    patch({
      recoveryStatus: "APPROVED",
      activeDisruptions: 0,
      resilience: 93,
      redundancy: 4.4,
      readiness: 96,
    });
    audit("08:51", "Recovery plan approved", "Path C · approved by Aditi Sharma · execution handoff ready", "success");
    log(72, "HUMAN", "Path C approved. Execution handoff ready.");
  }, [audit, log, patch]);

  const requestAlternative = useCallback(() => {
    patch({ recoveryStatus: "ALTERNATIVE REQUESTED", selectedPathId: "B" });
    audit("08:50", "Alternative requested", "Manager requested review of Path B · Alternate Manufacturing", "warning");
    log(70, "SCENARIO", "Re-ranking paths under manager constraint: prefer internal-only sourcing.");
  }, [audit, log, patch]);

  const rejectRecovery = useCallback(() => {
    patch({ recoveryStatus: "REJECTED" });
    audit("08:50", "Recommendation rejected", "Path C rejected · incident remains open", "critical");
    log(70, "HUMAN", "Recommendation rejected. Incident remains open.");
  }, [audit, log, patch]);

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

  const runChaos = useCallback(() => {
    setState((s) => {
      if (s.chaosRunning || s.chaosToggles.length === 0) return s;
      return { ...s, chaosRunning: true, chaosProgress: 0, chaosResult: null };
    });

    [200, 500, 900, 1300, 1700, 2100].forEach((ms, i) => {
      later(ms, () => patch({ chaosProgress: Math.round(((i + 1) / 6) * 100) }));
    });

    later(2300, () => {
      setState((s) => {
        const selected = failureToggles.filter((f) => s.chaosToggles.includes(f.id));
        const hit = selected.reduce((sum, f) => sum + f.resilienceHit, 0);
        const removed = selected.flatMap((f) => f.removes);
        const after = Math.max(18, BASE_RESILIENCE - hit);
        return {
          ...s,
          chaosRunning: false,
          chaosProgress: 100,
          chaosResult: {
            before: BASE_RESILIENCE,
            after,
            removed,
            toggles: s.chaosToggles,
            supplierRedundancy: 5,
            capabilityRedundancy: 1,
          },
        };
      });
      audit("09:12", "Chaos simulation completed", "Hidden dependency exposed · CAP-PPC-004 shared by 5 suppliers", "critical");
      log(150, "SCENARIO", "Chaos simulation complete. 3 critical dependencies found.");
    });
  }, [audit, later, log, patch]);

  const addResiliencePlan = useCallback(
    (id: string) => {
      setState((s) =>
        s.resiliencePlans.includes(id)
          ? s
          : { ...s, resiliencePlans: [...s.resiliencePlans, id], readiness: Math.min(99, s.readiness + 2) },
      );
      audit("09:15", "Resilience plan added", `Mitigation queued for ${id}`, "success");
    },
    [audit],
  );

  const setPresentation = useCallback((on: boolean) => patch({ presentation: on }), [patch]);
  const setAgentPanelOpen = useCallback((on: boolean) => patch({ agentPanelOpen: on }), [patch]);

  const stopDemo = useCallback(() => {
    clearTimers();
    patch({ demoRunning: false, demoLabel: "" });
  }, [clearTimers, patch]);

  const resetDemo = useCallback(() => {
    clearTimers();
    setState({ ...initialState, presentation: state.presentation });
    navigate({ to: "/" });
  }, [clearTimers, navigate, state.presentation]);

  const startDemo = useCallback(() => {
    clearTimers();
    setState({ ...initialState, presentation: state.presentation, demoRunning: true, demoLabel: "Supplier failure detected" });
    navigate({ to: "/" });

    const steps: { at: number; label: string; run: () => void }[] = [
      { at: 1400, label: "Agent detection", run: () => { patch({ incidentOpen: true }); navigate({ to: "/disruptions" }); } },
      { at: 2200, label: "Agentic analysis", run: () => runAnalysis() },
      { at: 8200, label: "Capability identified", run: () => navigate({ to: "/capability-map" }) },
      { at: 11200, label: "Resource discovery", run: () => navigate({ to: "/resources" }) },
      { at: 14200, label: "Recovery paths generated", run: () => navigate({ to: "/recovery-paths" }) },
      { at: 17200, label: "Recommendation opened", run: () => { patch({ selectedPathId: "C" }); } },
      { at: 20200, label: "Human approval", run: () => navigate({ to: "/audit" }) },
      { at: 22600, label: "Recovery approved", run: () => approveRecovery() },
      { at: 25600, label: "Break My Supply Chain", run: () => { navigate({ to: "/break-my-supply-chain" }); patch({ chaosToggles: ["supplier", "cert"] }); } },
      { at: 27600, label: "Chaos simulation", run: () => runChaos() },
      { at: 31200, label: "Demo complete", run: () => patch({ demoRunning: false, demoLabel: "" }) },
    ];

    steps.forEach((step, i) => {
      later(step.at, () => {
        patch({ demoStep: i + 1, demoLabel: step.label });
        step.run();
      });
    });
  }, [approveRecovery, clearTimers, later, navigate, patch, runAnalysis, runChaos, state.presentation]);

  const value = useMemo<ParallaxApi>(
    () => ({
      ...state,
      paths: recoveryPaths,
      recommendedPath: state.recommendedPathId
        ? recoveryPaths.find((p) => p.id === state.recommendedPathId) ?? null
        : null,
      openIncident,
      runAnalysis,
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
      stopDemo,
      resetDemo,
      score: scorePath,
    }),
    [
      state,
      openIncident,
      runAnalysis,
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
      stopDemo,
      resetDemo,
    ],
  );

  return <ParallaxContext.Provider value={value}>{children}</ParallaxContext.Provider>;
}

export function useParallax() {
  const ctx = useContext(ParallaxContext);
  if (!ctx) throw new Error("useParallax must be used inside ParallaxProvider");
  return ctx;
}
