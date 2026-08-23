import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GitBranch, Info } from "lucide-react";

import { NetworkGraph } from "@/components/parallax/NetworkGraph";
import {
  DemoTag,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
  toneFor,
} from "@/components/parallax/primitives";
import { capabilities, thermoShieldDecomposition } from "@/lib/parallax/data";
import { useParallax } from "@/lib/parallax/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/capability-map")({
  head: () => ({
    meta: [
      { title: "Capability Map — PARALLAX" },
      {
        name: "description",
        content:
          "Decompose supplier dependencies into the capabilities required to achieve the outcome, and trace upstream and downstream dependencies across the capability network.",
      },
      { property: "og:title", content: "Capability Map — PARALLAX" },
      {
        property: "og:description",
        content: "What did we actually lose? Capability decomposition for CAP-THS-017.",
      },
    ],
  }),
  component: CapabilityMap;
});

function CapabilityMap() {
  const { capabilityIdentified } = useParallax();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Capability map"
        title="What did we actually lose?"
        subtitle="PARALLAX decomposes supplier dependencies into the underlying capabilities required to achieve the outcome."
        right={<DemoTag />}
      />

      <Panel>
        <PanelHeader
          title="Capability decomposition · CAP-THS-017"
          subtitle="ThermoShield Packaging Capability — 7 required sub-capabilities"
          icon={<GitBranch className="size-4" />}
          right={<StatusPill tone={capabilityIdentified ? "success" : "warning"}>{capabilityIdentified ? "Identified" : "Inferred"}</StatusPill>}
        />
        <div className="grid gap-5 p-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="panel-inset flex flex-col justify-center gap-3 p-4">
            <p className="label-xs">Central capability</p>
            <p className="text-lg leading-snug font-semibold text-foreground">
              ThermoShield Packaging Capability
            </p>
            <span className="num text-[11px] text-info">CAP-THS-017</span>
            <div className="h-px bg-border" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              The supplier failed. The capability did not necessarily fail. Six of seven sub-capabilities remain
              reachable inside the existing network.
            </p>
            <span className="num text-[11px] text-warning">Redundancy 1x · target 3x</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {thermoShieldDecomposition.map((n, i) => (
              <div
                key={n.id}
                className={cn(
                  "rise-in panel-inset relative p-3",
                  toneFor(n.status) === "critical" && "border-critical/40",
                  toneFor(n.status) === "warning" && "border-warning/40",
                )}
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-medium text-foreground">{n.label}</p>
                  <StatusPill>{n.status}</StatusPill>
                </div>
                <p className="num mt-2 text-[10px] text-muted-foreground">{n.id}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">{n.provider}</p>
                <p className="num mt-2 text-[10px] text-muted-foreground">
                  {n.dependencies} downstream dependenc{n.dependencies === 1 ? "y" : "ies"}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3">
          <Info className="size-4 text-info" />
          <p className="text-xs text-muted-foreground">
            A capability is reconstructable when every required sub-capability can be sourced from some combination of
            available resources — not necessarily from one supplier.
          </p>
          <Link
            to="/resources"
            className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-info uppercase hover:underline"
          >
            Discover resources <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Capability network"
          subtitle="Suppliers, materials, factories, machines, workforce, routes and capabilities in one dependency graph."
        />
        <div className="p-4">
          <NetworkGraph />
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Capability register" subtitle="10 modelled capabilities with redundancy against target" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-border">
                {["Capability ID", "Name", "Owner", "Requires", "Redundancy", "Target", "Status"].map((h) => (
                  <th key={h} className="label-xs px-4 py-2.5 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {capabilities.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-surface-2/60">
                  <td className="num px-4 py-2.5 text-xs text-info">{c.id}</td>
                  <td className="px-4 py-2.5 text-xs text-foreground">{c.name}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{c.owner}</td>
                  <td className="num px-4 py-2.5 text-xs text-muted-foreground">{c.requirements.length}</td>
                  <td
                    className={cn(
                      "num px-4 py-2.5 text-xs",
                      c.redundancy < c.targetRedundancy ? "text-critical" : "text-success",
                    )}
                  >
                    {c.redundancy}x
                  </td>
                  <td className="num px-4 py-2.5 text-xs text-muted-foreground">{c.targetRedundancy}x</td>
                  <td className="px-4 py-2.5">
                    <StatusPill>{c.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
