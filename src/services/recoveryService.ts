/**
 * PARALLAX — recovery service (backend: Diya for paths, Bani for approvals).
 *
 * Recovery paths (time / cost / risk / capacity + recommended path) and the
 * human approval round-trip. Mock responses come from
 * src/lib/parallax/data.ts and are temporary until the recovery endpoints
 * exist (see FRONTEND_INTEGRATION_PLAN.md §3.3).
 */

import type { ApprovalDecision, ApprovalRequest, RecoveryResult } from "@/types/parallax";
import { recoveryPaths } from "@/lib/parallax/data";
import { get, post, withFallback, type ApiEnvelope } from "./api";
import { apiConfig } from "./config";

/** Flow C — multiple recovery paths with a recommended one. */
export function getRecoveryPaths(disruptionId: string): Promise<ApiEnvelope<RecoveryResult>> {
  return withFallback<RecoveryResult>({
    label: `recovery paths (${disruptionId})`,
    live: () => post<RecoveryResult>(`${apiConfig.urls.recovery()}/paths`, { disruptionId }),
    mock: () => ({
      disruptionId,
      paths: recoveryPaths,
      recommendedPathId: "C",
      requiresApproval: true,
      complianceNote: "Path C requires human verification of GDP cold-chain sign-off.",
      resilienceAfter: 93,
    }),
  });
}

/** Flow F — send the human decision (approve / reject / request alternative) to the backend. */
export function submitApproval(decision: ApprovalDecision): Promise<ApiEnvelope<ApprovalRequest>> {
  return withFallback<ApprovalRequest>({
    label: `approval decision (${decision.decision} path ${decision.pathId})`,
    live: () => post<ApprovalRequest>(`${apiConfig.urls.recovery()}/approvals`, decision),
    mock: () => ({
      id: `APR-${decision.disruptionId}-${decision.pathId}`,
      disruptionId: decision.disruptionId,
      ...(decision.workflowId ? { workflowId: decision.workflowId } : {}),
      pathId: decision.pathId,
      recommendation: `Path ${decision.pathId}`,
      complianceStatus: "GDP cold-chain sign-off recorded by approver",
      status: decision.decision,
      requestedAt: new Date().toISOString(),
      decidedBy: decision.decidedBy,
      decidedAt: new Date().toISOString(),
      ...(decision.note ? { note: decision.note } : {}),
    }),
  });
}

export function getApproval(requestId: string): Promise<ApiEnvelope<ApprovalRequest>> {
  return withFallback<ApprovalRequest>({
    label: `approval status (${requestId})`,
    live: () =>
      get<ApprovalRequest>(
        `${apiConfig.urls.recovery()}/approvals/${encodeURIComponent(requestId)}`,
      ),
    mock: () => {
      throw new Error(`Unknown approval request ${requestId}`);
    },
  });
}
