import {
  createWorkflowFromDisruption,
  getWorkflowById,
} from "@/lib/parallax/workflow/adapter";
import type { ApiResponse, Handler } from "./router";
import { HttpError } from "./router";

/**
 * POST /api/agents/workflows
 */
const create: Handler = async ({ body }): Promise<ApiResponse> => {
  const reqBody = (body as Record<string, unknown>) ?? {};
  const disruptionId =
    typeof reqBody["disruptionId"] === "string" ? reqBody["disruptionId"] : undefined;

  const workflow = await createWorkflowFromDisruption(
    disruptionId ? { disruptionId } : undefined,
  );

  return { status: 201, body: workflow };
};

/**
 * GET /api/agents/workflows/:id
 */
const byId: Handler = async ({ params }): Promise<ApiResponse> => {
  const id = params["id"] ?? "";
  if (!id) {
    throw new HttpError(400, "BAD_REQUEST", "Workflow ID is required.");
  }

  const workflow = await getWorkflowById(id);
  if (!workflow) {
    throw new HttpError(404, "WORKFLOW_NOT_FOUND", `Workflow '${id}' not found.`);
  }

  return { status: 200, body: workflow };
};

export const agents = { create, byId };
