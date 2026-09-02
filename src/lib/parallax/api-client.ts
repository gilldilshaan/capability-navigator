import { activeDisruption } from "./data";
import { createWorkflowFromDisruption, type AgentWorkflow } from "./workflow/adapter";
import { apiConfig } from "@/services";

export async function postWorkflowApi(
  disruptionId: string = activeDisruption.id,
): Promise<AgentWorkflow> {
  try {
    const response = await fetch(`${apiConfig.urls.agents()}/workflows`, {
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
      `API request to ${apiConfig.urls.agents()}/workflows failed, falling back to direct server orchestrator execution:`,
      error,
    );
  }

  // Fallback compatibility
  return createWorkflowFromDisruption({ disruptionId });
}

export async function getWorkflowApi(workflowId: string): Promise<AgentWorkflow> {
  try {
    const response = await fetch(
      `${apiConfig.urls.agents()}/workflows/${encodeURIComponent(workflowId)}`,
    );
    if (response.ok) {
      const data = (await response.json()) as AgentWorkflow;
      return data;
    }
  } catch (error) {
    console.warn(
      `API request to ${apiConfig.urls.agents()}/workflows/${workflowId} failed, falling back to direct server orchestrator execution:`,
      error,
    );
  }

  // Fallback compatibility
  const disruptionId = workflowId.replace(/^(wf-|WF-)/, "") || activeDisruption.id;
  const fallback = await createWorkflowFromDisruption({
    disruptionId,
  });
  return fallback;
}
