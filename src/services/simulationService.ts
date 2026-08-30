/**
 * PARALLAX — simulation service (backend: Diya).
 *
 * "Break My Supply Chain": remove resources from the network and report
 * before/after resilience, affected capabilities and hidden vulnerabilities.
 * The mock computation below is the exact logic the prototype used in
 * src/lib/parallax/store.tsx (moved here so the store stays UI-only).
 * See FRONTEND_INTEGRATION_PLAN.md §3.3.
 */

import type { FailureToggle, SimulationResult } from "@/types/parallax";
import {
  failureToggles,
  hiddenDependencies,
  capabilityById,
  thermoShieldDecomposition,
} from "@/lib/parallax/data";
import { get, post, withFallback, type ApiEnvelope } from "./api";
import { apiConfig } from "./config";

const BASE_RESILIENCE = 87;

export interface RunSimulationPayload {
  failureIds: string[];
}

/** Flow D — deterministic mock simulation, identical to the prototype's behaviour. */
function mockSimulation({ failureIds }: RunSimulationPayload): SimulationResult {
  const selected = failureToggles.filter((f) => failureIds.includes(f.id));
  const hit = selected.reduce((sum, f) => sum + f.resilienceHit, 0);
  const removed = selected.flatMap((f) => f.removes);

  return {
    simulationId: `SIM-${failureIds.sort().join("-").toUpperCase()}`,
    failureIds,
    removed,
    resilienceBefore: BASE_RESILIENCE,
    resilienceAfter: Math.max(18, BASE_RESILIENCE - hit),
    affectedCapabilities: thermoShieldDecomposition.map((node) => {
      const register = capabilityById[node.id];
      return {
        id: node.id,
        name: node.label,
        status: node.status,
        redundancy: register?.redundancy ?? 1,
        targetRedundancy: register?.targetRedundancy ?? 3,
        dependencies: node.dependencies,
        provider: node.provider,
      };
    }),
    vulnerabilities: hiddenDependencies,
    supplierRedundancy: 5,
    capabilityRedundancy: 1,
  };
}

export function runSimulation(
  payload: RunSimulationPayload,
): Promise<ApiEnvelope<SimulationResult>> {
  return withFallback<SimulationResult>({
    label: `chaos simulation (${payload.failureIds.join(", ") || "none"})`,
    live: () => post<SimulationResult>(`${apiConfig.urls.simulation()}/run`, payload),
    mock: () => mockSimulation(payload),
  });
}

export function getFailureToggles(): Promise<ApiEnvelope<FailureToggle[]>> {
  return withFallback<FailureToggle[]>({
    label: "failure toggles",
    live: () => get<FailureToggle[]>(`${apiConfig.urls.simulation()}/failure-toggles`),
    mock: () => failureToggles,
  });
}
