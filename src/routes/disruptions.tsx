import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertOctagon, ArrowRight, CheckCircle2, GitBranch, Layers } from "lucide-react";

import {
  AgentOrchestrationPipeline,
  type ApprovalStage,
} from "@/components/parallax/AgentOrchestrationPipeline";
import { ParallaxFlow, TraditionalFlow } from "@/components/parallax/FlowDiagram";
import {
  DataRow,
  DemoTag,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
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
  const {
    analysis,
    pipelineStage,
    analysisProgress,
    agents,
    capabilityIdentified,
    runAnalysis,
    activeDisruptions,
    recoveryStatus,
    pathsGenerated,
    incident,
    decomposition,
  } = useParallax();

  const approval: ApprovalStage =
    recoveryStatus === "AWAITING APPROVAL" || recoveryStatus === "ALTERNATIVE REQUESTED"
      ? "WAITING"
      : recoveryStatus === "APPROVED"
        ? "APPROVED"
        : recoveryStatus === "REJECTED"
          ? "DECLINED"
          : "HIDDEN";

  if (activeDisruptions === 0 && recoveryStatus === "APPROVED") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Disruptions"
          title="No open disruptions"
          subtitle="Network operating normally."
        />
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
        eyebrow={`Incident ${incident.id}`}
        title="Critical Disruption"
        subtitle="A tier-1 supplier became unavailable. The question is not who replaces them — it is which capability was lost."
        right={
          <>
            {analysis === "running" ? (
              <StatusPill tone="warning">{pipelineStage || "Running"}</StatusPill>
            ) : (
              <button
                type="button"
                onClick={runAnalysis}
                className="rounded-sm border border-ai/50 bg-ai/12 px-3 py-1.5 font-mono text-[11px] tracking-[0.1em] text-ai uppercase transition-colors hover:bg-ai/22"
              >
                {analysis === "complete"
                  ? "Re-run analysis"
                  : analysis === "error"
                    ? "Retry analysis"
                    : "Run analysis"}
              </button>
            )}
            <StatusPill tone="critical">{incident.severity}</StatusPill>
            <DemoTag />
          </>
        }
      />

      {/* Incident summary + the response-doctrine comparison */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <Panel tone="critical">
          <PanelHeader
            title="Incident summary"
            subtitle={`${incident.id} · detected ${incident.detectedAt ?? "—"}`}
            icon={<AlertOctagon className="size-4" />}
          />
          <div className="px-4 py-1">
            <DataRow label="Supplier" value={incident.supplier ?? "—"} mono={false} />
            <DataRow label="Component" value={incident.component ?? "—"} mono={false} />
            <DataRow label="Dependency" value={incident.dependency ?? "—"} mono={false} />
            <DataRow label="Capability" value={incident.capabilityId ?? "—"} />
            <DataRow
              label="Expected impact"
              value={incident.impactHours ? `${incident.impactHours} hours` : "—"}
            />
            <DataRow
              label="Affected SKUs"
              value={incident.affectedSkus != null ? String(incident.affectedSkus) : "—"}
            />
            <DataRow label="Exposed volume" value={incident.exposedUnits ?? "—"} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Two ways to respond"
            subtitle="Replace the broken link — or reconstruct the capability it was serving"
          />
          <div className="grid gap-5 p-4 md:grid-cols-2">
            <div>
              <p className="label-xs mb-2 flex items-center gap-2 text-muted-foreground">
                Traditional response
                <span className="h-px flex-1 bg-border" />
              </p>
              <TraditionalFlow
                steps={[
                  "Supplier failure",
                  "Search for Supplier B",
                  "Procurement cycle",
                  "Wait for qualification",
                  "Production risk",
                ]}
              />
            </div>
            <div>
              <p className="label-xs mb-2 flex items-center gap-2 text-ai">
                Parallax response
                <span className="h-px flex-1 bg-ai/30" />
              </p>
              <ParallaxFlow
                root="Capability analysis"
                branches={[
                  "Dependency graph",
                  "Resource discovery",
                  "Scenario simulation",
                  "Compliance check",
                ]}
                outcome="Recovery recommendation → human approval"
              />
            </div>
          </div>
        </Panel>
      </div>

      {/* Agentic response + affected capabilities */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel tone={capabilityIdentified ? "success" : undefined}>
          <PanelHeader
            title="Agentic response"
            subtitle="Six coordinated agents. Nothing executes without a human decision."
            icon={<AlertOctagon className="size-4" />}
            right={
              analysis === "running" ? (
                <span className="num text-[11px] text-ai">{analysisProgress}%</span>
              ) : capabilityIdentified ? (
                <StatusPill tone="success">Complete</StatusPill>
              ) : (
                <StatusPill tone="info">Standby</StatusPill>
              )
            }
          />
          <div className="space-y-3 p-4">
            {capabilityIdentified ? (
              <div className="rise-in panel-inset mb-1 flex flex-wrap items-center gap-3 border-success/40 p-3">
                <CheckCircle2 className="size-4 text-success" />
                <span className="label-xs">Capability identified</span>
                <span className="text-sm font-semibold text-foreground">
                  ThermoShield Packaging Capability
                </span>
                <span className="num text-[11px] text-info">{incident.capabilityId}</span>
                <Link
                  to="/capability-map"
                  className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-info uppercase hover:underline"
                >
                  Decompose <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : null}
            <AgentOrchestrationPipeline stages={agents} approval={approval} />
            {analysis === "running" ? (
              <div className="panel-inset px-3 py-2">
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
            ) : null}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Affected capabilities"
            subtitle="The supplier failed. The capability did not necessarily fail."
            icon={<GitBranch className="size-4" />}
          />
          <div className="space-y-1.5 p-3">
            {decomposition.map((n) => (
              <div key={n.id} className="panel-inset flex items-center gap-3 px-3 py-2">
                <span className="num text-[10px] text-muted-foreground">{n.id}</span>
                <span className="text-xs text-foreground">{n.label}</span>
                <StatusPill className="ml-auto">
                  {capabilityIdentified ? n.status : "PENDING"}
                </StatusPill>
              </div>
            ))}
          </div>
          <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            The supplier failed. The capability did not necessarily fail.
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="flex flex-col p-4">
          <GitBranch className="size-4 text-info" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">What did we actually lose?</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Decompose {incident.capabilityId} into its seven required sub-capabilities and see which
            ones survived.
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
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
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
  );
}
