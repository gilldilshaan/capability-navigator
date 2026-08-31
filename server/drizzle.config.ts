import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration for the PARALLAX backend (Bani).
 * Paths are resolved relative to the repo root (CWD when the npm scripts run).
 * `generate` writes SQL migrations into ./server/drizzle.
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./server/src/db/schema.ts",
  out: "./server/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./data/parallax.db",
  },
});