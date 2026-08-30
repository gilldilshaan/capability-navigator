import { disruptionSchema, type WorkflowDisruption, type WorkflowState } from "../schema";

export function runDisruptionStage(state: WorkflowState, input: WorkflowDisruption): WorkflowState {
  const disruption = disruptionSchema.parse(input);
  return {
    ...state,
    disruption,
    trace: [
      ...state.trace,
      {
        stage: "DISRUPTION",
        status: "COMPLETE",
        summary: `${disruption.id} validated for ${disruption.supplierId}.`,
      },
    ],
  };
}
