import { ArrowRight, Sparkles } from "lucide-react";

import { DemoTag, Meter, StatusPill } from "@/components/parallax/primitives";
import { scorePath } from "@/lib/parallax/store";
import type { RecoveryPath } from "@/lib/parallax/data";
import { cn } from "@/lib/utils";

export function RecoveryPathCard({
  path,
  recommended,
  selected,
  badge,
  onOpen,
}: {
  path: RecoveryPath;
  recommended?: boolean;
  selected?: boolean;
  /** Comparative label derived from the engine data, e.g. "Fastest" / "Lowest cost". */
  badge?: string | undefined;
  onOpen: () => void;
}) {
  const score = scorePath(path);
  return (
    <article
      className={cn(
        "panel relative flex flex-col p-4 transition-colors",
        recommended ? "border-success/45" : "border-border",
        selected && "glow-info",
      )}
    >
      {recommended || badge ? (
        <div className="mb-3 -mt-1 flex flex-wrap items-center gap-1.5">
          {recommended ? (
            <>
              <Sparkles className="size-3.5 text-success" />
              <span className="font-mono text-[10px] tracking-[0.14em] text-success uppercase">
                Parallax recommendation
              </span>
            </>
          ) : null}
          {badge && !recommended ? (
            <span className="rounded-sm border border-info/40 bg-info/10 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.1em] text-info uppercase">
              {badge}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-xs">Path {path.id}</p>
          <h3 className="mt-1 text-base font-semibold text-foreground">{path.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{path.strategy}</p>
        </div>
        <div className="text-right">
          <p className="label-xs">Score</p>
          <p
            className={cn(
              "num text-3xl font-semibold",
              score >= 85 ? "text-success" : score >= 65 ? "text-warning" : "text-critical",
            )}
          >
            {score}
          </p>
          <p className="num text-[10px] text-muted-foreground">/ 100</p>
        </div>
      </div>

      <ul className="mt-3 space-y-1 border-y border-border py-3">
        {path.composition.map((c) => (
          <li key={c} className="flex items-start gap-2 text-xs text-foreground/85">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-info" />
            {c}
          </li>
        ))}
      </ul>

      <dl className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <dt className="label-xs">Recovery</dt>
          <dd className="num mt-1 text-sm text-foreground">{path.recoveryDays} d</dd>
        </div>
        <div>
          <dt className="label-xs">Cost</dt>
          <dd className="num mt-1 text-sm text-foreground">₹{path.costLakh}L</dd>
        </div>
        <div>
          <dt className="label-xs">Risk</dt>
          <dd className="mt-1">
            <StatusPill dot={false}>{path.risk}</StatusPill>
          </dd>
        </div>
      </dl>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <span className="label-xs">Capacity coverage</span>
          <span className="num text-[11px] text-foreground">{path.capacityCoveragePct}%</span>
        </div>
        <Meter
          value={path.capacityCoveragePct}
          tone={path.capacityCoveragePct >= 90 ? "success" : "warning"}
          className="mt-1.5"
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{path.rationale}</p>

      <div className="mt-4 flex items-center justify-between gap-3 pt-1">
        <DemoTag />
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors",
            recommended
              ? "border-success/50 bg-success/15 text-success hover:bg-success/25"
              : "border-border-strong bg-surface-2 text-muted-foreground hover:text-foreground",
          )}
        >
          Open path {path.id}
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </article>
  );
}
