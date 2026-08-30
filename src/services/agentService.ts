/**
 * PARALLAX — agentic orchestrator service (backend: Riya).
 *
 * Starts an agent workflow for a disruption and polls its progress. Each poll
 * returns the full AgentWorkflow (steps, per-agent messages, recommendation,
 * compliance, human-approval requirement) and the store applies it so the
 * AgentActivity panel reacts to real backend progress.
 *
 * Mock mode completes instantly from agentDefs — no fake timers, mirroring the
 * prototype's "one click = one deterministic pass" behaviour.
 * See FRONTEND_INTEGRATION_PLAN.md §3.4.
 */

import type { AgentStep, AgentWorkflow } from "@/types/parallax";
import { agentDefs, recoveryPaths } from "@/lib/parallax/data";
import { get, post, withFallback, type ApiEnvelope } from "./api";
import { apiConfig } from "./config";

export const POLL_INTERVAL_MS = 1500;

/** Flow E — deterministic mock workflow: every agent completes with its doneMessage. */
function mockWorkflow(disruptionId: string): AgentWorkflow {
  const steps: AgentStep[] = agentDefs.map((def) => ({
    id: def.id,
    code: def.code,
    name: def.name,
    status: "COMPLETE",
    message: def.doneMessage,
  }));

  const recommended = recoveryPaths.find((p) => p.id === "C");

  return {
    workflowId: `WF-${disruptionId}`,
    disruptionId,
    status: "COMPLETE",
    progress: 100,
    steps,
    ...(recommended
      ? { recommendation: { pathId: recommended.id, summary: recommended.rationale, score: 94 } }
      : {}),
    compliance: {
      status: "PATH C COMPLIANT",
      requiresHumanVerification: true,
      note: "Human verification required for GDP cold-chain sign-off.",
    },
    requiresHumanApproval: true,
    summary: "3 viable configurations generated. Path C scored highest — 94/100.",
  };
}

export function startWorkflow(disruptionId: string): Promise<ApiEnvelope<AgentWorkflow>> {
  return withFallback<AgentWorkflow>({
    label: `start agent workflow (${disruptionId})`,
    live: () => post<AgentWorkflow>(`${apiConfig.urls.agents()}/workflows`, { disruptionId }),
    mock: () => mockWorkflow(disruptionId),
  });
}

export function getWorkflow(workflowId: string): Promise<ApiEnvelope<AgentWorkflow>> {
  return withFallback<AgentWorkflow>({
    label: `agent workflow status (${workflowId})`,
    live: () =>
      get<AgentWorkflow>(`${apiConfig.urls.agents()}/workflows/${encodeURIComponent(workflowId)}`),
    mock: () => mockWorkflow(extractDisruptionId(workflowId)),
  });
}

function extractDisruptionId(workflowId: string): string {
  return workflowId.startsWith("WF-") ? workflowId.slice(3) : workflowId;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Poll a live workflow until it settles. `onUpdate` receives every snapshot so
 * the UI can stream agent progress. Returns the final workflow state.
 * Only used in live mode — the mock workflow completes on start.
 */
export async function pollWorkflow(
  workflowId: string,
  onUpdate: (workflow: AgentWorkflow) => void,
  options: { signal?: AbortSignal; intervalMs?: number; maxAttempts?: number } = {},
): Promise<AgentWorkflow> {
  const { signal, intervalMs = POLL_INTERVAL_MS, maxAttempts = 200 } = options;
  let latest: AgentWorkflow | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (signal?.aborted) break;
    const { data } = await getWorkflow(workflowId);
    latest = data;
    onUpdate(data);
    if (data.status === "COMPLETE" || data.status === "FAILED") return data;
    await sleep(intervalMs);
  }

  if (latest) return latest;
  throw new Error(`Workflow ${workflowId} did not settle within ${maxAttempts} polls`);
}
