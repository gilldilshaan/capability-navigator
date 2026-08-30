import { activeDisruption } from "./data";
import {
  createWorkflowFromDisruption,
  type AgentWorkflow,
} from "./workflow/adapter";

export async function postWorkflowApi(
  disruptionId: string = activeDisruption.id,
): Promise<AgentWorkflow> {
  try {
    const response = await fetch("/api/agents/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disruptionId }),
    });
    if (response.ok) {
      const data = (await response.json()) as AgentWorkflow;
      return data;
    }
  } catch (error) {
    console.warn(
      "API request to /api/agents/workflows failed, falling back to direct server orchestrator execution:",
      error,
    );
  }

  // Fallback compatibility
  return createWorkflowFromDisruption({ disruptionId });
}

export async function getWorkflowApi(
  workflowId: string,
): Promise<AgentWorkflow> {
  try {
    const response = await fetch(
      `/api/agents/workflows/${encodeURIComponent(workflowId)}`,
    );
    if (response.ok) {
      const data = (await response.json()) as AgentWorkflow;
      return data;
    }
  } catch (error) {
    console.warn(
      `API request to /api/agents/workflows/${workflowId} failed, falling back to direct server orchestrator execution:`,
      error,
    );
  }

  // Fallback compatibility
  const fallback = await createWorkflowFromDisruption({
    disruptionId: activeDisruption.id,
  });
  return fallback;
}
