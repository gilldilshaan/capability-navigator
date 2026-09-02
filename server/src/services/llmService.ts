import { config } from "../config";
import { db } from "../db/client";
import { llmAnalyses, disruptions } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

/**
 * PARALLAX — LLM service abstraction.
 *
 * The LLM is used ONLY for reasoning/analysis over deterministic data that the
 * graph engine / recovery solver has already computed. It never replaces the
 * database or the graph engine.
 *
 * Design goals:
 *  - API key lives ONLY on the backend (never bundled into frontend code).
 *  - If no provider/key is configured, the app degrades gracefully and clearly
 *    reports that the LLM service is unavailable (it does NOT fake a response).
 *  - Structured context in → structured result out.
 */

export interface LlmContext {
  disruption: {
    id: string;
    title: string;
    severity: string;
    component?: string;
    supplier?: string;
    impact?: string;
  };
  affectedCapabilities: Array<{
    id: string;
    name: string;
    status: string;
    redundancy: number;
    targetRedundancy: number;
  }>;
  affectedResources: Array<{
    id: string;
    kind: string;
    name: string;
    status: string;
    note?: string;
  }>;
  hiddenDependencies: Array<{
    id: string;
    name: string;
    impact: string;
    alternatives: string;
    redundancy: number;
    target: number;
    mitigation: string;
  }>;
  alternativeResources: Array<{
    id: string;
    name: string;
    leadTimeDays: number;
    qualified: boolean;
  }>;
  recoveryOptions: Array<{
    id: string;
    title: string;
    strategy: string;
    recoveryDays: number;
    costLakh: number;
    risk: string;
    capacityCoveragePct: number;
  }>;
  resilienceScore?: number;
  simulationResults?: {
    before: number;
    after: number;
    removed: string[];
  };
}

export interface LlmAnalysisResult {
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

const resultSchema = z.object({
  summary: z.string(),
  explanation: z.string(),
  recoveryStrategies: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      reasoning: z.string(),
      risk: z.string(),
      tradeoff: z.string(),
      timelineDays: z.number(),
    }),
  ),
  recommendedAction: z.string(),
  risks: z.array(z.string()),
});

/**
 * True only when the operator explicitly wants to call an LLM. Absent a key we
 * degrade to the deterministic pipeline rather than erroring or faking output.
 */
export function isLlmConfigured(): boolean {
  return Boolean(config.llm.enabled && config.llm.apiKey);
}

/**
 * Builds a provider-agnostic Chat Completions request envelope for whichever
 * backend the operator has selected (OpenAI- or Anthropic-compatible).
 */
function buildPrompt(context: LlmContext): string {
  return [
    "You are a supply-chain resilience analyst for the PARALLAX command center.",
    "Given the deterministic analysis below, produce a concise recommendation.",
    "Do NOT invent numbers that are not present. Reason only from the provided context.",
    "",
    "--- ACTIVE DISRUPTION ---",
    JSON.stringify(context.disruption),
    "",
    "--- AFFECTED CAPABILITIES ---",
    JSON.stringify(context.affectedCapabilities),
    "",
    "--- AFFECTED RESOURCES ---",
    JSON.stringify(context.affectedResources),
    "",
    "--- HIDDEN DEPENDENCIES ---",
    JSON.stringify(context.hiddenDependencies),
    "",
    "--- ALTERNATIVE RESOURCES ---",
    JSON.stringify(context.alternativeResources),
    "",
    "--- RECOVERY OPTIONS ---",
    JSON.stringify(context.recoveryOptions),
    "",
    (context.simulationResults
      ? `--- SIMULATION RESULTS ---\n${JSON.stringify(context.simulationResults)}`
      : ""),
    "",
    "Respond ONLY in the following JSON shape:",
    JSON.stringify(
      {
        summary: "2-3 sentence overview",
        explanation: "Why the disruption propagates and what constrains recovery",
        recoveryStrategies: [
          {
            id: "derive from recovery option id when possible",
            title: "Short title",
            reasoning: "Why this works given the data above",
            risk: "Low/Medium/High + one line",
            tradeoff: "One line about what is given up",
            timelineDays: 0,
          },
        ],
        recommendedAction: "Single next best move",
        risks: ["One or two concrete risks"],
      },
      null,
      2,
    ),
  ].join("\n\n");
}

