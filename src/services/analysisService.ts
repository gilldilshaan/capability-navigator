/**
 * PARALLAX — LLM analysis service.
 *
 * The backend calls its configured LLM provider with deterministic graph /
 * recovery context and returns structured reasoning.  If the backend has no
 * LLM key configured it returns a clear 503 (displayed as an inline note in
 * the UI), it never fabricates "AI" output.
 */

import type { LlmAnalysisResponse } from "@/types/parallax";
import { post, withFallback, type ApiEnvelope } from "./api";
import { apiConfig } from "./config";

export interface AnalyzeWithLlmParams {
  disruptionId: string;
  useCache?: boolean;
}

/**
 * Requests LLM-driven analysis from the backend.
 *
 * `live` will surface a graceful 503 when the LLM is not configured.  There is
 * intentionally no `mock` — we must never pretend an LLM response exists.
 * This means the call falls back to an *error* envelope in demo mode rather
 * than inventing AI text, which is the desired "not configured" behaviour.
 */
export function analyzeWithLlm(
  params: AnalyzeWithLlmParams,
): Promise<ApiEnvelope<LlmAnalysisResponse>> {
  return withFallback<LlmAnalysisResponse>({
    label: `LLM analysis (${params.disruptionId})`,
    live: () =>
      post<LlmAnalysisResponse>(
        `${apiConfig.urls.graph()}/analyze-with-llm`,
        params,
      ),
    mock: () => {
      throw new Error(
        "LLM analysis requires a configured backend + LLM_API_KEY. Running in mock mode; no LLM is available.",
      );
    },
  });
}
