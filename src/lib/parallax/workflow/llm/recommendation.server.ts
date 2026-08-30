import type { RecommendationNarrative } from "../schema";
import { llmInputSnapshotSchema, llmOutputSchema, type LlmInputSnapshot } from "./schema";

export type NarrativeValidation = "VALID" | "UNAVAILABLE" | "REJECTED" | "FAILED";

export interface NarrativeGenerationResult {
  narrative: RecommendationNarrative;
  model: string | null;
  durationMs: number;
  validation: NarrativeValidation;
  summary: string;
}

const outputJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["pathId", "recommendation", "rationale", "tradeoffs", "humanApprovalNote"],
  properties: {
    pathId: { type: "string", enum: ["A", "B", "C"] },
    recommendation: { type: "string" },
    rationale: { type: "array", items: { type: "string" } },
    tradeoffs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["pathId", "summary"],
        properties: {
          pathId: { type: "string", enum: ["A", "B", "C"] },
          summary: { type: "string" },
        },
      },
    },
    humanApprovalNote: { type: "string" },
  },
} as const;

function unavailableNarrative(): RecommendationNarrative {
  return {
    status: "UNAVAILABLE",
    pathId: null,
    recommendation:
      "Narrative unavailable. Review the deterministic comparison and compliance findings.",
    rationale: [],
    tradeoffs: [],
    humanApprovalNote: "Human approval remains required before any recovery action.",
    model: null,
  };
}

function getConfiguration() {
  const enabled = process.env["PARALLAX_LLM_ENABLED"] === "true";
  const apiKey = process.env["OPENAI_API_KEY"];
  const model = process.env["PARALLAX_LLM_MODEL"] ?? "gpt-4.1-mini";
  const timeoutMs = Number(process.env["PARALLAX_LLM_TIMEOUT_MS"] ?? 8000);
  return {
    enabled,
    apiKey,
    model,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 8000,
  };
}

function instructions() {
  return [
    "You explain PARALLAX deterministic workflow results for a human approver.",
    "Use only facts in the supplied JSON snapshot.",
    "Do not create or change recovery paths, recommendations, resources, scores, compliance findings, times, costs, or any other facts.",
    "Return only the requested JSON schema.",
  ].join(" ");
}

export async function generateRecommendationNarrative(
  input: LlmInputSnapshot,
): Promise<NarrativeGenerationResult> {
  const snapshot = llmInputSnapshotSchema.parse(input);
  const config = getConfiguration();
  if (!config.enabled || !config.apiKey || !snapshot.deterministicRecommendedPathId) {
    return {
      narrative: unavailableNarrative(),
      model: null,
      durationMs: 0,
      validation: "UNAVAILABLE",
      summary: "LLM narrative unavailable; deterministic recommendation retained.",
    };
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        store: false,
        instructions: instructions(),
        input: JSON.stringify(snapshot),
        text: {
          format: {
            type: "json_schema",
            name: "parallax_recommendation",
            strict: true,
            schema: outputJsonSchema,
          },
        },
      }),
    });
    if (!response.ok) throw new Error(`OpenAI request failed with status ${response.status}.`);
    const body: unknown = await response.json();
    const outputText =
      body &&
      typeof body === "object" &&
      "output_text" in body &&
      typeof body.output_text === "string"
        ? body.output_text
        : null;
    if (!outputText) throw new Error("OpenAI response did not contain structured output text.");
    const parsed = llmOutputSchema.parse(JSON.parse(outputText));
    if (parsed.pathId !== snapshot.deterministicRecommendedPathId) {
      return {
        narrative: unavailableNarrative(),
        model: config.model,
        durationMs: Date.now() - startedAt,
        validation: "REJECTED",
        summary: "LLM narrative rejected because it changed the deterministic recommendation.",
      };
    }
    return {
      narrative: { status: "AVAILABLE", ...parsed, model: config.model },
      model: config.model,
      durationMs: Date.now() - startedAt,
      validation: "VALID",
      summary: "LLM recommendation narrative validated against deterministic output.",
    };
  } catch {
    return {
      narrative: unavailableNarrative(),
      model: config.model,
      durationMs: Date.now() - startedAt,
      validation: "FAILED",
      summary: "LLM narrative unavailable; deterministic recommendation retained.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
