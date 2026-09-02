import { ChevronDown, Terminal } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  AgentOrchestrationPipeline,
  type ApprovalStage,
} from "@/components/parallax/AgentOrchestrationPipeline";
import { StatusPill } from "@/components/parallax/primitives";
import { useParallax } from "@/lib/parallax/store";
import { cn } from "@/lib/utils";

export function AgentActivity({ compact = false }: { compact?: boolean }) {
  const {
    agents,
    activity,
    analysis,
    analysisProgress,
    pipelineStage,
    agentPanelOpen,
    setAgentPanelOpen,
    recoveryStatus,
  } = useParallax();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [activity.length]);

  const statusTone =
    analysis === "running"
      ? "warning"
      : analysis === "complete"
        ? "success"
        : analysis === "error"
          ? "critical"
          : "info";
  const statusLabel =
    analysis === "running"
      ? pipelineStage || "Running"
      : analysis === "complete"
        ? "COMPLETE"
        : analysis === "error"
          ? "Degraded"
          : "Standby";

  const approval: ApprovalStage =
    recoveryStatus === "AWAITING APPROVAL" || recoveryStatus === "ALTERNATIVE REQUESTED"
      ? "WAITING"
      : recoveryStatus === "APPROVED"
        ? "APPROVED"
        : recoveryStatus === "REJECTED"
          ? "DECLINED"
          : "HIDDEN";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <button
        type="button"
        onClick={() => setAgentPanelOpen(!agentPanelOpen)}
        className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left"
      >
        <Terminal className="size-4 text-ai" />
        <span className="text-[13px] font-semibold tracking-[0.02em] text-foreground uppercase">
          Agent activity
        </span>
        <StatusPill tone={statusTone} className="ml-auto">
          {statusLabel}
        </StatusPill>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            !agentPanelOpen && "-rotate-90",
          )}
        />
      </button>

      {agentPanelOpen ? (
        <>
          <div className={cn("border-b border-border px-3 py-3", compact && "px-0")}>
            <p className="label-xs mb-2 px-1">Pipeline · 6 agents + human approval</p>
            <AgentOrchestrationPipeline stages={agents} approval={approval} />
          </div>

          <div className="px-3 py-3">
            {analysis === "running" ? (
              <div className="panel-inset px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <span className="label-xs">{pipelineStage || "Orchestration"}</span>
                  <span className="num text-[11px] text-ai">{analysisProgress}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-ai transition-[width] duration-500"
                    style={{ width: `${Math.max(4, analysisProgress)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="panel-inset px-2.5 py-2">
                <p className="label-xs">
                  {analysis === "error"
                    ? "Analysis failed"
                    : analysis === "complete"
                      ? "Analysis complete"
                      : "Analyzing automatically"}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {analysis === "error"
                    ? "The capabilities were not identified. See the system banner for details."
                    : "Agents run automatically — review the recovery paths and approve one."}
                </p>
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 border-t border-border">
            <p className="label-xs px-4 py-2">Orchestration log</p>
            <div
              ref={logRef}
              className="h-full max-h-[calc(100vh-36rem)] min-h-24 overflow-y-auto px-4 pb-6"
            >
              {activity.map((entry) => (
                <div key={entry.id} className="rise-in border-l border-border py-1.5 pl-2.5">
                  <div className="flex items-center gap-2">
                    <span className="num text-[10px] text-muted-foreground">{entry.time}</span>
                    <span className="num text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
                      [{entry.channel}]
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/85">
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
