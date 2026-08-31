import { ArrowDown, GitBranch } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Two micro-flow diagrams that make the product thesis visual:
 * - Traditional response: linear, slow, reactive (muted chain).
 * - PARALLAX response: capability-first, parallel, recovery-oriented (ai-accent).
 * Presentational only — the text comes from the page, not from here.
 */

export function TraditionalFlow({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li key={step}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-sm border border-border/70 bg-transparent px-3 py-2 opacity-80",
                isLast && "border-critical/40 bg-critical/8",
              )}
            >
              <span className="num text-[10px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-[12px]",
                  isLast ? "font-medium text-critical" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
            {!isLast ? (
              <div className="flex h-4 items-center pl-5">
                <ArrowDown className="size-3 text-border-strong" />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function ParallaxFlow({
  root,
  branches,
  outcome,
}: {
  root: string;
  branches: string[];
  outcome: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-sm border border-ai/40 bg-ai/8 px-3 py-2">
        <span className="num text-[10px] text-muted-foreground">01</span>
        <span className="text-[12px] font-medium text-foreground">{root}</span>
      </div>
      <div className="ml-7 h-4 w-px bg-ai/40" />
      <ul className="ml-4 space-y-1 border-l border-ai/30 pb-1 pl-4">
        {branches.map((branch, i) => (
          <li key={branch} className="relative flex items-center gap-2">
            <span className="num text-[10px] text-muted-foreground">
              {String(i + 2).padStart(2, "0")}
            </span>
            <GitBranch className="size-3 shrink-0 text-ai/70" />
            <span className="text-[12px] text-foreground/85">{branch}</span>
          </li>
        ))}
      </ul>
      <div className="ml-7 h-4 w-px bg-ai/40" />
      <div className="flex items-center gap-3 rounded-sm border border-success/45 bg-success/8 px-3 py-2">
        <span className="num text-[10px] text-muted-foreground">
          {String(branches.length + 2).padStart(2, "0")}
        </span>
        <span className="text-[12px] font-medium text-success">{outcome}</span>
      </div>
    </div>
  );
}
