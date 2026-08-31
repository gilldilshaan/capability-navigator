import { activeDisruption } from "../data";
import { runParallaxWorkflow } from "./orchestrator";
import {
  disruptionSchema,
  type WorkflowDisruption,
  type WorkflowResult,
} from "./schema";

export type AgentWorkflowStatus =
  | "AWAITING_HUMAN"
  | "COMPLETED"
  | "RUNNING"
  | "FAILED";

export interface AgentWorkflow {
  id: string;
  disruptionId: string;
  status: AgentWorkflowStatus;
  result: WorkflowResult;
  disruption: WorkflowResult["disruption"];
  affectedCapabilities: WorkflowResult["affectedCapabilities"];
  availableResources: WorkflowResult["availableResources"];
  recoveryPaths: WorkflowResult["recoveryPaths"];
  comparison: WorkflowResult["comparison"];
  complianceFindings: WorkflowResult["complianceFindings"];
  recommendedPath: WorkflowResult["recommendedPath"];
  recommendedPathId: WorkflowResult["recommendedPathId"];
  narrative: WorkflowResult["narrative"];
  trace: WorkflowResult["trace"];
  createdAt: string;
  updatedAt: string;
}

// In-memory server-side workflow store (no database added)
const workflowStore = new Map<string, AgentWorkflow>();

export function mapWorkflowResultToAgentWorkflow(
  workflowId: string,
  disruptionId: string,
  result: WorkflowResult,
  createdAt?: string,
): AgentWorkflow {
  const now = new Date().toISOString();
  const humanStage = result.trace.find((t) => t.stage === "HUMAN_APPROVAL");
  const status: AgentWorkflowStatus =
    humanStage?.status === "AWAITING_HUMAN" ? "AWAITING_HUMAN" : "COMPLETED";

  const recommendedPath = result.recommendedPathId
    ? result.recoveryPaths.find((p) => p.id === result.recommendedPathId) ?? null
    : null;

  return {
    id: workflowId,
    disruptionId,
    status,
    result,
    disruption: result.disruption,
    affectedCapabilities: result.affectedCapabilities,
    availableResources: result.availableResources,
    recoveryPaths: result.recoveryPaths,
    comparison: result.comparison,
    complianceFindings: result.complianceFindings,
    recommendedPath,
    recommendedPathId: result.recommendedPathId,
    narrative: result.narrative,
    trace: result.trace,
    createdAt: createdAt ?? now,
    updatedAt: now,
  };
}

export async function createWorkflowFromDisruption(
  disruptionInput?: Partial<WorkflowDisruption> & { disruptionId?: string },
): Promise<AgentWorkflow> {
  const disruptionId =
    disruptionInput?.disruptionId ?? disruptionInput?.id ?? activeDisruption.id;

  let disruptionToRun: WorkflowDisruption;
  if (disruptionInput && Object.keys(disruptionInput).length > 1) {
    const merged = { ...activeDisruption, ...disruptionInput, id: disruptionId };
    disruptionToRun = disruptionSchema.parse(merged);
  } else {
    disruptionToRun = disruptionSchema.parse({ ...activeDisruption, id: disruptionId });
  }

  const result = await runParallaxWorkflow(disruptionToRun);
  const workflowId = `wf-${disruptionId}`;
  const workflow = mapWorkflowResultToAgentWorkflow(
    workflowId,
    disruptionId,
    result,
  );

  workflowStore.set(workflow.id, workflow);
  workflowStore.set(disruptionId, workflow);

  return workflow;
}

export async function getWorkflowById(
  id: string,
): Promise<AgentWorkflow | null> {
  if (workflowStore.has(id)) {
    return workflowStore.get(id)!;
  }

  // Fallback: If id matches activeDisruption.id or a known pattern, run on-demand
  if (id === activeDisruption.id || id === `wf-${activeDisruption.id}`) {
    return createWorkflowFromDisruption({ disruptionId: activeDisruption.id });
  }

  return null;
}

export async function handleWorkflowApiRequest(
  request: Request,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");

  // Handle CORS Preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const jsonHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // POST /api/agents/workflows
    if (request.method === "POST" && path === "/api/agents/workflows") {
      let body: Record<string, unknown> = {};
      try {
        const text = await request.text();
        if (text) {
          body = JSON.parse(text) as Record<string, unknown>;
        }
      } catch {
        // Body reading error fallback
      }

      const disruptionId =
        typeof body["disruptionId"] === "string"
          ? body["disruptionId"]
          : undefined;

      const workflow = await createWorkflowFromDisruption(
        disruptionId ? { disruptionId } : undefined,
      );
      return new Response(JSON.stringify(workflow), {
        status: 201,
        headers: jsonHeaders,
      });
    }

    // GET /api/agents/workflows/:id
    if (request.method === "GET" && path.startsWith("/api/agents/workflows/")) {
      const id = path.replace("/api/agents/workflows/", "");
      if (!id) {
        return new Response(
          JSON.stringify({ error: "Workflow ID is required" }),
          { status: 400, headers: jsonHeaders },
        );
      }

      const workflow = await getWorkflowById(id);
      if (!workflow) {
        return new Response(
          JSON.stringify({ error: `Workflow with id '${id}' not found` }),
          { status: 404, headers: jsonHeaders },
        );
      }

      return new Response(JSON.stringify(workflow), {
        status: 200,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ error: "Method or route not allowed" }), {
      status: 405,
      headers: jsonHeaders,
    });
  } catch (error) {
    console.error("Error in workflow API adapter:", error);
    return new Response(
      JSON.stringify({
        error: "Internal workflow error",
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: jsonHeaders },
    );
  }
}
