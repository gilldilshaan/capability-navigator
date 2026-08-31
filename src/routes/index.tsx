import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertOctagon,
  ArrowRight,
  GitBranch,
  Route as RouteIcon,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { NetworkGraph } from "@/components/parallax/NetworkGraph";
import { RecommendationCard } from "@/components/parallax/RecommendationCard";
import { ResilienceGauge } from "@/components/parallax/ResilienceGauge";
import { SourceBadge } from "@/components/parallax/SourceBadge";
import {
  DataRow,
  DemoTag,
  KpiCard,
  Meter,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
import { capabilityById, resilienceTrend } from "@/lib/parallax/data";
import { scorePath, useParallax } from "@/lib/parallax/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PARALLAX — Supply Chain Resilience Command Center" },
      {
        name: "description",
        content:
          "PARALLAX reconstructs lost supply-chain capabilities instead of replacing broken suppliers. Agentic recovery paths, hidden dependency discovery, human-in-the-loop approval.",
      },
      { property: "og:title", content: "PARALLAX — Same outcome. Different path." },
      {
        property: "og:description",
        content: "Agentic capability reconstruction for resilient pharmaceutical supply chains.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const {
    resilience,
    activeDisruptions,
    redundancy,
    readiness,
    recoveryStatus,
    openIncident,
    incident,
    analysis,
    runAnalysis,
    paths,
    recommendedPathId,
    pathsGenerated,
  } = useParallax();

  const affectedCapability = incident.capabilityId
    ? capabilityById[incident.capabilityId]
    : undefined;
  const recommendedPath = paths.find((p) => p.id === recommendedPathId) ?? null;
  const exposureHours = incident.impactHours ?? 72;

  /* Recommendation content — always derived from engine/store data. */
  const benefits = recommendedPath
    ? [
        ...[...recommendedPath.factors]
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
          .map((f) => `${f.label}: ${f.score}/100 — ${f.note}`),
        `${recommendedPath.capacityCoveragePct}% capacity coverage · ${recommendedPath.dependencyConcentration.replace("—", "").trim()} dependency concentration`,
      ]
    : [];

  const risks = recommendedPath
    ? [recommendedPath.compliance, `Composition: ${recommendedPath.composition.length} resources`]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Supply Chain Resilience Command Center"
        subtitle="Understand what failed. Map what matters. Recover intelligently."
        right={
          <>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
              <span className="inline-flex size-1.5 rounded-full bg-success breath" />
              System live
            </span>
            <DemoTag>Illustrative enterprise data</DemoTag>
          </>
        }
      />

      {/* HERO — the active disruption dominates the page */}
      <Panel tone={activeDisruptions ? "critical" : "success"} className="overflow-hidden">
        {activeDisruptions === 0 && recoveryStatus === "APPROVED" ? (
          <div className="flex flex-wrap items-center gap-4 p-5">
            <ShieldCheck className="size-8 text-success" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] tracking-[0.14em] text-success uppercase">
                Recovery approved
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                Network operating normally — execution handoff ready.
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                ThermoShield Packaging capability reconstructed via Path C.
              </p>
            </div>
            <Link
              to="/audit"
              className="inline-flex items-center gap-1.5 rounded-sm border border-success/50 bg-success/15 px-3 py-2 font-mono text-[11px] tracking-[0.08em] text-success uppercase"
            >
              View decision trail <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="relative grid size-9 place-items-center rounded-sm border border-critical/40 bg-critical/10">
                  <span className="pulse-ring absolute size-3 rounded-full bg-critical/50" />
                  <AlertOctagon className="size-4 text-critical" />
                </span>
                <span className="font-mono text-[11px] tracking-[0.18em] text-critical uppercase">
                  Critical disruption · {incident.id}
                </span>
                <SourceBadge
                  detail={`${incident.supplier} master record — SAP S/4HANA demo provider`}
                />
              </div>
              <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-[-0.01em] text-foreground">
                {incident.supplier ?? "Critical supplier"} unavailable
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                {incident.dependency ?? "A tier-1 dependency became unavailable."} PARALLAX treats
                this as a lost capability, not a lost supplier.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openIncident}
                  disabled={analysis === "running"}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-critical/50 bg-critical/15 px-3.5 py-2 font-mono text-[11px] tracking-[0.1em] text-critical uppercase transition-colors hover:bg-critical/25 disabled:opacity-50"
                >
                  Analyze incident <ArrowRight className="size-3.5" />
                </button>
                <Link
                  to="/capability-map"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface-2 px-3.5 py-2 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                  View network
                </Link>
              </div>
            </div>

            <div className="panel-inset border-critical/25 px-3 py-1.5">
              <DataRow label="Affected" value={affectedCapability?.name ?? "—"} mono={false} />
              <DataRow label="Capability" value={incident.capabilityId ?? "—"} />
              <DataRow
                label="Impact"
                value={incident.impact ?? `Production risk in ${exposureHours} hours`}
                mono={false}
              />
              <DataRow label="Exposure" value={incident.exposedUnits ?? "—"} />
              <DataRow
                label="Affected SKUs"
                value={incident.affectedSkus != null ? String(incident.affectedSkus) : "—"}
              />
              <DataRow
                label="Status"
                value={
                  <StatusPill dot={false}>
                    {affectedCapability?.status ?? incident.severity}
                  </StatusPill>
                }
                mono={false}
              />
            </div>
          </div>
        )}
      </Panel>

      {/* Metrics — each with its own mini-visual */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Network resilience"
          value={String(resilience)}
          suffix="/ 100"
          note={resilience > 87 ? "+6.9% after approved recovery" : "+6.4% this month"}
          tone={resilience >= 85 ? "success" : "warning"}
          visual={
            <ResilienceGauge
              value={resilience}
              size={56}
              tone={resilience >= 85 ? "success" : "warning"}
            />
          }
        />
        <KpiCard
          label="Active disruptions"
          value={String(activeDisruptions).padStart(2, "0")}
          note={activeDisruptions ? "1 critical · INC-2048" : "No open incidents"}
          tone={activeDisruptions ? "critical" : "success"}
          visual={
            activeDisruptions ? (
              <span className="relative grid size-9 place-items-center rounded-sm border border-critical/40 bg-critical/10">
                <span className="pulse-ring absolute size-3 rounded-full bg-critical/50" />
                <AlertOctagon className="size-4 text-critical" />
              </span>
            ) : (
              <span className="grid size-9 place-items-center rounded-sm border border-success/40 bg-success/10">
                <ShieldCheck className="size-4 text-success" />
              </span>
            )
          }
        />
        <KpiCard
          label="Capability redundancy"
          value={`${redundancy.toFixed(1)}x`}
          note="2 capabilities exposed below target"
          tone="warning"
          visual={
            <div className="w-16">
              <p className="num mb-1 text-right text-[10px] text-muted-foreground">vs 3x target</p>
              <Meter value={(redundancy / 4.4) * 100} tone="warning" />
            </div>
          }
        />
        <KpiCard
          label="Recovery readiness"
          value={`${readiness}%`}
          note="+8.2% after latest simulation"
          tone="info"
          visual={<ResilienceGauge value={readiness} size={56} tone="info" label="%" />}
        />
      </div>

      {/* Capability graph workspace + AI recommendation */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Live capability network"
            subtitle="Suppliers, materials, factories, machines, workforce and routes feeding the affected capability. Click a node to trace dependencies."
            right={
              <StatusPill tone={activeDisruptions ? "critical" : "success"}>
                {activeDisruptions ? "Impact active" : "Baseline"}
              </StatusPill>
            }
          />
          <div className="p-4">
            <NetworkGraph height={430} />
          </div>
        </Panel>

        <RecommendationCard
          title={
            pathsGenerated && recommendedPath
              ? `Path ${recommendedPath.id} — ${recommendedPath.title}`
              : "Capability Reconstruction"
          }
          confidence={pathsGenerated && recommendedPath ? scorePath(recommendedPath) : undefined}
          reasoning={
            pathsGenerated && recommendedPath
              ? recommendedPath.rationale
              : "Run the disruption analysis: agents decompose the lost capability, discover enterprise resources and score every viable recovery configuration."
          }
          benefits={benefits}
          risks={risks}
          requiresHumanApproval
          action={
            pathsGenerated
              ? { label: "Explore recovery", to: "/recovery-paths" }
              : { label: "Run capability analysis", onClick: runAnalysis }
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Resilience trend"
            subtitle="Composite score across capability redundancy, recovery speed and dependency concentration"
            icon={<TrendingUp className="size-4" />}
          />
          <div className="h-[196px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resilienceTrend} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--color-border)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[60, 100]}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border-strong)",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--color-muted-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-info)"
                  strokeWidth={1.8}
                  fill="url(#resGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Traditional resilience asks:{" "}
              <span className="text-foreground">do we have a backup supplier?</span>
              <br />
              PARALLAX asks:{" "}
              <span className="text-foreground">
                how many different ways can we achieve the same outcome?
              </span>
            </p>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Next steps" subtitle="The capability-first recovery journey" />
          <div className="divide-y divide-border">
            {[
              {
                to: "/capability-map" as const,
                icon: <GitBranch className="size-4 text-info" />,
                title: "Decompose the lost capability",
                body: "See which sub-capabilities survived the disruption.",
              },
              {
                to: "/resources" as const,
                icon: <RouteIcon className="size-4 text-info" />,
                title: "Discover enterprise resources",
                body: "SAP-sourced suppliers, plants, machines and skills.",
              },
              {
                to: "/break-my-supply-chain" as const,
                icon: <Zap className="size-4 text-warning" />,
                title: "Break My Supply Chain",
                body: "Stress-test the network and expose hidden dependencies.",
              },
            ].map((card) => (
              <Link
                key={card.to}
                to={card.to}
                className="group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2/70"
              >
                <span className="mt-0.5">{card.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-foreground">
                    {card.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{card.body}</span>
                </span>
                <ArrowRight className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            ))}
          </div>
          <div className="border-t border-border px-4 py-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mr-1 inline size-3.5 text-info" />
              Nothing executes autonomously — every recovery decision ends with a human approval.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
