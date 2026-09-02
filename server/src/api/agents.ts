import { eq } from "drizzle-orm";
import { z } from "zod";

import type { AgentStep, AgentWorkflow } from "@/types/parallax";

import { db } from "../db/client";
import { disruptions, workflows as workflowsTable } from "../db/schema";
import { agentDefs, recoveryPaths } from "../../../src/lib/parallax/data";
import type { ApiResponse, Handler } from "./router";
import { HttpError } from "./router";

/**
 * POST /api/agents/workflows
 *
 * Starts an agent workflow for the given disruption.  The workflow is
 * computed deterministically (same as the mock), persisted to the DB,
 * and returned immediately.
 */
const startSchema = z.object({
  disruptionId: z.string().min(1, "disruptionId is required"),
});

const startWorkflow: Handler = async ({ body }): Promise<ApiResponse> => {
  const parsed = startSchema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new HttpError(400, "VALIDATION_ERROR", `Invalid payload — ${detail}`);
  }

  const { disruptionId } = parsed.data;

  const disruption = db
    .select()
    .from(disruptions)
    .where(eq(disruptions.id, disruptionId))
    .get();
  if (!disruption) {
    throw new HttpError(
      404,
      "DISRUPTION_NOT_FOUND",
      `No disruption with id '${disruptionId}'.`,
    );
  }

  const steps: AgentStep[] = agentDefs.map((def) => ({
    id: def.id,
    code: def.code,
    name: def.name,
    status: "COMPLETE" as const,
    message: def.doneMessage,
  }));

  const recommended = recoveryPaths.find((p) => p.id === "C");
  const workflowId = `WF-${disruptionId}`;

  const workflow: AgentWorkflow = {
    workflowId,
    disruptionId,
    status: "COMPLETE",
    progress: 100,
    steps,
    ...(recommended
      ? {
          recommendation: {
            pathId: recommended.id,
            summary: recommended.rationale,
            score: 94,
          },
        }
      : {}),
    compliance: {
      status: "PATH C COMPLIANT",
      requiresHumanVerification: true,
      note: "Human verification required for GDP cold-chain sign-off.",
    },
    requiresHumanApproval: true,
    summary: "3 viable configurations generated. Path C scored highest — 94/100.",
  };

  const now = new Date().toISOString();
  db.insert(workflowsTable)
    .values({
      id: workflowId,
      disruptionId,
      status: "COMPLETE",
      progress: 100,
      resultJson: JSON.stringify(workflow),
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: workflowsTable.id,
      set: {
        resultJson: JSON.stringify(workflow),
        updatedAt: now,
      },
    })
    .run();

  return { status: 201, body: workflow };
};

/**
 * GET /api/agents/workflows/:id
 *
 * Returns a persisted workflow by id.
 */
const byId: Handler = async ({ params }): Promise<ApiResponse> => {
  const id = params["id"] ?? "";
  const row = db
    .select()
    .from(workflowsTable)
    .where(eq(workflowsTable.id, id))
    .get();
  if (!row) {
    throw new HttpError(404, "WORKFLOW_NOT_FOUND", `No workflow with id '${id}'.`);
  }

  const workflow = JSON.parse(row.resultJson) as AgentWorkflow;
  return { status: 200, body: workflow };
};

/**
 * GET /api/agents
 *
 * Returns available agents and their definitions.
 */
const list: Handler = async (): Promise<ApiResponse> => {
  return {
    status: 200,
    body: agentDefs,
  };
};

/**
 * GET /api/agents/workflows
 *
 * Returns all persisted workflows (newest first).
 */
const listWorkflows: Handler = async (): Promise<ApiResponse> => {
  const rows = db.select().from(workflowsTable).all().reverse();
  return {
    status: 200,
    body: rows.map((r) => {
      const w = JSON.parse(r.resultJson) as AgentWorkflow;
      return w;
    }),
  };
};

export const agents = { startWorkflow, byId, list, listWorkflows };
