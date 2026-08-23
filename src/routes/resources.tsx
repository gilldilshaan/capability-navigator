import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Factory, Cpu, Truck, Users, Warehouse } from "lucide-react";
import { useState, type ReactNode } from "react";

import { NetworkGraph } from "@/components/parallax/NetworkGraph";
import {
  DataRow,
  DemoTag,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  factories,
  inventory,
  logisticsRoutes,
  machines,
  suppliers,
  workforce,
} from "@/lib/parallax/data";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Network — PARALLAX" },
      {
        name: "description",
        content:
          "Available suppliers, factories, machines, inventory, workforce and logistics routes that can contribute to reconstructing a lost supply-chain capability.",
      },
      { property: "og:title", content: "Resource Network — PARALLAX" },
      {
        property: "og:description",
        content: "48 enterprise resources scanned; 31 usable for capability reconstruction.",
      },
    ],
  }),
  component: Resources,
});

interface Detail {
  id: string;
  title: string;
  status: string;
  rows: { label: string; value: string }[];
  contribution: string;
}

function ResourceGroup({
  title,
  icon,
  children,
  count,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  count: number;
}) {
  return (
    <Panel>
      <PanelHeader
        title={title}
        icon={icon}
        right={<span className="num text-[11px] text-muted-foreground">{count}</span>}
      />
      <div className="divide-y divide-border/60">{children}</div>
    </Panel>
  );
}

function ResourceRow({
  id,
  name,
  meta,
  status,
  onClick,
}: {
  id: string;
  name: string;
  meta: string;
  status: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2/70"
    >
      <span className="num w-[86px] shrink-0 text-[10px] text-muted-foreground">{id}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs text-foreground">{name}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{meta}</span>
      </span>
      <StatusPill>{status}</StatusPill>
    </button>
  );
}