async function callProvider(context: LlmContext): Promise<LlmAnalysisResult> {
  const { apiKey, model, timeoutMs } = config.llm;
  if (!apiKey) {
    throw new LlmNotConfiguredError();
  }

  const prompt = buildPrompt(context);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Groq — OpenAI-compatible chat completions endpoint. Matches the project's
    // existing provider (see src/lib/parallax/workflow/llm/recommendation.server.ts).
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "Return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LLM provider error (${res.status}): ${text.slice(0, 500)}`);
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = data.choices?.[0]?.message?.content ?? "";

    if (!raw.trim()) {
      throw new Error("LLM returned an empty response.");
    }

    // Extract the JSON object (strip any surrounding markdown fences).
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("LLM response did not contain valid JSON.");
    }

    const parsed = resultSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!parsed.success) {
      throw new Error(`LLM response failed validation: ${parsed.error.message}`);
    }
    return parsed.data;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs an LLM analysis for the current disruption context, optionally caching
 * the result in the database (keyed by disruptionId + analysis type) so repeat
 * calls don't re-invoke the provider.
 */
export async function generateAnalysis(
  context: LlmContext,
  options: { useCache?: boolean; type?: string } = {},
): Promise<LlmAnalysisResult> {
  const type = options.type ?? "GENERAL";
  const useCache = options.useCache ?? true;

  if (!isLlmConfigured()) {
    throw new LlmNotConfiguredError();
  }

  if (useCache) {
    const existing = db
      .select()
      .from(llmAnalyses)
      .where(and(eq(llmAnalyses.disruptionId, context.disruption.id), eq(llmAnalyses.analysisType, type)))
      .get();
    if (existing) {
      return resultSchema.parse(JSON.parse(existing.outputJson));
    }
  }

  const startedAt = Date.now();
  const result = await callProvider(context);

  if (useCache) {
    db.insert(llmAnalyses)
      .values({
        id: `${type}-${context.disruption.id}-${Date.now()}`,
        disruptionId: context.disruption.id,
        analysisType: type,
        inputJson: JSON.stringify(context),
        outputJson: JSON.stringify(result),
        model: config.llm.model,
        durationMs: Date.now() - startedAt,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing()
      .run();
  }

  return result;
}

export class LlmNotConfiguredError extends Error {
  readonly status = 503;
  readonly code = "LLM_NOT_CONFIGURED";
  constructor() {
    super(
      "The Groq LLM service is not configured. Set GROQ_API_KEY (and optionally PARALLAX_LLM_MODEL) in the server environment.",
    );
  }
}

/**
 * Reads the disruption from the DB and builds an LlmContext from deterministic
 * data. This keeps the LLM call decoupled from the query layer.
 */
export function buildLlmContext(disruptionId: string): LlmContext {
  const disruption = db
    .select()
    .from(disruptions)
    .where(eq(disruptions.id, disruptionId))
    .get();
  if (!disruption) {
    throw new Error(`Unknown disruption ${disruptionId}`);
  }
  return {
    disruption: {
      id: disruption.id,
      title: disruption.title,
      severity: disruption.severity,
      component: disruption.component ?? undefined,
      supplier: disruption.supplier ?? undefined,
      impact: disruption.impact ?? undefined,
    },
    affectedCapabilities: [],
    affectedResources: [],
    hiddenDependencies: [],
    alternativeResources: [],
    recoveryOptions: [],
  };
}

// Keep 'disruptions' import / db usage intentionally simple for tree-shaking —
// fully populated contexts are composed by the callers in the API layer.
