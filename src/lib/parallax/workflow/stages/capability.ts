import { capabilities, capabilityById } from "../../data";
import type { WorkflowState } from "../schema";

export function runCapabilityStage(state: WorkflowState): WorkflowState {
  if (!state.disruption) throw new Error("Capability stage requires a disruption.");
  const visited = new Set<string>();
  const collect = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    capabilityById[id]?.requirements.forEach(collect);
  };
  collect(state.disruption.capabilityId);
  const affectedCapabilities = capabilities.filter((capability) => visited.has(capability.id));
  return {
    ...state,
    affectedCapabilities,
    trace: [
      ...state.trace,
      {
        stage: "CAPABILITY",
        status: "COMPLETE",
        summary: `${affectedCapabilities.length} reachable capability dependencies mapped.`,
      },
    ],
  };
}
