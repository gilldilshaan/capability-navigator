import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertOctagon, ArrowRight, CheckCircle2, GitBranch, Layers } from "lucide-react";

import {
  DataRow,
  DemoTag,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
import { activeDisruption, thermoShieldDecomposition } from "@/lib/parallax/data";
import { useParallax } from "@/lib/parallax/store";

export const Route = createFileRoute("/disruptions")({
  head: () => ({
    meta: [
      { title: "Critical Disruption INC-2048 — PARALLAX" },
      {
        name: "description",
        content:
          "Disruption command center for INC-2048: agentic sensing, capability analysis, resource discovery and reconstruction for a lost cold-chain packaging dependency.",
      },
      { property: "og:title", content: "Critical Disruption INC-2048 — PARALLAX" },
      {
        property: "og:description",
        content: "Agentic response to a tier-1 pharmaceutical supplier failure.",
      },
    ],
  }),
  component: Disruptions,
});

function Disruptions() {
  const { analysis, capabilityIdentified, runAnalysis, activeDisruptions, recoveryStatus, pathsGenerated } =
    useParallax();

  if (activeDisruptions === 0 && recoveryStatus === "APPROVED") {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Disruptions" title="No open disruptions" subtitle="Network operating normally." />
        <EmptyState
          icon={<CheckCircle2 className="size-6 text-success" />}
          title="Network operating normally."
          description="INC-2048 was closed by reconstructing the ThermoShield Packaging capability through Path C. Reset the demo to replay the scenario."
          actions={
            <Link
              to="/audit"
              className="rounded-sm border border-border-strong bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase"
            >
              View decision trail
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Incident ${activeDisruption.id}`}
        title="Critical Disruption"
        subtitle="A tier-1 supplier became unavailable. The question is not who replaces them — it is which capability was lost."
        right={
          <>
            <StatusPill tone="critical">{activeDisruption.severity}</StatusPill>
            <DemoTag />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <Panel className="px-4 py-1 xl:col-span-2">
          <DataRow label="Incident" value={activeDisruption.id} />
          <DataRow label="Detected" value={activeDisruption.detectedAt} />
          <DataRow label="Expected impact" value={`${activeDisruption.impactHours} hours`} />
          <DataRow label="Supplier" value={activeDisruption.supplier} mono={false} />
          <DataRow label="Component" value={activeDisruption.component} mono={false} />
          <DataRow label="Affected SKUs" value={String(activeDisruption.affectedSkus)} />
          <DataRow label="Exposed volume" value={activeDisruption.exposedUnits} />
        </Panel>

        <Panel className="p-4 xl:col-span-2">
          <p className="label-xs">Traditional response</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Supplier A fails → search for Supplier B → procurement → wait → production risk.
          </p>
          <div className="my-3 h-px bg-border" />
          <p className="label-xs">PARALLAX response</p>
          <p className="mt-1.5 text-xs text-foreground/85">
            Identify lost capability → decompose it → discover available resources → generate alternative
            configurations → simulate → evaluate cost, time, risk, compliance → recommend → human approval.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4">
        <div className="space-y-4">
          <Panel tone={capabilityIdentified ? "success" : undefined}>
            <PanelHeader
              title="Agentic response"
              subtitle="Five agents plus a compliance check. Nothing executes without a human decision."
              icon={<AlertOctagon className="size-4" />}
              right={
                analysis === "idle" ? (
                  <button
                    type="button"
                    onClick={runAnalysis}
                    className="rounded-sm border border-info/50 bg-info/15 px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-info uppercase transition-colors hover:bg-info/25"
                  >
                    Run analysis
                  </button>
                ) : (
                  <StatusPill tone={analysis === "running" ? "warning" : "success"}>
                    {analysis === "running" ? "Running" : "Complete"}
                  </StatusPill>
                )
              }
            />
            <div className="p-4">
              {capabilityIdentified ? (
                <div className="rise-in panel-inset mb-4 flex flex-wrap items-center gap-3 p-3">
                  <CheckCircle2 className="size-4 text-success" />
                  <span className="label-xs">Capability identified</span>
                  <span className="text-sm font-semibold text-foreground">ThermoShield Packaging Capability</span>
                  <span className="num text-[11px] text-info">CAP-THS-017</span>
                  <Link
                    to="/capability-map"
                    className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-info uppercase hover:underline"
                  >
                    Decompose <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ) : null}
              <div>
                <div className="grid gap-2 md:grid-cols-2">
                  {thermoShieldDecomposition.map((n) => (
                    <div key={n.id} className="panel-inset flex items-center gap-3 px-3 py-2">
                      <span className="num text-[10px] text-muted-foreground">{n.id}</span>
                      <span className="text-xs text-foreground">{n.label}</span>
                      <StatusPill className="ml-auto">{capabilityIdentified ? n.status : "PENDING"}</StatusPill>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  The supplier failed. The capability did not necessarily fail.
                </p>
              </div>
            </div>
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel className="flex flex-col p-4">
              <GitBranch className="size-4 text-info" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">What did we actually lose?</h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Decompose CAP-THS-017 into its seven required sub-capabilities and see which ones survived.
              </p>
              <Link
                to="/capability-map"
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-info uppercase hover:underline"
              >
                Capability map <ArrowRight className="size-3.5" />
              </Link>
            </Panel>
            <Panel className="flex flex-col p-4">
              <Layers className="size-4 text-info" />
              <h3 className="mt-3 text-sm font-semibold text-foreground">
                {pathsGenerated ? "3 recovery paths generated" : "Recovery paths"}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {pathsGenerated
                  ? "Compare direct replacement, alternate manufacturing and full capability reconstruction."
                  : "Run the analysis to generate alternative configurations."}
              </p>
              <Link
                to="/recovery-paths"
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-info uppercase hover:underline"
              >
                Recovery paths <ArrowRight className="size-3.5" />
              </Link>
            </Panel>
          </div>
        </div>

      </div>
    </div>
  );
}
