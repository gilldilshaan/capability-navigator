import { createServer, type ServerResponse } from "node:http";

import { config } from "./config";
import { db } from "./db/client";
import { runMigrations } from "./db/migrate";
import { seedDatabase } from "./db/seed";
import { HttpError, match, type RouteDef } from "./api/router";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, JSON_HEADERS);
  res.end(JSON.stringify(body));
}

function sendText(res: ServerResponse, status: number, text: string): void {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(text);
}

function setCors(res: ServerResponse): void {
  res.setHeader("access-control-allow-origin", config.corsOrigin);
  res.setHeader("vary", "Origin");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
}

function readBody(req: import("node:http").IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw.trim()) {
        resolve(undefined);
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new HttpError(400, "INVALID_JSON", "Request body must be valid JSON."));
      }
    });
    req.on("error", reject);
  });
}

function handleError(
  res: ServerResponse,
  error: unknown,
  { viaRoute }: { viaRoute: RouteDef | null },
): void {
  if (error instanceof HttpError) {
    console.error(
      `[parallax] ${error.status} ${error.code} — ${error.message}` +
        (viaRoute ? ` (${viaRoute.method} /${viaRoute.segments.join("/")})` : ""),
    );
    sendJson(res, error.status, {
      error: error.code,
      message: error.message,
    });
    return;
  }
  console.error("[parallax] unhandled error", error);
  sendJson(res, 500, { error: "INTERNAL_ERROR", message: "An unexpected error occurred." });
}

async function handleIncoming(
  method: string,
  pathname: string,
  rawBody: unknown,
  res: ServerResponse,
): Promise<void> {
  const matched = match(method, pathname);
  if (!matched) {
    sendJson(res, 404, { error: "NOT_FOUND", message: `No route for ${method} ${pathname}` });
    return;
  }

  const { status, body } = await matched.handler({
    params: matched.params,
    body: rawBody,
  });
  sendJson(res, status, body);
}

export function createApiServer() {
  return createServer(async (req, res) => {
    setCors(res);
    const method = (req.method ?? "GET").toUpperCase();
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

    if (method === "OPTIONS") {
      res.writeHead(204, { "access-control-allow-origin": config.corsOrigin });
      res.end();
      return;
    }

    try {
      const body = await readBody(req);
      await handleIncoming(method, url.pathname, body, res);
    } catch (error) {
      handleError(res, error, { viaRoute: null });
    }
  });
}

async function main(): Promise<void> {
  runMigrations();
  seedDatabase();

  const server = createApiServer();
  server.listen(config.port, () => {
    console.log(`[parallax] API listening on http://localhost:${config.port}`);
    console.log(`[parallax] CORS origin: ${config.corsOrigin}`);
  });
}

const isMain = (): boolean =>
  Boolean(process.argv[1]) &&
  import.meta.url ===
    new URL("file:" + process.argv[1].replace(/\\/g, "/")).href;

if (isMain()) {
  // Warm the single connection early so the first request is fast.
  void db.get(`SELECT 1`);
  main().catch((error) => {
    console.error("[parallax] failed to start", error);
    process.exit(1);
  });
}