import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { AiTag, Meter } from "@/components/parallax/primitives";
import { cn } from "@/lib/utils";

/**
 * Reusable AI recommendation card — the standard way PARALLAX presents an
 * agent recommendation everywhere (Overview, Recovery Paths, Audit).
 * All content comes from engine/store data; nothing is invented here.
 */
export function RecommendationCard({
  title,
  confidence,
  reasoning,
  benefits = [],
  risks = [],
  action,
  requiresHumanApproval = true,
  className,
}: {
  title: string;
  /** 0-100 — the engine's own score, shown as confidence. */
  confidence?: number | undefined;
  reasoning?: string | undefined;
  benefits?: string[] | undefined;
  risks?: string[] | undefined;
  action?: { label: string; onClick?: () => void; to?: string } | undefined;
  requiresHumanApproval?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("panel-inset border-ai/30", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 px-4 py-2.5">
        <AiTag>AI recommendation</AiTag>
        <span className="label-xs">Agentic analysis</span>
        {requiresHumanApproval ? (
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.08em] text-warning uppercase">
            <ShieldCheck className="size-3" /> Human approval required
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="text-base leading-snug font-semibold text-foreground">{title}</h3>
          {confidence != null ? (
            <div className="w-32 shrink-0">
              <div className="flex items-baseline justify-between">
                <span className="label-xs">Confidence</span>
                <span className="num text-xs font-semibold text-ai">{confidence}/100</span>
              </div>
              <Meter value={confidence} tone="info" className="mt-1" />
            </div>
          ) : null}
        </div>

        {reasoning ? (
          <p className="text-[13px] leading-relaxed text-foreground/90">{reasoning}</p>
        ) : null}

        {benefits.length > 0 ? (
          <div>
            <p className="label-xs mb-1.5">Why this path</p>
            <ul className="space-y-1">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs text-foreground/85">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-success" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {risks.length > 0 ? (
          <div>
            <p className="label-xs mb-1.5">Risks &amp; watch items</p>
            <ul className="space-y-1">
              {risks.map((r) => (
                <li key={r} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {action ? (
          <div className="border-t border-border/80 pt-3">
            {action.to ? (
              <Link
                to={action.to}
                className="inline-flex items-center gap-1.5 rounded-sm border border-ai/50 bg-ai/12 px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-ai uppercase transition-colors hover:bg-ai/22"
              >
                {action.label} <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex items-center gap-1.5 rounded-sm border border-ai/50 bg-ai/12 px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-ai uppercase transition-colors hover:bg-ai/22"
              >
                {action.label} <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
