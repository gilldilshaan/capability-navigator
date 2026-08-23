import { CheckCircle2, ChevronDown, Circle, Loader2, Terminal } from "lucide-react";
import { useEffect, useRef } from "react";

import { StatusPill } from "@/components/parallax/primitives";
import { useParallax } from "@/lib/parallax/store";
import { cn } from "@/lib/utils";

export function AgentActivity({ compact = false }: { compact?: boolean }) {
  const { agents, activity, analysis, analysisProgress, runAnalysis, agentPanelOpen, setAgentPanelOpen } =
    useParallax();
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [activity.length]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <button
        type="button"
        onClick={() => setAgentPanelOpen(!agentPanelOpen)}
        className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left"
      >
        <Terminal className="size-4 text-info" />
        <span className="text-[13px] font-semibold tracking-[0.02em] text-foreground uppercase">Agent activity</span>
        <StatusPill tone={analysis === "running" ? "warning" : analysis === "complete" ? "success" : "info"} className="ml-auto">
          {analysis === "running" ? "Orchestrating" : analysis === "complete" ? "Settled" : "Standby"}
        </StatusPill>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", !agentPanelOpen && "-rotate-90")} />
      </button>

      {agentPanelOpen ? (
        <>
          <div className={cn("space-y-1.5 px-3 py-3", compact && "px-0")}>
            {agents.map((agent, i) => (
              <div
                key={agent.id}
                className={cn(
                  "rounded-sm border px-2.5 py-2 transition-colors",
                  agent.status === "RUNNING"
                    ? "border-warning/40 bg-warning/8"
                    : agent.status === "COMPLETE"
                      ? "border-border bg-surface"
                      : "border-border/60 bg-transparent",
                )}
              >
                <div className="flex items-center gap-2">
                  {agent.status === "COMPLETE" ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                  ) : agent.status === "RUNNING" ? (
                    <Loader2 className="size-3.5 shrink-0 animate-spin text-warning" />
                  ) : (
                    <Circle className="size-3.5 shrink-0 text-muted-foreground/60" />
                  )}
                  <span className="num text-[10px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-xs font-medium text-foreground uppercase">{agent.code}</span>
                  <span className="num ml-auto text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
                    {agent.status}
                  </span>
                </div>
                <p className="mt-1 pl-6 text-[11px] leading-relaxed text-muted-foreground">{agent.message}</p>
              </div>
            ))}
          </div>

          <div className="px-3 pb-3">
            {analysis === "running" ? (
              <div className="panel-inset px-2.5 py-2">
                <div className="flex items-center justify-between">
                  <span className="label-xs">Orchestration</span>
                  <span className="num text-[11px] text-info">{analysisProgress}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-info transition-[width] duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={runAnalysis}
                className="w-full rounded-sm border border-info/50 bg-info/15 px-2.5 py-2 font-mono text-[11px] tracking-[0.1em] text-info uppercase transition-colors hover:bg-info/25"
              >
                {analysis === "complete" ? "Re-run analysis" : "Run analysis"}
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 border-t border-border">
            <p className="label-xs px-4 py-2">Orchestration log</p>
            <div ref={logRef} className="h-full max-h-[calc(100vh-34rem)] min-h-32 overflow-y-auto px-4 pb-6">
              {activity.map((entry) => (
                <div key={entry.id} className="rise-in border-l border-border py-1.5 pl-2.5">
                  <div className="flex items-center gap-2">
                    <span className="num text-[10px] text-muted-foreground">{entry.time}</span>
                    <span className="num text-[10px] tracking-[0.08em] text-info uppercase">[{entry.channel}]</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/85">{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
