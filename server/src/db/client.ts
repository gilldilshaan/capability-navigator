import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { config } from "../config";
import * as schema from "./schema";

/**
 * Resolve the SQLite file to an actually-writable location.
 *
 * Local dev and Railway persist under the configured path. On read-only
 * serverless hosts (e.g. Vercel) that directory cannot be created, so we fall
 * back to the per-host temp dir. The data is regenerable demo seed data, so a
 * runtime-temporary location is appropriate there and never touches the
 * read-only filesystem.
 */
function resolveWritableDbPath(configured: string): string {
  try {
    mkdirSync(path.dirname(configured), { recursive: true });
    return configured;
  } catch {
    const tmpDir = path.join(os.tmpdir(), "parallax");
    mkdirSync(tmpDir, { recursive: true });
    return path.join(tmpDir, path.basename(configured));
  }
}

export const dbPath = resolveWritableDbPath(config.dbPath);

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const client = sqlite;
export const db = drizzle(sqlite, { schema });
export type DB = typeof db;