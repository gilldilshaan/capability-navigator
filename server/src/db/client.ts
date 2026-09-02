import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { config } from "../config";
import * as schema from "./schema";

/**
 * Resolve the SQLite file to an actually-writable, absolute location.
 *
 * Local dev and Railway persist under the configured path (e.g.
 * `server/data/parallax.db`). On read-only serverless hosts such as Vercel the
 * configured path resolves to a location under the read-only filesystem
 * (e.g. `/var/server/data/parallax.db`) and cannot be created. We detect that
 * and fall back to the per-host temp dir first, then to an in-memory database
 * as a last resort — so importing this module never crashes a read-only host.
 * The data is regenerable demo seed data, so temporary storage is appropriate.
 */
function resolveWritableDbPath(configured: string): string | ":memory:" {
  try {
    const dir = path.dirname(configured);
    if (dir && dir !== ".") mkdirSync(dir, { recursive: true });
    return configured;
  } catch {
    try {
      const tmpDir = path.join(os.tmpdir(), "parallax");
      mkdirSync(tmpDir, { recursive: true });
      return path.join(tmpDir, path.basename(configured) || "parallax.db");
    } catch {
      return ":memory:";
    }
  }
}

export const dbPath = resolveWritableDbPath(config.dbPath);

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const client = sqlite;
export const db = drizzle(sqlite, { schema });
export type DB = typeof db;