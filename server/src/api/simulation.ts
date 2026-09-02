import { z } from "zod";

import type { SimulationResult } from "@/types/parallax";

import { db } from "../db/client";
import {
  capabilities,
  failureTogglesTable,
  hiddenDependenciesTable,
  simulations as simulationsTable,
} from "../db/schema";
import { thermoShieldDecomposition } from "../../../src/lib/parallax/data";
import type { ApiResponse, Handler } from "./router";
import { HttpError } from "./router";

const BASE_RESILIENCE = 87;

/**
 * POST /api/simulation/run
 *
 * Runs a chaos simulation: removes the specified resources from the
 * network and computes before/after resilience, affected capabilities,
 * and hidden vulnerabilities.  The simulation is persisted to the DB
 * so it survives page refreshes.
 */
const runSchema = z.object({
  failureIds: z.array(z.string()).default([]),
});

const run: Handler = async ({ body }): Promise<ApiResponse> => {
  const parsed = runSchema.safeParse(body ?? {});
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new HttpError(400, "VALIDATION_ERROR", `Invalid payload — ${detail}`);
  }

  const { failureIds } = parsed.data;

  // Fetch failure toggles from DB
  const allToggles = db.select().from(failureTogglesTable).all();
  const selected = allToggles.filter((f) => failureIds.includes(f.id));
  const hit = selected.reduce((sum, f) => sum + f.resilienceHit, 0);
  const removed = selected.flatMap((f) => f.removes);

  // Fetch capabilities and hidden deps from DB
  const allCapabilities = db.select().from(capabilities).all();
  const allHidden = db.select().from(hiddenDependenciesTable).all();

  const affectedCapabilities = thermoShieldDecomposition.map((node) => {
    const reg = allCapabilities.find((c) => c.id === node.id);
    return {
      id: node.id,
      name: node.label,
      status: node.status,
      redundancy: reg?.redundancy ?? 1,
      targetRedundancy: reg?.targetRedundancy ?? 3,
      dependencies: node.dependencies,
      provider: node.provider,
    };
  });

  const vulnerabilities = allHidden.map((h) => ({
    id: h.id,
    name: h.name,
    impact: h.impact,
    alternatives: h.alternatives,
    redundancy: h.redundancy,
    target: h.target,
    mitigation: h.mitigation,
    sharedBy: h.sharedBy,
  }));

  const simulationId = `SIM-${failureIds.length > 0 ? failureIds.sort().join("-").toUpperCase() : "BASE"}`;
  const resilienceAfter = Math.max(18, BASE_RESILIENCE - hit);

  const result: SimulationResult = {
    simulationId,
    failureIds,
    removed,
    resilienceBefore: BASE_RESILIENCE,
    resilienceAfter,
    affectedCapabilities,
    vulnerabilities,
    supplierRedundancy: 5,
    capabilityRedundancy: 1,
  };

  // Persist the simulation
  const now = new Date().toISOString();
  db.insert(simulationsTable)
    .values({
      id: simulationId,
      failureIds,
      removed,
      resilienceBefore: BASE_RESILIENCE,
      resilienceAfter,
      affectedCapabilitiesJson: JSON.stringify(affectedCapabilities),
      vulnerabilitiesJson: JSON.stringify(vulnerabilities),
      supplierRedundancy: 5,
      capabilityRedundancy: 1,
      createdAt: now,
    })
    .run();

  return { status: 200, body: result };
};

/**
 * GET /api/simulation/failure-toggles
 *
 * Returns the available chaos-scenario toggles from the database.
 */
const failureToggles: Handler = async (): Promise<ApiResponse> => {
  const rows = db.select().from(failureTogglesTable).all();
  return {
    status: 200,
    body: rows.map((r) => ({
      id: r.id,
      label: r.label,
      detail: r.detail,
      resilienceHit: r.resilienceHit,
      removes: r.removes,
    })),
  };
};

/**
 * GET /api/simulation/history
 *
 * Returns previously-run simulations (newest first).
 */
const history: Handler = async (): Promise<ApiResponse> => {
  const rows = db.select().from(simulationsTable).all().reverse();
  return {
    status: 200,
    body: rows.map((r) => ({
      simulationId: r.id,
      failureIds: r.failureIds,
      removed: r.removed,
      resilienceBefore: r.resilienceBefore,
      resilienceAfter: r.resilienceAfter,
      affectedCapabilities: JSON.parse(r.affectedCapabilitiesJson),
      vulnerabilities: JSON.parse(r.vulnerabilitiesJson),
      supplierRedundancy: r.supplierRedundancy,
      capabilityRedundancy: r.capabilityRedundancy,
    })),
  };
};

export const simulation = { run, failureToggles, history };
