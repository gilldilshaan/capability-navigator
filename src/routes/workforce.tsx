import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Users } from "lucide-react";
import { useState } from "react";

import {
  DemoTag,
  Meter,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
import { workforce } from "@/lib/parallax/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workforce")({
  head: () => ({
    meta: [
      { title: "Transferable Capability — PARALLAX Workforce" },
      {
        name: "description",
        content:
          "PARALLAX models workforce by capability rather than job title, matching internal skill profiles to the precision packaging operation required for capability reconstruction.",
      },
      { property: "og:title", content: "Transferable Capability — PARALLAX Workforce" },
      {
        property: "og:description",
        content:
          "Workforce treated as a supply-chain resilience resource, not a recruitment pipeline.",
      },
    ],
  }),
  component: Workforce,
});

const skills = [
  { key: "machineOperation" as const, label: "Machine operation" },
  { key: "qualityInspection" as const, label: "Quality inspection" },
  { key: "precisionForming" as const, label: "Precision forming" },
  { key: "coldChain" as const, label: "Cold-chain handling" },
];

function Workforce() {
  const ranked = [...workforce].sort((a, b) => b.compatibility - a.compatibility);
  const deployable = ranked.filter((w) => w.compatibility >= 70);
  /* Progressive disclosure: strongest candidates first, rest on demand. */
  const [showAll, setShowAll] = useState(false);
  const VISIBLE = 6;
  const visible = showAll ? ranked : ranked.slice(0, VISIBLE);
  const hiddenCount = ranked.length - VISIBLE;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workforce intelligence"
        title="Transferable Capability"
        subtitle="PARALLAX models workforce by capability rather than job title. Fictional employee IDs only — no personal data."
        right={<DemoTag>Illustrative enterprise data</DemoTag>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-4">
          <p className="label-xs">Required capability</p>
          <p className="mt-2 text-base font-semibold text-foreground">
            Precision Packaging Operation
          </p>
          <p className="num mt-1 text-[11px] text-info">CAP-WPK-007</p>
          <div className="mt-4 space-y-1.5">
            <p className="label-xs">Required skills</p>
            {["Precision forming", "Quality inspection", "Machine operation"].map((s) => (
              <p key={s} className="flex items-center gap-2 text-xs text-foreground/85">
                <span className="size-1 rounded-full bg-info" />
                {s}
              </p>
            ))}
          </div>
        </Panel>
        <Panel className="p-4">
          <p className="label-xs">Deployable pool</p>
          <p className="num mt-2 text-4xl font-semibold text-success">{deployable.length}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            of {workforce.length} modelled capability records meet the 70% compatibility floor.
          </p>
          <Meter
            value={(deployable.length / workforce.length) * 100}
            tone="success"
            className="mt-4"
          />
        </Panel>
        <Panel className="p-4">
          <p className="label-xs">Average training gap</p>
          <p className="num mt-2 text-4xl font-semibold text-warning">9%</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Closable in 12–18 hours of targeted training per operator, inside the 72-hour impact
            horizon.
          </p>
          <Meter value={91} tone="warning" className="mt-4" />
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Capability match — internal candidates"
          subtitle="Skill compatibility against the precision packaging operation profile"
          icon={<Users className="size-4" />}
        />
        <div className="divide-y divide-border">
          {visible.map((w) => (
            <div key={w.id} className="grid gap-4 p-4 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="num text-sm font-semibold text-foreground">{w.id}</span>
                  <StatusPill
                    tone={
                      w.compatibility >= 80
                        ? "success"
                        : w.compatibility >= 70
                          ? "warning"
                          : "critical"
                    }
                    dot={false}
                  >
                    {w.compatibility}% match
                  </StatusPill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {w.role} · {w.site}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {skills.map((s) => (
                  <div key={s.key}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{s.label}</span>
                      <span className="num text-[11px] text-foreground">{w[s.key]}%</span>
                    </div>
                    <Meter
                      value={w[s.key]}
                      tone={w[s.key] >= 80 ? "success" : w[s.key] >= 60 ? "info" : "warning"}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>

              <div className="panel-inset px-3 py-2">
                <div className="flex items-baseline justify-between">
                  <span className="label-xs">Training gap</span>
                  <span className="num text-xs text-warning">
                    {Math.max(0, 100 - w.compatibility - 4)}%
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="label-xs">Estimated training</span>
                  <span className="num text-xs text-foreground">{w.trainingHours} hours</span>
                </div>
                <p
                  className={cn(
                    "mt-2 text-[11px]",
                    w.recommendation.startsWith("Not") ? "text-critical" : "text-foreground/85",
                  )}
                >
                  {w.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Workforce is treated as a supply-chain resilience resource: a skill profile that can
          contribute to a lost capability, not a job requisition.
        </p>
        {!showAll && hiddenCount > 0 ? (
          <div className="border-t border-border p-3 text-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface-2 px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Show {hiddenCount} more candidates <ChevronDown className="size-3.5" />
            </button>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
