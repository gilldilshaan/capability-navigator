import path from "node:path";
import { pathToFileURL } from "node:url";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { config, serverRoot } from "../config";
import { db } from "./client";

export function runMigrations(): void {
  migrate(db, { migrationsFolder: path.resolve(serverRoot, "drizzle") });
}

const isMain = (): boolean =>
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain()) {
  runMigrations();
  console.log(
    `[parallax] migrations applied — database: ${config.dbPath}`,
  );
}