import { eq } from "drizzle-orm";
import type { RecoveryResult } from "@/types/parallax";
import { activeDisruption, recoveryPaths } from "@/lib/parallax/data";
import { runParallaxWorkflow } from "@/lib/parallax/workflow/orchestrator";
import { db } from "../db/client";
import { disruptions as disruptionsTable } from "../db/schema";
import { toDisruption } from "./mappers";
import type { ApiResponse, Handler } from "./router";

/**
 * POST /api/recovery/paths
 */
const paths: Handler = async ({ body }): Promise<ApiResponse> => {
  const reqBody = (body as Record<string, unknown>) ?? {};
  const disruptionId =
    typeof reqBody["disruptionId"] === "string" ? reqBody["disruptionId"] : activeDisruption.id;

  let dbDisruption = null;
  if (disruptionId) {
    dbDisruption = db
      .select()
      .from(disruptionsTable)
      .where(eq(disruptionsTable.id, disruptionId))
      .get();
  }

  const disruptionToRun = dbDisruption
    ? toDisruption(dbDisruption)
    : { ...activeDisruption, id: disruptionId };

  let resultPaths = recoveryPaths;
  let recommendedPathId = "C";
  let complianceNote = "Path C requires human verification of GDP cold-chain sign-off.";

  try {
    const wf = await runParallaxWorkflow({
      id: disruptionToRun.id,
      title: disruptionToRun.title,
      severity: (disruptionToRun.severity as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") ?? "HIGH",
      supplierId: disruptionToRun.supplierId ?? "SUP-1001",
      supplier: disruptionToRun.supplier ?? "MedCore Components Ltd.",
      component: disruptionToRun.component ?? "Supply of CAP-THS-017",
      dependency: disruptionToRun.dependency ?? "CAP-THS-017",
      capabilityId: disruptionToRun.capabilityId ?? "CAP-THS-017",
      detectedAt: disruptionToRun.detectedAt ?? new Date().toISOString(),
      impactHours: disruptionToRun.impactHours ?? 72,
      impact: disruptionToRun.impact ?? "Critical supply disruption",
      affectedSkus: disruptionToRun.affectedSkus ?? 14,
      exposedUnits: disruptionToRun.exposedUnits ?? "2.4M",
    });

    if (wf.recoveryPaths && wf.recoveryPaths.length > 0) {
      resultPaths = wf.recoveryPaths;
    }
    if (wf.recommendedPathId) {
      recommendedPathId = wf.recommendedPathId;
    }
    const compFinding = wf.complianceFindings?.find((c) => c.pathId === recommendedPathId);
    if (compFinding?.findings?.[0]) {
      complianceNote = compFinding.findings[0];
    }
  } catch (err) {
    console.warn("[parallax/api] runParallaxWorkflow fallback in /api/recovery/paths:", err);
  }

  const responseBody: RecoveryResult = {
    disruptionId,
    paths: resultPaths,
    recommendedPathId,
    requiresApproval: true,
    complianceNote,
    resilienceAfter: 93,
  };

  return { status: 200, body: responseBody };
};

export const recovery = { paths };
