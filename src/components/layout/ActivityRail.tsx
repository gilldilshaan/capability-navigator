import { CheckCircle2, ChevronLeft, Circle, Loader2, UserCheck, XCircle } from "lucide-react";

import { AgentActivity } from "@/components/parallax/AgentActivity";
import { useParallax, type AgentStatus } from "@/lib/parallax/store";
import { cn } from "@/lib/utils";

function statusIconClass(status: AgentStatus): string {
  if (status === "COMPLETE") return "text-success";
  if (status === "RUNNING") return "text-ai";
  if (status === "FAILED") return "text-critical";
  return "text-muted-foreground/60";
}

/**
 * AI activity rail — collapsed 56px icon column by default so the workspace
 * keeps its width; expands to ~320px with the full orchestration console
 * (pipeline + run control + log). Status is visible in both states.
 */
export function ActivityRail() {
  const { agents, agentPanelOpen, setAgentPanelOpen, recoveryStatus, analysis } = useParallax();

  const approvalWaiting =
    recoveryStatus === "AWAITING APPROVAL" || recoveryStatus === "ALTERNATIVE REQUESTED";
  const approvalApproved = recoveryStatus === "APPROVED";

  if (!agentPanelOpen) {
    return (
      <button
        type="button"
        onClick={() => setAgentPanelOpen(true)}
        title="Expand agent activity"
        aria-label="Expand agent activity"
        className="group sticky top-14 hidden h-[calc(100vh-3.5rem)] w-14 shrink-0 flex-col items-center gap-1 border-l border-border bg-sidebar px-2 py-4 lg:flex"
      >
        <span className="label-xs mb-2 text-[9px]">Agents</span>
        {agents.map((agent, i) => (
          <span
            key={agent.id}
            title={`${String(i + 1).padStart(2, "0")} ${agent.name} — ${agent.status}`}
            className={cn(
              "grid size-8 place-items-center rounded-sm border",
              agent.status === "RUNNING"
                ? "border-ai/40 bg-ai/10"
                : agent.status === "COMPLETE"
                  ? "border-border bg-surface"
                  : "border-border/60 bg-transparent",
            )}
          >
            {agent.status === "COMPLETE" ? (
              <CheckCircle2 className={cn("size-4", statusIconClass(agent.status))} />
            ) : agent.status === "RUNNING" ? (
              <Loader2 className={cn("size-4 breath", statusIconClass(agent.status))} />
            ) : agent.status === "FAILED" ? (
              <XCircle className={cn("size-4", statusIconClass(agent.status))} />
            ) : (
              <Circle className="size-2.5 text-muted-foreground/50" />
            )}
          </span>
        ))}

        {approvalWaiting ? (
          <span
            title="Human decision required"
            className="mt-1 grid size-8 place-items-center rounded-sm border border-warning/45 bg-warning/10 text-warning"
          >
            <UserCheck className="size-4 breath" />
          </span>
        ) : approvalApproved ? (
          <span
            title="Recovery approved"
            className="mt-1 grid size-8 place-items-center rounded-sm border border-success/45 bg-success/10 text-success"
          >
            <UserCheck className="size-4" />
          </span>
        ) : null}

        <span className="mt-auto inline-flex flex-col items-center gap-1">
          <span
            className={cn(
              "inline-flex size-1.5 rounded-full",
              analysis === "running"
                ? "bg-ai breath"
                : analysis === "complete"
                  ? "bg-success"
                  : "bg-muted-foreground/40",
            )}
          />
          <ChevronLeft className="size-4 text-muted-foreground transition-transform duration-200 group-hover:-translate-x-0.5" />
        </span>
      </button>
    );
  }

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-80 shrink-0 flex-col border-l border-border bg-sidebar lg:flex">
      <AgentActivity />
    </aside>
  );
}
