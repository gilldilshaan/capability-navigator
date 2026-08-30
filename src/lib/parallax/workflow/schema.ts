import { z } from "zod";

export const disruptionSchema = z.object({
  id: z.string(),
  title: z.string(),
  supplierId: z.string(),
  supplier: z.string(),
  component: z.string(),
  dependency: z.string(),
  capabilityId: z.string(),
  severity: z.string(),
  detectedAt: z.string(),
  impactHours: z.number().positive(),
  impact: z.string(),
  affectedSkus: z.number().int().nonnegative(),
  exposedUnits: z.string(),
});

export const capabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  requirements: z.array(z.string()),
  redundancy: z.number().nonnegative(),
  targetRedundancy: z.number().nonnegative(),
  status: z.string(),
  owner: z.string(),
});

export const resourceSchema = z.object({
  id: z.string(),
  kind: z.enum(["supplier", "factory", "machine", "inventory", "workforce", "route"]),
  name: z.string(),
  status: z.string(),
  capabilityIds: z.array(z.string()),
  metrics: z.record(z.string(), z.number()),
  rationale: z.string(),
});

export const pathFactorSchema = z.object({
  key: z.enum(["speed", "risk", "cost", "capacity", "dependency"]),
  label: z.string(),
  weight: z.number().positive(),
  score: z.number().min(0).max(100),
  note: z.string(),
});

export const recoveryPathSchema = z.object({
  id: z.enum(["A", "B", "C"]),
  title: z.string(),
  strategy: z.string(),
  composition: z.array(z.string()),
  recoveryDays: z.number().nonnegative(),
  costLakh: z.number().nonnegative(),
  risk: z.enum(["Medium", "Medium-Low", "LOW"]),
  capacityCoveragePct: z.number().min(0).max(100),
  dependencyConcentration: z.string(),
  compliance: z.string(),
  factors: z.array(pathFactorSchema),
  chain: z.array(z.string()),
  rationale: z.string(),
});

export const comparisonSchema = z.object({
  pathId: z.enum(["A", "B", "C"]),
  score: z.number().min(0).max(100),
  rank: z.number().int().positive(),
});

export const complianceFindingSchema = z.object({
  pathId: z.enum(["A", "B", "C"]),
  status: z.enum(["PASS", "REVIEW_REQUIRED", "BLOCKED"]),
  findings: z.array(z.string()),
});

export const workflowStageSchema = z.enum([
  "DISRUPTION",
  "CAPABILITY",
  "RESOURCE_DISCOVERY",
  "RECOVERY",
  "SCENARIO_COMPARISON",
  "COMPLIANCE",
  "RECOMMENDATION",
  "HUMAN_APPROVAL",
]);

export const executionTraceSchema = z.object({
  stage: workflowStageSchema,
  status: z.enum(["COMPLETE", "AWAITING_HUMAN"]),
  model: z.string().nullable().optional(),
  durationMs: z.number().nonnegative().optional(),
  validation: z.enum(["NOT_APPLICABLE", "VALID", "UNAVAILABLE", "REJECTED", "FAILED"]).optional(),
  summary: z.string(),
});

export const recommendationNarrativeSchema = z.object({
  status: z.enum(["AVAILABLE", "UNAVAILABLE"]),
  pathId: z.enum(["A", "B", "C"]).nullable(),
  recommendation: z.string().max(600),
  rationale: z.array(z.string().max(240)).max(4),
  tradeoffs: z
    .array(
      z.object({
        pathId: z.enum(["A", "B", "C"]),
        summary: z.string().max(280),
      }),
    )
    .max(3),
  humanApprovalNote: z.string().max(280),
  model: z.string().nullable(),
});

export const workflowStateSchema = z.object({
  disruption: disruptionSchema.nullable(),
  affectedCapabilities: z.array(capabilitySchema),
  availableResources: z.array(resourceSchema),
  recoveryPaths: z.array(recoveryPathSchema),
  comparison: z.array(comparisonSchema),
  complianceFindings: z.array(complianceFindingSchema),
  recommendedPath: recoveryPathSchema.nullable(),
  recommendedPathId: z.enum(["A", "B", "C"]).nullable(),
  trace: z.array(executionTraceSchema),
});

export const workflowResultSchema = workflowStateSchema.extend({
  narrative: recommendationNarrativeSchema,
});

export type WorkflowDisruption = z.infer<typeof disruptionSchema>;
export type WorkflowState = z.infer<typeof workflowStateSchema>;
export type WorkflowResult = z.infer<typeof workflowResultSchema>;
export type RecommendationNarrative = z.infer<typeof recommendationNarrativeSchema>;
export type WorkflowResource = z.infer<typeof resourceSchema>;
export type WorkflowTrace = z.infer<typeof executionTraceSchema>;

export const createWorkflowState = (): WorkflowState =>
  workflowStateSchema.parse({
    disruption: null,
    affectedCapabilities: [],
    availableResources: [],
    recoveryPaths: [],
    comparison: [],
    complianceFindings: [],
    recommendedPath: null,
    recommendedPathId: null,
    trace: [],
  });
