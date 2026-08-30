/**
 * PARALLAX — capability graph service (backend: Suvreen).
 *
 * Dependency analysis: affected capabilities, affected resources, hidden
 * dependencies, alternative resources and redundancy scores.
 * Mock responses are derived from src/lib/parallax/data.ts and are temporary
 * until the graph endpoints exist (see FRONTEND_INTEGRATION_PLAN.md §3.2).
 */

import type {
  AffectedCapability,
  AlternativeResource,
  AffectedResource,
  Capability,
  CapabilityNetwork,
  GraphAnalysisResult,
} from "@/types/parallax";
import {
  capabilities,
  capabilityById,
  graphEdges,
  graphNodes,
  hiddenDependencies,
  suppliers,
  thermoShieldDecomposition,
  activeDisruption,
} from "@/lib/parallax/data";
import { get, post, withFallback, type ApiEnvelope } from "./api";
import { apiConfig } from "./config";

export interface AnalyzeGraphParams {
  disruptionId: string;
  capabilityId?: string;
  resourceId?: string;
}

/** Flow B — deterministic mock analysis assembled from the static demo graph. */
function mockAnalysis(params: AnalyzeGraphParams): GraphAnalysisResult {
  const capabilityId = params.capabilityId ?? activeDisruption.capabilityId ?? "CAP-THS-017";
  const capability = capabilityById[capabilityId];

  const affectedCapabilities: AffectedCapability[] = thermoShieldDecomposition.map((node) => {
    const register = capabilityById[node.id];
    return {
      id: node.id,
      name: node.label,
      status: node.status,
      redundancy: register?.redundancy ?? 1,
      targetRedundancy: register?.targetRedundancy ?? 3,
      dependencies: node.dependencies,
      provider: node.provider,
      impacted: node.status !== "AVAILABLE",
    };
  });

  const affectedResources: AffectedResource[] = [
    {
      id: activeDisruption.supplierId ?? "SUP-1001",
      kind: "supplier",
      name: activeDisruption.supplier ?? "MedCore Components Ltd.",
      status: "OFFLINE",
      role: "affected",
      note: "Sole source — availability event detected",
    },
    ...thermoShieldDecomposition
      .filter((n) => n.status !== "AVAILABLE")
      .map((n) => ({
        id: n.id,
        kind: "capability" as const,
        name: n.label,
        status: n.status,
        role: "supporting" as const,
        note: n.provider,
      })),
  ];

  const alternativeResources: AlternativeResource[] = suppliers
    .filter((s) => s.status === "AVAILABLE" && s.capabilities.includes(capabilityId))
    .map((s) => ({
      id: s.id,
      name: s.name,
      kind: "supplier" as const,
      leadTimeDays: s.leadTimeDays,
      qualified: s.tier === 1 && s.status === "AVAILABLE",
      note: s.constraints,
    }));

  return {
    disruptionId: params.disruptionId,
    capabilityId,
    capabilityName: capability?.name ?? "ThermoShield Packaging",
    affectedCapabilities,
    affectedResources,
    hiddenDependencies,
    alternativeResources,
    redundancyScores: capabilities.map((c) => ({
      capabilityId: c.id,
      capabilityName: c.name,
      redundancy: c.redundancy,
      target: c.targetRedundancy,
    })),
  };
}

export function analyzeGraph(
  params: AnalyzeGraphParams,
): Promise<ApiEnvelope<GraphAnalysisResult>> {
  return withFallback<GraphAnalysisResult>({
    label: `capability graph analysis (${params.disruptionId})`,
    live: () => post<GraphAnalysisResult>(`${apiConfig.urls.graph()}/analyze`, params),
    mock: () => mockAnalysis(params),
  });
}

export function getCapabilities(): Promise<ApiEnvelope<Capability[]>> {
  return withFallback<Capability[]>({
    label: "capability register",
    live: () => get<Capability[]>(`${apiConfig.urls.graph()}/capabilities`),
    mock: () => capabilities,
  });
}

export function getCapabilityNetwork(): Promise<ApiEnvelope<CapabilityNetwork>> {
  return withFallback<CapabilityNetwork>({
    label: "capability network graph",
    live: () => get<CapabilityNetwork>(`${apiConfig.urls.graph()}/network`),
    mock: () => ({ nodes: graphNodes, edges: graphEdges }),
  });
}
