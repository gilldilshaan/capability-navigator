import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * PARALLAX backend configuration (Bani).
 *
 * Reads environment variables at process start; safe defaults for local dev.
 *
 * Env vars:
 * - DATABASE_URL  – SQLite target, e.g. "file:./server/data/parallax.db" or an
 *                   absolute path. Defaults to the local dev file.
 * - PORT          – HTTP port (default 8000, matches VITE_API_BASE_URL in .env.example)
 * - CORS_ORIGIN   – Allowed CORS origin (default "*" for demo/tooling)
 * LLM (provider: Groq — matches the existing workflow LLM integration):
 * - GROQ_API_KEY            – Groq provider key (never bundled into frontend code).
 * - PARALLAX_LLM_MODEL      – Model, e.g. "llama-3.3-70b-versatile".
 * - PARALLAX_LLM_TIMEOUT_MS – Request timeout in ms (default 8000).
 * - PARALLAX_LLM_ENABLED    – "false" disables all LLM calls.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
export const serverRoot = path.resolve(here, "..");
export const repoRoot = path.resolve(here, "../..");

const DEFAULT_URL = "file:./server/data/parallax.db";

function resolveDatabaseUrl(raw: string | undefined): string {
  let value = (raw ?? "").trim();
  if (!value) value = DEFAULT_URL;
  if (value.startsWith("file:")) value = value.slice("file:".length);
  if (!path.isAbsolute(value)) value = path.resolve(repoRoot, value);
  return value;
}

function portValue(raw: string | undefined): number {
  const n = Number(raw ?? "8000");
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 8000;
}

function llmTimeoutMs(raw: string | undefined): number {
  const n = Number(raw ?? 8000);
  return Number.isFinite(n) && n > 0 ? n : 8000;
}

export const config = {
  port: portValue(process.env.PORT),
  corsOrigin: (process.env.CORS_ORIGIN ?? "*").trim() || "*",
  databaseUrl: process.env.DATABASE_URL,
  dbPath: resolveDatabaseUrl(process.env.DATABASE_URL),
  /** LLM provider (Groq). Entirely optional; missing key = graceful degrade. */
  llm: {
    enabled: process.env["PARALLAX_LLM_ENABLED"] !== "false",
    apiKey: (process.env["GROQ_API_KEY"] ?? "").trim() || undefined,
    model: (process.env["PARALLAX_LLM_MODEL"] ?? "llama-3.3-70b-versatile").trim(),
    timeoutMs: llmTimeoutMs(process.env["PARALLAX_LLM_TIMEOUT_MS"]),
  },
} as const;