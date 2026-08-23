import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Server } from "lucide-react";

import { DemoTag, PageHeader, Panel, PanelHeader } from "@/components/parallax/primitives";
import { sapLayers } from "@/lib/parallax/data";

export const Route = createFileRoute("/integration")({
  head: () => ({
    meta: [
      { title: "Prototype Integration Architecture — PARALLAX" },
      {
        name: "description",
        content:
          "How PARALLAX would map onto SAP S/4HANA, HANA Cloud, BTP, Generative AI Hub and Build. Prototype architecture only — no live integration.",
      },
      { property: "og:title", content: "Prototype Integration Architecture — PARALLAX" },
      {
        property: "og:description",
        content: "Prototype mapping of capability reconstruction onto enterprise platform layers.",
      },
    ],
  }),
  component: Integration;
});

function Integration() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integration"
        title="Prototype integration architecture"
        subtitle="This demo runs entirely on illustrative local data. Nothing below is live — it shows where each layer would sit."
        right={<DemoTag>Prototype integration architecture</DemoTag>}
      />

      <Panel>
        <PanelHeader
          title="Platform mapping"
          subtitle="Not connected — no SAP credentials, no external APIs, no real-time enterprise data in this demo."
          icon={<Server className="size-4" />}
        />
        <div className="mx-auto max-w-2xl p-6">
          {sapLayers.map((l, i) => (
            <div key={l.id}>
              <div className="panel-inset flex flex-wrap items-center gap-3 p-4">
                <span className="num w-6 text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-[180px]">
                  <p className="text-sm font-semibold text-foreground">{l.name}</p>
                  <p className="text-xs text-info">{l.role}</p>
                </div>
                <p className="flex-1 text-xs text-muted-foreground">{l.detail}</p>
                <span className="rounded-sm border border-border-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
                  Not connected
                </span>
              </div>
              {i < sapLayers.length - 1 ? (
                <div className="flex h-6 items-center justify-center">
                  <ArrowDown className="size-4 text-border-strong" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <p className="label-xs">What this demo is</p>
          <ul className="mt-3 space-y-2 text-xs text-foreground/85">
            {[
              "A deterministic simulation of agentic capability reconstruction.",
              "Fictional suppliers, plants, machines, routes and employee IDs.",
              "A transparent weighted scoring model, shown factor by factor.",
              "Human-in-the-loop by construction: no autonomous execution.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-info" />
                {t}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="p-5">
          <p className="label-xs">What this demo is not</p>
          <ul className="mt-3 space-y-2 text-xs text-foreground/85">
            {[
              "Not connected to real-time enterprise or SAP data.",
              "Not powered by a live language model in this build.",
              "Not a claim of measured real-world cost or time savings.",
              "Not a supplier-risk monitoring or inventory management tool.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-warning" />
                {t}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="relative overflow-hidden p-10 text-center">
        <p className="font-mono text-[13px] tracking-[0.4em] text-info uppercase">Parallax</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.01em] text-foreground sm:text-4xl">
          Same outcome. Different path.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
          Don&apos;t replace the broken link. Reconstruct the capability.
        </p>
      </Panel>
    </div>
  );
}