function Resources() {
  const [detail, setDetail] = useState<Detail | null>(null);
  const transferable = workforce.filter((w) => w.compatibility >= 70);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resource discovery"
        title="Available Resources"
        subtitle="31 of 48 enterprise resources can contribute to reconstructing CAP-THS-017."
        right={<DemoTag />}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <ResourceGroup title="Suppliers" icon={<Boxes className="size-4" />} count={suppliers.length}>
          {suppliers.map((s) => (
            <ResourceRow
              key={s.id}
              id={s.id}
              name={s.name}
              meta={`${s.region} · tier ${s.tier} · lead ${s.leadTimeDays}d`}
              status={s.status}
              onClick={() =>
                setDetail({
                  id: s.id,
                  title: s.name,
                  status: s.status,
                  contribution: `Provides ${s.capabilities.join(", ")}`,
                  rows: [
                    { label: "Location", value: s.region },
                    { label: "Tier", value: `Tier ${s.tier}` },
                    { label: "Lead time", value: `${s.leadTimeDays} days` },
                    { label: "Certifications", value: s.certifications.join(" · ") },
                    { label: "Dependencies", value: s.capabilities.join(" · ") },
                    { label: "Constraints", value: s.constraints },
                  ],
                })
              }
            />
          ))}
        </ResourceGroup>

        <div className="space-y-4">
          <ResourceGroup title="Factories" icon={<Factory className="size-4" />} count={factories.length}>
            {factories.map((f) => (
              <ResourceRow
                key={f.id}
                id={f.id}
                name={f.name}
                meta={`${f.location} · ${f.freeCapacityPct}% available capacity`}
                status={f.status}
                onClick={() =>
                  setDetail({
                    id: f.id,
                    title: f.name,
                    status: f.status,
                    contribution: `Hosts ${f.capabilities.join(", ")}`,
                    rows: [
                      { label: "Location", value: f.location },
                      { label: "Free capacity", value: `${f.freeCapacityPct}%` },
                      { label: "Lines", value: String(f.lines) },
                      { label: "Dependencies", value: f.capabilities.join(" · ") },
                      { label: "Constraints", value: f.constraints },
                    ],
                  })
                }
              />
            ))}
          </ResourceGroup>

          <ResourceGroup title="Inventory" icon={<Warehouse className="size-4" />} count={inventory.length}>
            {inventory.map((i) => (
              <ResourceRow
                key={i.id}
                id={i.id}
                name={`${i.name} — ${i.units.toLocaleString("en-IN")} ${i.uom}`}
                meta={`${i.location} · covers ${i.coversDays}d`}
                status={i.status}
                onClick={() =>
                  setDetail({
                    id: i.id,
                    title: i.name,
                    status: i.status,
                    contribution: "Feeds material and forming sub-capabilities",
                    rows: [
                      { label: "On hand", value: `${i.units.toLocaleString("en-IN")} ${i.uom}` },
                      { label: "Location", value: i.location },
                      { label: "Coverage", value: `${i.coversDays} days` },
                      { label: "Constraints", value: "Batch-traceable; GDP storage required." },
                    ],
                  })
                }
              />
            ))}
          </ResourceGroup>
        </div>

        <div className="space-y-4">
          <ResourceGroup title="Machines" icon={<Cpu className="size-4" />} count={machines.length}>
            {machines.map((m) => (
              <ResourceRow
                key={m.id}
                id={m.id}
                name={m.name}
                meta={`${m.factoryId} · ${m.utilisationPct}% utilised · ±${m.toleranceMicron}µm`}
                status={m.status}
                onClick={() =>
                  setDetail({
                    id: m.id,
                    title: m.name,
                    status: m.status,
                    contribution: `Delivers ${m.capability}`,
                    rows: [
                      { label: "Site", value: m.factoryId },
                      { label: "Utilisation", value: `${m.utilisationPct}%` },
                      { label: "Tolerance", value: `±${m.toleranceMicron} µm` },
                      { label: "Dependencies", value: m.capability },
                      { label: "Constraints", value: "Requires certified operator on shift." },
                    ],
                  })
                }
              />
            ))}
          </ResourceGroup>

          <ResourceGroup title="Logistics" icon={<Truck className="size-4" />} count={logisticsRoutes.length}>
            {logisticsRoutes.map((r) => (
              <ResourceRow
                key={r.id}
                id={r.id}
                name={`Route ${r.from} → ${r.to}`}
                meta={`${r.mode} · ${r.transitHours}h · ${r.coldChain ? "cold-chain" : "ambient"}`}
                status={r.status}
                onClick={() =>
                  setDetail({
                    id: r.id,
                    title: `Route ${r.from} → ${r.to}`,
                    status: r.status,
                    contribution: "Supports CAP-RLG-005 / CAP-CCH-003",
                    rows: [
                      { label: "Mode", value: r.mode },
                      { label: "Transit", value: `${r.transitHours} hours` },
                      { label: "Cold chain", value: r.coldChain ? "Qualified" : "Not qualified" },
                      { label: "Constraints", value: r.constraints },
                    ],
                  })
                }
              />
            ))}
          </ResourceGroup>

          <ResourceGroup title="Workforce" icon={<Users className="size-4" />} count={transferable.length}>
            <div className="px-4 py-3">
              <p className="text-xs text-foreground">
                {transferable.length} employees with transferable skills for precision packaging operation.
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Modelled by capability, not job title. Average training gap 9%.
              </p>
            </div>
          </ResourceGroup>
        </div>
      </div>

      <Panel>
        <PanelHeader
          title="Resource network graph"
          subtitle="Click any node to trace which capabilities it contributes to and what it depends on."
        />
        <div className="p-4">
          <NetworkGraph />
        </div>
      </Panel>

      <Sheet open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full border-border bg-surface sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex flex-wrap items-center gap-3 text-base text-foreground">
              {detail?.title}
              {detail ? <StatusPill>{detail.status}</StatusPill> : null}
            </SheetTitle>
          </SheetHeader>
          {detail ? (
            <div className="space-y-4 px-4 pb-6">
              <p className="num text-[11px] text-info">{detail.id}</p>
              <div className="panel-inset px-3 py-1">
                {detail.rows.map((r) => (
                  <DataRow key={r.label} label={r.label} value={r.value} mono={false} />
                ))}
              </div>
              <div className="panel-inset p-3">
                <p className="label-xs mb-1.5">Capability contribution</p>
                <p className="text-xs text-foreground/85">{detail.contribution}</p>
              </div>
              <DemoTag />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
