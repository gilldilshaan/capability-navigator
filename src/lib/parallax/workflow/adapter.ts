import { activeDisruption, agentDefs } from "../data";
import type { AgentStep } from "@/types/parallax";
import { runParallaxWorkflow } from "./orchestrator";
import {
  disruptionSchema,
  type WorkflowDisruption,
  type WorkflowResult,
} from "./schema";

export type AgentWorkflowStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETE"
  | "COMPLETED"
  | "AWAITING_HUMAN"
  | "FAILED";

export interface AgentWorkflow {
  id: string;
  workflowId: string;
  disruptionId: string;
  status: AgentWorkflowStatus;
  progress: number;
  steps: AgentStep[];
  recommendation?: {
    pathId: string;
    summary: string;
    score?: number;
  } | undefined;
  compliance?: {
    status: string;
    requiresHumanVerification: boolean;
    note?: string;
  } | undefined;
  requiresHumanApproval: boolean;
  summary?: string | undefined;
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
  const status: AgentWorkflowStatus = "COMPLETE";

  const recommendedPath = result.recommendedPathId
    ? result.recoveryPaths.find((p) => p.id === result.recommendedPathId) ?? null
    : null;

  const steps: AgentStep[] = agentDefs.map((def) => {
    const stageMap: Record<string, string> = {
      "AGT-01": "DISRUPTION",
      "AGT-02": "CAPABILITY",
      "AGT-03": "RESOURCE_DISCOVERY",
      "AGT-04": "RECOVERY",
      "AGT-05": "SCENARIO_COMPARISON",
      "AGT-06": "COMPLIANCE",
    };
    const stageName = stageMap[def.id];
    const stageTrace = result.trace.find((t) => t.stage === stageName);
    return {
      id: def.id,
      code: def.code,
      name: def.name,
      status: "COMPLETE" as const,
      message: stageTrace?.summary ?? def.doneMessage,
    };
  });

  const recScore = result.comparison.find((c) => c.pathId === result.recommendedPathId)?.score;
  const recommendation = result.recommendedPathId
    ? {
        pathId: result.recommendedPathId,
        summary: result.narrative?.recommendation || recommendedPath?.rationale || "",
        ...(recScore !== undefined ? { score: recScore } : {}),
      }
    : undefined;

  const compFinding = result.complianceFindings.find((c) => c.pathId === result.recommendedPathId);
  const compliance = {
    status: compFinding ? `PATH ${result.recommendedPathId} ${compFinding.status}` : "PATH C COMPLIANT",
    requiresHumanVerification: true,
    note: compFinding?.findings?.[0] ?? "Human verification required for GDP cold-chain sign-off.",
  };

  const summary =
    result.narrative?.recommendation ||
    (recommendedPath
      ? `${result.recoveryPaths.length} viable configurations generated. Path ${result.recommendedPathId} scored highest.`
      : undefined);

  return {
    id: workflowId,
    workflowId,
    disruptionId,
    status,
    progress: 100,
    steps,
    recommendation,
    compliance,
    requiresHumanApproval: true,
    summary,
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
  workflowStore.set(workflow.workflowId, workflow);
  workflowStore.set(disruptionId, workflow);

  return workflow;
}

export async function getWorkflowById(
  id: string,
): Promise<AgentWorkflow | null> {
  if (workflowStore.has(id)) {
    return workflowStore.get(id)!;
  }

  const cleanId = id.replace(/^(wf-|WF-)/, "");
  return createWorkflowFromDisruption({ disruptionId: cleanId });
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
