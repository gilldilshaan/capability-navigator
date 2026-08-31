import { eq } from "drizzle-orm";
import { z } from "zod";

import type { ApprovalDecision } from "@/types/parallax";

import { db } from "../db/client";
import { approvalRequests, disruptions } from "../db/schema";
import { toApprovalRequest } from "./mappers";
import type { ApiResponse, Handler } from "./router";
import { HttpError } from "./router";

const decisionSchema = z.object({
  requestId: z.string().optional(),
  disruptionId: z.string().min(1, "disruptionId is required"),
  workflowId: z.string().optional(),
  pathId: z.string().min(1, "pathId is required"),
  decision: z.enum(["APPROVED", "REJECTED", "ALTERNATIVE_REQUESTED"]),
  decidedBy: z.string().min(1, "decidedBy is required"),
  note: z.string().optional(),
});

/**
 * Maps an incoming ApprovalDecision to the row required by the
 * approval_requests table. The decision maps 1:1 onto the stored status.
 */
function toRow(decision: ApprovalDecision): {
  id: string;
  disruptionId: string;
  workflowId?: string;
  pathId: string;
  status: string;
  requestedAt: string;
  decidedBy: string;
  decidedAt: string;
  note?: string;
} {
  const now = new Date().toISOString();
  return {
    id: decision.requestId ?? `APR-${decision.disruptionId}-${decision.pathId}`,
    disruptionId: decision.disruptionId,
    ...(decision.workflowId ? { workflowId: decision.workflowId } : {}),
    pathId: decision.pathId,
    status: decision.decision,
    requestedAt: now,
    decidedBy: decision.decidedBy,
    decidedAt: now,
    ...(decision.note ? { note: decision.note } : {}),
  };
}

/**
 * POST /api/recovery/approvals
 * Persists an ApprovalDecision (keyed by APR-<disruptionId>-<pathId>, so
 * repeated submissions upsert instead of duplicating) as long as the target
 * disruption exists.
 */
const create: Handler = async ({ body }): Promise<ApiResponse> => {
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new HttpError(400, "VALIDATION_ERROR", `Invalid payload — ${detail}`);
  }

  const { disruptionId } = parsed.data;

  const disruption = db
    .select({ id: disruptions.id })
    .from(disruptions)
    .where(eq(disruptions.id, disruptionId))
    .get();
  if (!disruption) {
    throw new HttpError(
      404,
      "DISRUPTION_NOT_FOUND",
      `No disruption with id '${disruptionId}'. Cannot persist an approval for it.`,
    );
  }

  const row = toRow(parsed.data);

  db.insert(approvalRequests)
    .values({ ...row, recommendation: "" })
    .onConflictDoUpdate({
      target: approvalRequests.id,
      set: {
        status: row.status,
        workflowId: row.workflowId,
        decidedBy: row.decidedBy,
        decidedAt: row.decidedAt,
        note: row.note,
      },
    })
    .run();

  const persisted = db
    .select()
    .from(approvalRequests)
    .where(eq(approvalRequests.id, row.id))
    .get();
  if (!persisted) {
    throw new HttpError(500, "INSERT_FAILED", "Approval request could not be persisted.");
  }
  return { status: 201, body: toApprovalRequest(persisted) };
};

/**
 * GET /api/recovery/approvals/:id
 */
const byId: Handler = async ({ params }): Promise<ApiResponse> => {
  const id = params["id"] ?? "";
  const row = db.select().from(approvalRequests).where(eq(approvalRequests.id, id)).get();
  if (!row) {
    throw new HttpError(404, "APPROVAL_NOT_FOUND", `No approval request with id '${id}'.`);
  }
  return { status: 200, body: toApprovalRequest(row) };
};

export const approvals = { create, byId };