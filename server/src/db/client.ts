import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { config } from "../config";
import * as schema from "./schema";

mkdirSync(path.dirname(config.dbPath), { recursive: true });

const sqlite = new Database(config.dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const client = sqlite;
export const db = drizzle(sqlite, { schema });
export type DB = typeof db;