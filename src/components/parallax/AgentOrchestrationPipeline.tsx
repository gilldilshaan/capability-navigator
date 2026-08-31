import { CheckCircle2, Circle, Loader2, UserCheck, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/parallax/store";

export interface PipelineStage {
  id: string;
  code: string;
  name: string;
  status: AgentStatus;
  message: string;
}

export type ApprovalStage = "HIDDEN" | "WAITING" | "APPROVED" | "DECLINED";

/**
 * Connected execution pipeline for the agentic workflow — the product's core
 * differentiator rendered as a state machine, not a log. Every stage carries
 * its live status from the store; the human-approval terminus renders only
 * when the workflow asks for one. Presentational: all state comes from props.
 */
export function AgentOrchestrationPipeline({
  stages,
  approval = "HIDDEN",
  className,
}: {
  stages: PipelineStage[];
  approval?: ApprovalStage;
  className?: string;
}) {
  return (
    <ol className={cn("relative", className)}>
      {stages.map((stage, i) => {
        const isLastAgent = i === stages.length - 1 && approval === "HIDDEN";
        const running = stage.status === "RUNNING";
        const complete = stage.status === "COMPLETE";
        const failed = stage.status === "FAILED";

        return (
          <li key={stage.id} className="relative flex gap-3 pb-1">
            {/* connector to the next stage */}
            {!isLastAgent ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-9 bottom-0 left-[15px] w-px",
                  complete ? "bg-success/40" : failed ? "bg-critical/40" : "bg-border",
                )}
              />
            ) : null}

            {/* status indicator */}
            <span
              className={cn(
                "relative z-10 mt-0.5 grid size-8 shrink-0 place-items-center rounded-sm border",
                complete && "border-success/45 bg-success/10 text-success",
                running && "border-ai/45 bg-ai/10 text-ai",
                failed && "border-critical/45 bg-critical/10 text-critical",
                stage.status === "QUEUED" && "border-border bg-surface text-muted-foreground/60",
              )}
            >
              {complete ? (
                <CheckCircle2 className="size-4" />
              ) : running ? (
                <Loader2 className="size-4 breath" />
              ) : failed ? (
                <XCircle className="size-4" />
              ) : (
                <Circle className="size-2.5" />
              )}
            </span>

            {/* stage body */}
            <div
              className={cn(
                "min-w-0 flex-1 rounded-sm border px-3 py-2 transition-colors duration-300",
                running
                  ? "border-ai/40 bg-ai/6"
                  : complete
                    ? "border-border bg-surface"
                    : failed
                      ? "border-critical/40 bg-critical/8"
                      : "border-border/60 bg-transparent",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="num text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "truncate text-[12px] font-semibold uppercase",
                    running ? "text-ai" : complete ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {stage.name}
                </span>
                <span
                  className={cn(
                    "num ml-auto shrink-0 text-[9px] tracking-[0.1em] uppercase",
                    complete && "text-success",
                    running && "text-ai",
                    failed && "text-critical",
                    stage.status === "QUEUED" && "text-muted-foreground/70",
                  )}
                >
                  {stage.status}
                </span>
              </div>
              <p className="mt-1 pl-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {stage.message}
              </p>
            </div>
          </li>
        );
      })}

      {approval !== "HIDDEN" ? (
        <li className="relative flex gap-3">
          <span
            className={cn(
              "relative z-10 mt-0.5 grid size-8 shrink-0 place-items-center rounded-sm border",
              approval === "WAITING" && "border-warning/45 bg-warning/10 text-warning",
              approval === "APPROVED" && "border-success/45 bg-success/10 text-success",
              approval === "DECLINED" && "border-critical/45 bg-critical/10 text-critical",
            )}
          >
            <UserCheck className={cn("size-4", approval === "WAITING" && "breath")} />
          </span>
          <div
            className={cn(
              "min-w-0 flex-1 rounded-sm border px-3 py-2",
              approval === "WAITING" && "border-warning/40 bg-warning/8",
              approval === "APPROVED" && "border-success/40 bg-success/8",
              approval === "DECLINED" && "border-critical/40 bg-critical/8",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="num text-[10px] text-muted-foreground">
                {String(stages.length + 1).padStart(2, "0")}
              </span>
              <span className="truncate text-[12px] font-semibold text-foreground uppercase">
                Human decision
              </span>
              <span
                className={cn(
                  "num ml-auto shrink-0 text-[9px] tracking-[0.1em] uppercase",
                  approval === "WAITING" && "text-warning",
                  approval === "APPROVED" && "text-success",
                  approval === "DECLINED" && "text-critical",
                )}
              >
                {approval === "WAITING" ? "REQUIRED" : approval}
              </span>
            </div>
            <p className="mt-1 pl-0.5 text-[11px] leading-relaxed text-muted-foreground">
              {approval === "WAITING"
                ? "Nothing executes without a manager decision."
                : approval === "APPROVED"
                  ? "Recovery plan approved — execution handoff ready."
                  : "Decision recorded — incident remains open."}
            </p>
          </div>
        </li>
      ) : null}
    </ol>
  );
}
