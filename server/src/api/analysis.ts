import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../db/client";
import { capabilities, capabilityRequirements, disruptions, graphNodes, hiddenDependenciesTable, suppliers } from "../db/schema";
import { recoveryPaths } from "../../../src/lib/parallax/data";
import type { ApiResponse, Handler } from "./router";
import { HttpError } from "./router";
import {
  buildLlmContext,
  generateAnalysis,
  isLlmConfigured,
  LlmNotConfiguredError,
  type LlmContext,
} from "../services/llmService";

const analyzeSchema = z.object({
  disruptionId: z.string().min(1, "disruptionId is required"),
  useCache: z.boolean().optional(),
});

/**
 * POST /api/graph/analyze-with-llm
 *
 * Builds a fully-populated LlmContext from deterministic data and calls the
 * LLM to produce reasoning/recommendations.  If the LLM is not configured,
 * degrades gracefully (503 with a clear message) instead of faking output.
 */
const analyzeWithLlm: Handler = async ({ body }): Promise<ApiResponse> => {
  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new HttpError(400, "VALIDATION_ERROR", `Invalid payload — ${detail}`);
  }

  const { disruptionId, useCache = true } = parsed.data;

  if (!isLlmConfigured()) {
    throw new HttpError(503, "LLM_NOT_CONFIGURED", "The Groq LLM service is not configured. Set GROQ_API_KEY in the server environment.");
  }

  const context = buildFullContext(disruptionId);

  try {
    const analysis = await generateAnalysis(context, { useCache, type: "GRAPH" });
    return { status: 200, body: { ...analysis, disruptionId } };
  } catch (error) {
    if (error instanceof LlmNotConfiguredError) {
      throw new HttpError(503, "LLM_NOT_CONFIGURED", "The Groq LLM service is not configured. Set GROQ_API_KEY in the server environment.");
    }
    throw new HttpError(502, "LLM_ERROR", `LLM call failed: ${(error as Error).message}`);
  }
};

/**
 * Builds a fully-populated context for the LLM from DB + static recovery paths.
 */
function buildFullContext(disruptionId: string): LlmContext {
  const base = buildLlmContext(disruptionId);

  const allCaps = db.select().from(capabilities).all();
  const reqRows = db.select().from(capabilityRequirements).all();
  const reqMap = new Map<string, string[]>();
  for (const r of reqRows) {
    const list = reqMap.get(r.capabilityId) ?? [];
    list.push(r.requirementId);
    reqMap.set(r.capabilityId, list);
  }

  const capNodes = db.select().from(graphNodes).all().filter((n) => n.kind === "capability");

  base.affectedCapabilities = capNodes.map((n) => {
    const reg = allCaps.find((c) => c.id === n.id);
    return {
      id: n.id,
      name: n.label,
      status: n.status,
      redundancy: reg?.redundancy ?? 1,
      targetRedundancy: reg?.targetRedundancy ?? 3,
    };
  });

  const allSuppliers = db.select().from(suppliers).all();
  base.affectedResources = allSuppliers
    .filter((s) => s.status !== "AVAILABLE")
    .map((s) => ({
      id: s.id,
      kind: "supplier",
      name: s.name,
      status: s.status,
      note: s.constraints,
    }));

  const allHidden = db.select().from(hiddenDependenciesTable).all();
  base.hiddenDependencies = allHidden.map((h) => ({
    id: h.id,
    name: h.name,
    impact: h.impact,
    alternatives: h.alternatives,
    redundancy: h.redundancy,
    target: h.target,
    mitigation: h.mitigation,
  }));

  base.alternativeResources = allSuppliers
    .filter((s) => s.status === "AVAILABLE")
    .map((s) => ({
      id: s.id,
      name: s.name,
      leadTimeDays: s.leadTimeDays,
      qualified: s.tier === 1,
    }));

  base.recoveryOptions = recoveryPaths.map((p) => ({
    id: p.id,
    title: p.title,
    strategy: p.strategy,
    recoveryDays: p.recoveryDays,
    costLakh: p.costLakh,
    risk: p.risk,
    capacityCoveragePct: p.capacityCoveragePct,
  }));

  return base;
}

export const analysis = { analyzeWithLlm };
export type { LlmAnalysisResult } from "../services/llmService";
