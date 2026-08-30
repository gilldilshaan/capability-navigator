import {
  createWorkflowState,
  workflowResultSchema,
  workflowStateSchema,
  type WorkflowDisruption,
  type WorkflowResult,
} from "./schema";
import { generateRecommendationNarrative } from "./llm/recommendation.server";
import { runCapabilityStage } from "./stages/capability";
import { runComplianceStage } from "./stages/compliance";
import { runDisruptionStage } from "./stages/disruption";
import { runRecoveryStage } from "./stages/recovery";
import { runResourceDiscoveryStage } from "./stages/resource-discovery";
import { runScenarioComparisonStage } from "./stages/scenario-comparison";

export async function runParallaxWorkflow(input: WorkflowDisruption): Promise<WorkflowResult> {
  const disrupted = runDisruptionStage(createWorkflowState(), input);
  const capabilityMapped = runCapabilityStage(disrupted);
  const resourcesDiscovered = runResourceDiscoveryStage(capabilityMapped);
  const recoveryGenerated = runRecoveryStage(resourcesDiscovered);
  const compared = runScenarioComparisonStage(recoveryGenerated);
  const deterministic = workflowStateSchema.parse(runComplianceStage(compared));
  const llm = await generateRecommendationNarrative({
    disruption: deterministic.disruption!,
    affectedCapabilities: deterministic.affectedCapabilities,
    recoveryPaths: deterministic.recoveryPaths,
    comparison: deterministic.comparison,
    complianceFindings: deterministic.complianceFindings,
    deterministicRecommendedPathId: deterministic.recommendedPathId,
  });
  return workflowResultSchema.parse({
    ...deterministic,
    narrative: llm.narrative,
    trace: [
      ...deterministic.trace,
      {
        stage: "RECOMMENDATION",
        status: "COMPLETE",
        model: llm.model,
        durationMs: llm.durationMs,
        validation: llm.validation,
        summary: llm.summary,
      },
      {
        stage: "HUMAN_APPROVAL",
        status: "AWAITING_HUMAN",
        summary: "Recommendation prepared; execution remains pending human approval.",
      },
    ],
  });
}
