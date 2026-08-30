/**
 * PARALLAX — core API client + mock-fallback plumbing.
 *
 * `request<T>` performs a single JSON fetch against the configured backend with
 * an abort timeout. `withFallback` is the integration seam used by every
 * service function:
 *
 *   withFallback({ label, live, mock }) → { data, source: "live" | "mock" }
 *
 * - Demo mode (no VITE_API_BASE_URL or VITE_API_MOCK_MODE=true): mock only.
 * - Backend failure + fallback enabled: mock response, reason recorded for the
 *   SystemStatusBanner (no crash, UI keeps working).
 * - Backend failure + fallback disabled: the error propagates to the store,
 *   which shows a clean error state.
 */

import { apiConfig } from "./config";

export type ApiSource = "live" | "mock";

export interface ApiEnvelope<T> {
  data: T;
  source: ApiSource;
}

export class ApiError extends Error {
  readonly status?: number;
  readonly endpoint: string;

  constructor(message: string, endpoint: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.endpoint = endpoint;
    if (status !== undefined) this.status = status;
  }
}

export class ApiUnavailableError extends ApiError {
  constructor(endpoint: string, cause?: unknown) {
    super(
      `Backend unavailable at ${endpoint}${cause instanceof Error ? ` (${cause.message})` : ""}`,
      endpoint,
    );
    this.name = "ApiUnavailableError";
  }
}

/** Most recent reason a live call degraded to mock — consumed by the status banner. */
let lastFallbackReason: string | null = null;

export const getLastFallbackReason = (): string | null => lastFallbackReason;
export const clearLastFallbackReason = (): void => {
  lastFallbackReason = null;
};

export async function request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), apiConfig.timeoutMs);
  try {
    const response = await fetch(endpoint, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      let detail = "";
      try {
        detail = await response.text();
      } catch {
        /* ignore body read failures */
      }
      throw new ApiError(
        `Request to ${endpoint} failed: ${response.status}${detail ? ` — ${detail.slice(0, 200)}` : ""}`,
        endpoint,
        response.status,
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // Network failure / abort / CORS — the backend is not reachable.
    throw new ApiUnavailableError(endpoint, error);
  } finally {
    clearTimeout(timer);
  }
}

export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  return request<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
}

export async function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "GET" });
}

export interface FallbackOptions<T> {
  /** Human-readable label used in logs and the fallback banner. */
  label: string;
  /** Live backend call. Omitted in demo mode. */
  live: () => Promise<T>;
  /** Deterministic mock response built from src/lib/parallax/data.ts. */
  mock: () => T | Promise<T>;
}

/**
 * Run a service call with the documented mock fallback. Never throws when the
 * fallback is enabled — failures degrade to mock data and are reported through
 * `getLastFallbackReason()` so the UI can show a non-blocking banner.
 */
export async function withFallback<T>(options: FallbackOptions<T>): Promise<ApiEnvelope<T>> {
  const { label, live, mock } = options;

  if (apiConfig.demoMode) {
    return { data: await mock(), source: "mock" };
  }

  try {
    const data = await live();
    lastFallbackReason = null;
    return { data, source: "live" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!apiConfig.fallbackToMock) {
      throw error;
    }
    lastFallbackReason = `${label}: ${message}`;
    if (import.meta.env.DEV) {
      console.warn(`[parallax/api] ${label} — backend unavailable, using mock data. ${message}`);
    }
    return { data: await mock(), source: "mock" };
  }
}
