import { eq } from "drizzle-orm";
import { z } from "zod";

import type {
  AffectedCapability,
  AffectedResource,
  AlternativeResource,
  GraphAnalysisResult,
  RedundancyScore,
} from "@/types/parallax";

import { db } from "../db/client";
import {
  capabilities,
  capabilityRequirements,
  graphEdges as graphEdgesTable,
  graphNodes as graphNodesTable,
  hiddenDependenciesTable,
  suppliers,
} from "../db/schema";
import type { ApiResponse, Handler } from "./router";
import { HttpError } from "./router";

/**
 * POST /api/graph/analyze
 *
 * Deterministic graph analysis for a given disruption.  Reads the disruption
 * context (provided by the caller) and cross-references the DB to produce
 * affected capabilities, affected resources, alternative suppliers, and
 * redundancy scores.  This is the same logic that the mock `mockAnalysis`
 * function in graphService.ts performed, but now powered by live DB data.
 */
const analyzeSchema = z.object({
  disruptionId: z.string().min(1, "disruptionId is required"),
  capabilityId: z.string().optional(),
  resourceId: z.string().optional(),
});

const analyze: Handler = async ({ body }): Promise<ApiResponse> => {
  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new HttpError(400, "VALIDATION_ERROR", `Invalid payload — ${detail}`);
  }

  const { disruptionId, capabilityId } = parsed.data;
  const capId = capabilityId ?? "CAP-THS-017";

  const capabilityRow = db.select().from(capabilities).where(eq(capabilities.id, capId)).get();
  const capName = capabilityRow?.name ?? "Unknown Capability";

  const allCapabilities = db.select().from(capabilities).all();
  const reqRows = db.select().from(capabilityRequirements).all();
  const reqMap = new Map<string, string[]>();
  for (const r of reqRows) {
    const list = reqMap.get(r.capabilityId) ?? [];
    list.push(r.requirementId);
    reqMap.set(r.capabilityId, list);
  }

  // Nodes of kind=capability that have status other than AVAILABLE
  const capNodes = db.select().from(graphNodesTable).all().filter((n) => n.kind === "capability");
  const affectedCapabilities: AffectedCapability[] = capNodes.map((n) => {
    const reg = allCapabilities.find((c) => c.id === n.id);
    return {
      id: n.id,
      name: n.label,
      status: n.status as AffectedCapability["status"],
      redundancy: reg?.redundancy ?? 1,
      targetRedundancy: reg?.targetRedundancy ?? 3,
      dependencies: reqMap.get(n.id)?.length ?? 0,
      provider: n.meta,
      impacted: n.status !== "AVAILABLE",
    };
  });

  // Affected resources: suppliers whose status is not AVAILABLE
  const allSuppliers = db.select().from(suppliers).all();
  const affectedResources: AffectedResource[] = allSuppliers
    .filter((s) => s.status !== "AVAILABLE" || s.capabilities.includes(capId))
    .map((s) => ({
      id: s.id,
      kind: "supplier" as const,
      name: s.name,
      status: s.status as AffectedResource["status"],
      role: s.status === "OFFLINE" ? "affected" : "supporting",
      note: s.constraints,
    }));

  // Hidden dependencies
  const allHidden = db.select().from(hiddenDependenciesTable).all();
  const hiddenDeps = allHidden.map((h) => ({
    id: h.id,
    name: h.name,
    impact: h.impact,
    alternatives: h.alternatives,
    redundancy: h.redundancy,
    target: h.target,
    mitigation: h.mitigation,
    sharedBy: h.sharedBy,
  }));

  // Alternative resources: available suppliers with the target capability
  const alternativeResources: AlternativeResource[] = allSuppliers
    .filter((s) => s.status === "AVAILABLE" && s.capabilities.includes(capId))
    .map((s) => ({
      id: s.id,
      name: s.name,
      kind: "supplier" as const,
      leadTimeDays: s.leadTimeDays,
      qualified: s.tier === 1 && s.status === "AVAILABLE",
      note: s.constraints,
    }));

  // Redundancy scores
  const redundancyScores: RedundancyScore[] = allCapabilities.map((c) => ({
    capabilityId: c.id,
    capabilityName: c.name,
    redundancy: c.redundancy,
    target: c.targetRedundancy,
  }));

  const result: GraphAnalysisResult = {
    disruptionId,
    capabilityId: capId,
    capabilityName: capName,
    affectedCapabilities,
    affectedResources,
    hiddenDependencies: hiddenDeps,
    alternativeResources,
    redundancyScores,
  };

  return { status: 200, body: result };
};

/**
 * GET /api/graph/network
 *
 * Returns the full capability network graph (nodes + edges) from the
 * database.  These are seeded from data.ts.
 */
const network: Handler = async (): Promise<ApiResponse> => {
  const nodes = db.select().from(graphNodesTable).all().map((row) => ({
    id: row.id,
    label: row.label,
    kind: row.kind,
    x: row.x,
    y: row.y,
    status: row.status,
    risk: row.risk,
    meta: row.meta,
  }));

  const edges = db.select().from(graphEdgesTable).all().map((row) => ({
    from: row.from,
    to: row.to,
    ...(row.critical ? { critical: true } : {}),
  }));

  return { status: 200, body: { nodes, edges } };
};

/**
 * GET /api/graph/hidden-dependencies
 *
 * Returns the list of hidden dependencies for the simulation / analysis UIs.
 */
const hiddenDeps: Handler = async (): Promise<ApiResponse> => {
  const rows = db.select().from(hiddenDependenciesTable).all();
  return {
    status: 200,
    body: rows.map((r) => ({
      id: r.id,
      name: r.name,
      impact: r.impact,
      alternatives: r.alternatives,
      redundancy: r.redundancy,
      target: r.target,
      mitigation: r.mitigation,
      sharedBy: r.sharedBy,
    })),
  };
};

export const graph = { analyze, network, hiddenDeps };
