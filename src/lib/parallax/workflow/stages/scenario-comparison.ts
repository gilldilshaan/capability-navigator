import type { WorkflowState } from "../schema";

export function runScenarioComparisonStage(state: WorkflowState): WorkflowState {
  const comparison = state.recoveryPaths
    .map((path) => ({
      pathId: path.id,
      score: Math.round(
        path.factors.reduce((total, factor) => total + (factor.weight / 100) * factor.score, 0),
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
  return {
    ...state,
    comparison,
    trace: [
      ...state.trace,
      {
        stage: "SCENARIO_COMPARISON",
        status: "COMPLETE",
        summary: `${comparison.length} paths scored using their calculated factors.`,
      },
    ],
  };
}
