import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Shield, Zap } from "lucide-react";

import { NetworkGraph } from "@/components/parallax/NetworkGraph";
import {
  DataRow,
  DemoTag,
  Meter,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
import { failureToggles } from "@/lib/parallax/data";
import { useParallax } from "@/lib/parallax/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/break-my-supply-chain")({
  head: () => ({
    meta: [
      { title: "Break My Supply Chain — PARALLAX" },
      {
        name: "description",
        content:
          "Stress-test your network before reality does. Remove suppliers, factories, machines, routes and skills to expose hidden shared dependencies.",
      },
      { property: "og:title", content: "Break My Supply Chain — PARALLAX" },
      {
        property: "og:description",
        content: "5 suppliers does not mean 5 independent recovery paths.",
      },
    ],
  }),
  component: BreakMySupplyChain,
});

function BreakMySupplyChain() {
  const {
    chaosToggles,
    toggleChaos,
    runChaos,
    clearChaos,
    chaosRunning,
    chaosProgress,
    pipelineStage,
    chaosResult,
    vulnerabilities,
    resiliencePlans,
    addResiliencePlan,
  } = useParallax();

  const removed = chaosResult?.removed ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Chaos engineering for supply networks"
        title="Break My Supply Chain"
        subtitle="Stress-test your network before reality does."
        right={<DemoTag>Simulation</DemoTag>}
      />

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Failure injection"
            icon={<Zap className="size-4" />}
            right={
              <button
                type="button"
                onClick={clearChaos}
                className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase hover:text-foreground"
              >
                Clear
              </button>
            }
          />
          <div className="space-y-1.5 p-3">
            {failureToggles.map((f) => {
              const on = chaosToggles.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleChaos(f.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-sm border px-3 py-2.5 text-left transition-colors",
                    on
                      ? "border-critical/50 bg-critical/10"
                      : "border-border bg-surface hover:border-border-strong",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-[2px] border",
                      on ? "border-critical bg-critical/30" : "border-border-strong",
                    )}
                  >
                    {on ? <span className="size-1.5 bg-critical" /> : null}
                  </span>
                  <span>
                    <span className={cn("block text-xs", on ? "text-critical" : "text-foreground")}>
                      {f.label}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">{f.detail}</span>
                  </span>
                  <span className="num ml-auto text-[10px] text-muted-foreground">
                    −{f.resilienceHit}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={runChaos}
              disabled={chaosRunning || chaosToggles.length === 0}
              className="w-full rounded-sm border border-critical/55 bg-critical/18 px-3 py-2.5 font-mono text-[11px] tracking-[0.14em] text-critical uppercase transition-colors hover:bg-critical/28 disabled:opacity-45"
            >
              {chaosRunning ? "Simulating…" : "Run chaos simulation"}
            </button>
            {chaosRunning ? <Meter value={chaosProgress} tone="critical" className="mt-3" /> : null}
            {chaosToggles.length === 0 && !chaosRunning ? (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Select at least one failure to inject.
              </p>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Network under stress"
            subtitle="Suppliers · factories · machines · routes · workforce · capabilities"
            right={
              chaosRunning ? (
                <StatusPill tone="warning">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex size-1.5 rounded-full bg-current breath" />
                    {pipelineStage || "Simulating"}
                  </span>
                </StatusPill>
              ) : chaosResult ? (
                <StatusPill tone="critical">{chaosResult.removed.length} nodes lost</StatusPill>
              ) : (
                <StatusPill tone="success">Baseline</StatusPill>
              )
            }
          />
          <div className="p-4">
            <NetworkGraph removed={removed} />
          </div>
        </Panel>
      </div>

      {chaosResult ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="p-4">
              <p className="label-xs">Network resilience</p>
              <div className="mt-3 flex items-end gap-5">
                <div>
                  <p className="label-xs">Before</p>
                  <p className="num text-4xl font-semibold text-success">
                    {chaosResult.resilienceBefore}
                  </p>
                </div>
                <span className="num pb-2 text-muted-foreground">→</span>
                <div>
                  <p className="label-xs">After</p>
                  <p className="num text-4xl font-semibold text-critical">
                    {chaosResult.resilienceAfter}
                  </p>
                </div>
              </div>
              <Meter value={chaosResult.resilienceAfter} tone="critical" className="mt-4" />
              <p className="mt-2 text-xs text-muted-foreground">
                Drop of {chaosResult.resilienceBefore - chaosResult.resilienceAfter} points from the
                injected failures.
              </p>
            </Panel>

            <Panel tone="critical" className="p-4 lg:col-span-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-critical" />
                <p className="label-xs">Critical vulnerability discovered</p>
              </div>
              <p className="mt-3 text-2xl leading-snug font-semibold text-critical">
                5 suppliers ≠ 5 independent recovery paths.
              </p>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                MedCore, BioPack, NorthStar, Aegis and Helix appear independent in the supplier
                master. All five depend on the same capability:{" "}
                <span className="text-foreground">Precision Polymer Certification</span>{" "}
                (CAP-PPC-004), issued by a single accredited lab.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="panel-inset px-3 py-1">
                  <DataRow
                    label="Supplier redundancy"
                    value={`${chaosResult.supplierRedundancy}x`}
                  />
                  <DataRow
                    label="Capability redundancy"
                    value={`${chaosResult.capabilityRedundancy}x`}
                  />
                </div>
                <div className="panel-inset px-3 py-1">
                  <DataRow label="Nodes removed" value={chaosResult.removed.join(", ")} />
                  <DataRow
                    label="Failures injected"
                    value={String(chaosResult.failureIds.length)}
                  />
                </div>
              </div>
            </Panel>
          </div>

          <Panel>
            <PanelHeader
              title={`${vulnerabilities.length} critical dependencies found`}
              subtitle="Hidden dependencies shared across resources that look independent"
              icon={<Shield className="size-4" />}
            />
            <div className="divide-y divide-border">
              {vulnerabilities.map((d, i) => {
                const planned = resiliencePlans.includes(d.id);
                return (
                  <div key={d.id} className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="num text-[11px] text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-sm font-semibold text-foreground">{d.name}</h3>
                        <span className="num text-[11px] text-info">{d.id}</span>
                        <StatusPill tone="critical">Redundancy {d.redundancy}x</StatusPill>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="label-xs mb-1">Impact</p>
                          <p className="text-xs text-foreground/85">{d.impact}</p>
                        </div>
                        <div>
                          <p className="label-xs mb-1">Recovery alternatives</p>
                          <p className="text-xs text-foreground/85">{d.alternatives}</p>
                        </div>
                      </div>
                      <p className="label-xs mt-3 mb-1">Shared by</p>
                      <p className="text-xs text-muted-foreground">{d.sharedBy.join(" · ")}</p>
                    </div>
                    <div className="panel-inset flex flex-col p-3">
                      <p className="label-xs">Recommended mitigation</p>
                      <p className="mt-1.5 text-xs text-foreground/85">{d.mitigation}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <span className="label-xs">Redundancy vs target</span>
                          <span className="num text-[11px] text-muted-foreground">
                            {d.redundancy} / {d.target}
                          </span>
                        </div>
                        <Meter
                          value={(d.redundancy / d.target) * 100}
                          tone="critical"
                          className="mt-1.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => addResiliencePlan(d.id)}
                        disabled={planned}
                        className={cn(
                          "mt-4 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors",
                          planned
                            ? "border-success/50 bg-success/15 text-success"
                            : "border-border-strong bg-surface-2 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {planned ? "Plan queued" : "Add resilience plan"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </>
      ) : (
        <Panel className="p-6">
          <p className="text-sm text-foreground">Select failures and run the simulation.</p>
          <p className="mt-1.5 max-w-2xl text-xs text-muted-foreground">
            The chaos simulator removes resources from the network, recomputes the resilience score
            and reports which capabilities can still be reconstructed — and which shared
            dependencies quietly connect resources that look independent.
          </p>
        </Panel>
      )}
    </div>
  );
}
