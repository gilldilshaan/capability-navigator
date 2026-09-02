import { agents } from "./agents";
import { analysis } from "./analysis";
import { approvals } from "./approvals";
import { disruptions } from "./disruptions";
import { graph } from "./graph";
import { health } from "./health";
import { master } from "./master";
import { recovery } from "./recovery";
import { simulation } from "./simulation";

/** API error carrying an HTTP status + machine-readable code. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

export interface HandlerContext {
  params: Record<string, string>;
  body: unknown;
}

export type Handler = (ctx: HandlerContext) => Promise<ApiResponse>;

export interface RouteDef {
  method: "GET" | "POST";
  segments: Array<string | ":param">;
  handler: Handler;
}

/**
 * Static route registry. Segment values beginning with ":" are captured into
 * `params` (e.g. "/api/disruptions/:id" → params.id).
 */
export const routes: RouteDef[] = [
  { method: "GET", segments: ["api", "health"], handler: health },

  { method: "GET", segments: ["api", "suppliers"], handler: master.suppliers },
  { method: "GET", segments: ["api", "factories"], handler: master.factories },
  { method: "GET", segments: ["api", "machines"], handler: master.machines },
  { method: "GET", segments: ["api", "inventory"], handler: master.inventory },
  { method: "GET", segments: ["api", "workforce"], handler: master.workforce },
  { method: "GET", segments: ["api", "logistics-routes"], handler: master.logisticsRoutes },
  { method: "GET", segments: ["api", "capabilities"], handler: master.capabilities },

  { method: "POST", segments: ["api", "disruptions", "inject"], handler: disruptions.inject },
  { method: "GET", segments: ["api", "disruptions", "active"], handler: disruptions.active },
  { method: "GET", segments: ["api", "disruptions", ":id"], handler: disruptions.byId },

  { method: "POST", segments: ["api", "recovery", "approvals"], handler: approvals.create },
  { method: "GET", segments: ["api", "recovery", "approvals", ":id"], handler: approvals.byId },

  { method: "POST", segments: ["api", "graph", "analyze"], handler: graph.analyze },
  { method: "POST", segments: ["api", "graph", "analyze-with-llm"], handler: analysis.analyzeWithLlm },
  { method: "GET", segments: ["api", "graph", "network"], handler: graph.network },
  { method: "GET", segments: ["api", "graph", "hidden-dependencies"], handler: graph.hiddenDeps },

  { method: "POST", segments: ["api", "recovery", "paths"], handler: recovery.paths },

  { method: "POST", segments: ["api", "simulation", "run"], handler: simulation.run },
  { method: "GET", segments: ["api", "simulation", "failure-toggles"], handler: simulation.failureToggles },
  { method: "GET", segments: ["api", "simulation", "history"], handler: simulation.history },

  { method: "GET", segments: ["api", "agents"], handler: agents.list },
  { method: "POST", segments: ["api", "agents", "workflows"], handler: agents.startWorkflow },
  { method: "GET", segments: ["api", "agents", "workflows"], handler: agents.listWorkflows },
  { method: "GET", segments: ["api", "agents", "workflows", ":id"], handler: agents.byId },
];

export interface MatchedRoute {
  handler: Handler;
  params: Record<string, string>;
}

export function match(method: string, pathname: string): MatchedRoute | null {
  const parts = pathname.split("/").filter(Boolean);

  for (const route of routes) {
    if (route.method !== method || route.segments.length !== parts.length) continue;

    const params: Record<string, string> = {};
    let matches = true;
    for (let i = 0; i < parts.length; i += 1) {
      const segment = route.segments[i] as string;
      const part = parts[i] as string;
      if (segment.startsWith(":")) {
        params[segment.slice(1)] = part;
      } else if (segment !== part) {
        matches = false;
        break;
      }
    }
    if (matches) return { handler: route.handler, params };
  }

  return null;
}