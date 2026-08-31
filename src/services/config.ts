/**
 * PARALLAX — API configuration.
 *
 * Every backend URL is configurable through VITE_* environment variables so the
 * four backend modules can be pointed at without touching frontend code.
 * See .env.example and FRONTEND_INTEGRATION_PLAN.md §6.
 *
 * Runtime modes:
 *  - no VITE_API_BASE_URL        → demo mode: mock responses only (today's behaviour)
 *  - VITE_API_MOCK_MODE=true     → force mock responses even when a base URL is set
 *  - VITE_API_FALLBACK_TO_MOCK   → on backend failure, serve mock data instead of erroring
 *                                  (default true; set "false" to surface errors instead)
 */

const env =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : (process.env as unknown as Record<string, string>) || {};

const bool = (value: unknown, fallback: boolean): boolean => {
  if (typeof value !== "string" || value === "") return fallback;
  return value.toLowerCase() === "true";
};

const trimmed = (value: unknown): string | undefined => {
  const v = typeof value === "string" ? value.trim() : "";
  return v ? v.replace(/\/+$/, "") : undefined;
};

const BASE_URL = trimmed(env["VITE_API_BASE_URL"]);
const MOCK_MODE = bool(env["VITE_API_MOCK_MODE"], false);
const FALLBACK_TO_MOCK = bool(env["VITE_API_FALLBACK_TO_MOCK"], true);
const TIMEOUT_MS = Number(env["VITE_API_TIMEOUT_MS"] ?? 15000) || 15000;

export interface ServiceConfig {
  baseUrl: string;
  path: string;
}

const serviceUrl = ({ baseUrl, path }: ServiceConfig): string => {
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};

const urlFor =
  (overrideKey: string, defaultPath: string) =>
  (override?: string): string =>
    serviceUrl({
      baseUrl: BASE_URL ?? "",
      path: override ?? trimmed(env[overrideKey]) ?? defaultPath,
    });

export const apiConfig = {
  /** Backend root, e.g. http://localhost:8000. Undefined = demo/mock mode. */
  baseUrl: BASE_URL,
  /** Force mock responses regardless of base URL. */
  mockMode: MOCK_MODE,
  /** Serve mock data when the backend is unreachable. */
  fallbackToMock: FALLBACK_TO_MOCK,
  /** Per-request timeout. */
  timeoutMs: TIMEOUT_MS,
  /** True when the app is intentionally running without a backend. */
  get demoMode(): boolean {
    return !BASE_URL || MOCK_MODE;
  },
  urls: {
    disruptions: urlFor("VITE_API_DISRUPTIONS_URL", "/api/disruptions"),
    graph: urlFor("VITE_API_GRAPH_URL", "/api/graph"),
    recovery: urlFor("VITE_API_RECOVERY_URL", "/api/recovery"),
    simulation: urlFor("VITE_API_SIMULATION_URL", "/api/simulation"),
    agents: urlFor("VITE_API_AGENTS_URL", "/api/agents"),
  },
} as const;
