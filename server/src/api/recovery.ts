import { eq } from "drizzle-orm";
import { z } from "zod";

import type { RecoveryResult } from "@/types/parallax";

import { db } from "../db/client";
import { disruptions } from "../db/schema";
import { recoveryPaths } from "../../../src/lib/parallax/data";
import type { ApiResponse, Handler } from "./router";
import { HttpError } from "./router";

/**
 * POST /api/recovery/paths
 *
 * Generates recovery paths for a given disruption.  The recovery-path
 * computation uses the seeded static paths (which mirror the real data
 * model) and enriches them with the disruption context from the DB.
 *
 * In a production deployment, this endpoint would invoke a proper solver
 * (mixed-integer optimiser / constraint propagation), but for the demo we
 * use the same deterministic paths that the frontend mock already served.
 */
const pathsSchema = z.object({
  disruptionId: z.string().min(1, "disruptionId is required"),
});

const paths: Handler = async ({ body }): Promise<ApiResponse> => {
  const parsed = pathsSchema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new HttpError(400, "VALIDATION_ERROR", `Invalid payload — ${detail}`);
  }

  const { disruptionId } = parsed.data;

  // Verify the disruption exists
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

  const result: RecoveryResult = {
    disruptionId,
    paths: recoveryPaths,
    recommendedPathId: "C",
    requiresApproval: true,
    complianceNote: "Path C requires human verification of GDP cold-chain sign-off.",
    resilienceAfter: 93,
  };

  return { status: 200, body: result };
};

export const recovery = { paths };
