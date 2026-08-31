import { sql } from "drizzle-orm";

import { db } from "../db/client";
import type { ApiResponse, Handler } from "./router";
import { HttpError } from "./router";

/**
 * GET /api/health
 * Simple liveness probe that confirms the SQLite connection is usable.
 */
export const health: Handler = async (): Promise<ApiResponse> => {
  try {
    db.get(sql`SELECT 1`);
  } catch (error) {
    console.error("[parallax] health check failed", error);
    throw new HttpError(500, "DATABASE_UNREACHABLE", "Database is not reachable.");
  }
  return { status: 200, body: { status: "ok", database: "connected" } };
};