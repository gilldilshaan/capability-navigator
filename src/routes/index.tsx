import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertOctagon, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import {
  DataRow,
  DemoTag,
  KpiCard,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
import { resilienceTrend } from "@/lib/parallax/data";
import { useParallax } from "@/lib/parallax/store";

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
    presentation,
    incident,
  } = useParallax();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Supply Chain Resilience Command Center"
        subtitle="Understand what failed. Reconstruct what matters."
        right={<DemoTag>Illustrative enterprise data</DemoTag>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Network resilience"
          value={String(resilience)}
          suffix="/ 100"
          note={resilience > 87 ? "+6.9% after approved recovery" : "+6.4% this month"}
          tone={resilience >= 85 ? "success" : "warning"}
          large={presentation}
        />
        <KpiCard
          label="Active disruptions"
          value={String(activeDisruptions).padStart(2, "0")}
          note={activeDisruptions ? "1 critical · INC-2048" : "No open incidents"}
          tone={activeDisruptions ? "critical" : "success"}
          large={presentation}
        />
        <KpiCard
          label="Capability redundancy"
          value={`${redundancy.toFixed(1)}x`}
          note="2 capabilities exposed below target"
          tone="warning"
          large={presentation}
        />
        <KpiCard
          label="Recovery readiness"
          value={`${readiness}%`}
          note="+8.2% after latest simulation"
          tone="info"
          large={presentation}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel tone={activeDisruptions ? "critical" : "success"}>
          <PanelHeader
            title="Active incident"
            subtitle={
              activeDisruptions
                ? "Human-in-the-loop response required"
                : "Network operating normally"
            }
            icon={<AlertOctagon className="size-4" />}
            right={
              <StatusPill tone={recoveryStatus === "APPROVED" ? "success" : "critical"}>
                {recoveryStatus === "APPROVED" ? "Recovery approved" : incident.severity}
              </StatusPill>
            }
          />
          {activeDisruptions === 0 && recoveryStatus === "APPROVED" ? (
            <div className="p-4">
              <p className="text-sm text-foreground">
                Recovery plan approved — execution handoff ready.
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                ThermoShield Packaging capability reconstructed via Path C. Network operating
                normally.
              </p>
              <Link
                to="/audit"
                className="mt-4 inline-flex items-center gap-1.5 rounded-sm border border-success/50 bg-success/15 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-success uppercase"
              >
                View decision trail <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 p-4 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{incident.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  A tier-1 dependency became unavailable. PARALLAX treats this as a lost capability,
                  not a lost supplier.
                </p>
                <button
                  type="button"
                  onClick={openIncident}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-sm border border-critical/50 bg-critical/15 px-3 py-2 font-mono text-[11px] tracking-[0.1em] text-critical uppercase transition-colors hover:bg-critical/25"
                >
                  Open incident <ArrowRight className="size-3.5" />
                </button>
              </div>
              <div className="panel-inset px-3 py-1">
                <DataRow label="Incident" value={incident.id} />
                <DataRow label="Supplier" value={incident.supplier ?? "—"} mono={false} />
                <DataRow label="Dependency" value={incident.dependency ?? "—"} mono={false} />
                <DataRow label="Component" value={incident.component ?? "—"} mono={false} />
                <DataRow label="Detected" value={incident.detectedAt ?? "—"} />
                <DataRow label="Impact" value={incident.impact ?? "—"} mono={false} />
              </div>
            </div>
          )}
        </Panel>

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
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Capability decomposition",
            body: "Supplier dependencies are broken into the underlying capabilities required to achieve the outcome.",
            to: "/capability-map" as const,
            cta: "Open capability map",
          },
          {
            title: "Agentic recovery",
            body: "Five agents sense, decompose, discover, reconstruct and simulate — a manager approves.",
            to: "/recovery-paths" as const,
            cta: "Compare recovery paths",
          },
          {
            title: "Break My Supply Chain",
            body: "Stress-test the network before reality does, and surface hidden shared dependencies.",
            to: "/break-my-supply-chain" as const,
            cta: "Run chaos simulation",
          },
        ].map((card) => (
          <Panel key={card.title} className="flex flex-col p-4">
            <ShieldCheck className="size-4 text-info" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">{card.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{card.body}</p>
            <Link
              to={card.to}
              className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-info uppercase hover:underline"
            >
              {card.cta} <ArrowRight className="size-3.5" />
            </Link>
          </Panel>
        ))}
      </div>
    </div>
  );
}
