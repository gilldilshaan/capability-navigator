import { ShieldCheck, X } from "lucide-react";

import { ChainFlow } from "@/components/parallax/ChainFlow";
import { DataRow, DemoTag, Meter, Panel, PanelHeader, StatusPill } from "@/components/parallax/primitives";
import { scorePath } from "@/lib/parallax/store";
import type { RecoveryPath } from "@/lib/parallax/data";

export function RecoveryPathDetail({
  path,
  onClose,
  onApprove,
  recoveryStatus,
}: {
  path: RecoveryPath;
  onClose: () => void;
  onApprove?: (() => void) | undefined;
  recoveryStatus?: string | undefined;
}) {
  const score = scorePath(path);
  const title = path.id === "C" ? "Capability Reconstruction Path" : `${path.title} Path`;

  return (
    <Panel tone={path.id === "C" ? "success" : undefined} className="rise-in">
      <PanelHeader
        title={title}
        subtitle={path.rationale}
        icon={<ShieldCheck className="size-4" />}
        right={
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface-2 px-2 py-1 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase hover:text-foreground"
          >
            <X className="size-3.5" />
            Close
          </button>
        }
      />

      <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <p className="label-xs mb-2">Reconstruction chain</p>
          <ChainFlow chain={path.chain} />

          <p className="label-xs mt-6 mb-2">Scoring factors — transparent weighted model</p>
          <div className="panel-inset divide-y divide-border">
            {path.factors.map((f) => (
              <div key={f.key} className="px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-foreground">{f.label}</span>
                  <span className="num text-[11px] text-muted-foreground">
                    weight {f.weight}% · score {f.score}
                  </span>
                </div>
                <Meter
                  value={f.score}
                  tone={f.score >= 85 ? "success" : f.score >= 60 ? "warning" : "critical"}
                  className="mt-2"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">{f.note}</p>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="label-xs">Weighted recovery score</span>
              <span className="num text-sm font-semibold text-success">{score} / 100</span>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="panel-inset p-3">
            <p className="label-xs">Recovery score</p>
            <p className="num mt-1 text-4xl font-semibold text-success">
              {score}
              <span className="ml-1 text-base font-normal text-muted-foreground">/ 100</span>
            </p>
          </div>
          <div className="panel-inset px-3 py-1">
            <DataRow label="Time to recovery" value={`${path.recoveryDays} days`} />
            <DataRow label="Estimated cost" value={`₹${path.costLakh}L`} />
            <DataRow label="Capacity coverage" value={`${path.capacityCoveragePct}%`} />
            <DataRow label="Dependency risk" value={<StatusPill dot={false}>{path.risk}</StatusPill>} mono={false} />
            <DataRow label="Concentration" value={path.dependencyConcentration} mono={false} />
            <DataRow
              label="Compliance"
              value={
                <StatusPill tone={path.compliance.includes("HUMAN") ? "warning" : "info"} dot={false}>
                  {path.compliance}
                </StatusPill>
              }
              mono={false}
            />
          </div>

          <div className="panel-inset p-3">
            <p className="label-xs mb-2">Composition</p>
            <ul className="space-y-1.5">
              {path.composition.map((c) => (
                <li key={c} className="flex items-start gap-2 text-xs text-foreground/85">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-info" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {onApprove ? (
            <button
              type="button"
              onClick={onApprove}
              disabled={recoveryStatus === "APPROVED"}
              className="w-full rounded-sm border border-success/50 bg-success/15 px-3 py-2 font-mono text-[11px] tracking-[0.1em] text-success uppercase transition-colors hover:bg-success/25 disabled:opacity-50"
            >
              {recoveryStatus === "APPROVED" ? "Recovery approved" : "Approve recovery"}
            </button>
          ) : null}
          <DemoTag />
        </aside>
      </div>
    </Panel>
  );
}
