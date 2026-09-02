import type { FailureToggle, SimulationResult } from "@/types/parallax";
import {
  capabilityById,
  failureToggles,
  hiddenDependencies,
  thermoShieldDecomposition,
} from "@/lib/parallax/data";
import type { ApiResponse, Handler } from "./router";

const BASE_RESILIENCE = 87;

/**
 * POST /api/simulation/run
 */
const run: Handler = async ({ body }): Promise<ApiResponse> => {
  const reqBody = (body as Record<string, unknown>) ?? {};
  const failureIds = Array.isArray(reqBody["failureIds"])
    ? (reqBody["failureIds"] as string[])
    : [];

  const selected = failureToggles.filter((f) => failureIds.includes(f.id));
  const hit = selected.reduce((sum, f) => sum + f.resilienceHit, 0);
  const removed = selected.flatMap((f) => f.removes);

  const result: SimulationResult = {
    simulationId: `SIM-${failureIds.slice().sort().join("-").toUpperCase() || "EMPTY"}`,
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

  return { status: 200, body: result };
};

/**
 * GET /api/simulation/failure-toggles
 */
const getFailureToggles: Handler = async (): Promise<ApiResponse> => {
  return { status: 200, body: failureToggles };
};

export const simulation = { run, failureToggles: getFailureToggles };
