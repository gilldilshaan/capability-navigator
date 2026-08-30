import { z } from "zod";

import {
  capabilitySchema,
  complianceFindingSchema,
  comparisonSchema,
  disruptionSchema,
  recoveryPathSchema,
} from "../schema";

export const llmInputSnapshotSchema = z
  .object({
    disruption: disruptionSchema.strict(),
    affectedCapabilities: z.array(capabilitySchema.strict()),
    recoveryPaths: z.array(recoveryPathSchema.strict()),
    comparison: z.array(comparisonSchema.strict()),
    complianceFindings: z.array(complianceFindingSchema.strict()),
    deterministicRecommendedPathId: z.enum(["A", "B", "C"]).nullable(),
  })
  .strict();

export const llmOutputSchema = z
  .object({
    pathId: z.enum(["A", "B", "C"]),
    recommendation: z.string().min(1).max(600),
    rationale: z.array(z.string().min(1).max(240)).min(1).max(4),
    tradeoffs: z
      .array(
        z
          .object({
            pathId: z.enum(["A", "B", "C"]),
            summary: z.string().min(1).max(280),
          })
          .strict(),
      )
      .max(3),
    humanApprovalNote: z.string().min(1).max(280),
  })
  .strict();

export type LlmInputSnapshot = z.infer<typeof llmInputSnapshotSchema>;
export type LlmOutput = z.infer<typeof llmOutputSchema>;
