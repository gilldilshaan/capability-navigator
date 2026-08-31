import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Cpu, Factory, Search, Truck, Users, Warehouse } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { NetworkGraph } from "@/components/parallax/NetworkGraph";
import { SourceBadge } from "@/components/parallax/SourceBadge";
import {
  DataRow,
  DemoTag,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
<<<<<<< HEAD
=======
import {
  factories as fallbackFactories,
  inventory as fallbackInventory,
  logisticsRoutes,
  machines as fallbackMachines,
  suppliers as fallbackSuppliers,
  workforce as fallbackWorkforce,
} from "@/lib/parallax/data";
>>>>>>> integration-suvreen
import { useParallax } from "@/lib/parallax/store";
import { useSapResources } from "@/integrations/sap/useSapResources";
import type { ResourceKind } from "@/types/parallax";
import { cn } from "@/lib/utils";

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
  kind: ResourceKind;
  title: string;
  status: string;
  rows: { label: string; value: string }[];
  contribution: string;
}

type TypeFilter = "all" | "supplier" | "factory" | "machine" | "inventory" | "route";

const typeFilters: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "supplier", label: "Suppliers" },
  { id: "factory", label: "Plants" },
  { id: "machine", label: "Machines" },
  { id: "inventory", label: "Inventory" },
  { id: "route", label: "Logistics" },
];

function ResourceGroup({
  title,
  icon,
  children,
  count,
  note,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  count: number;
  note?: string;
}) {
  return (
    <Panel>
      <PanelHeader
        title={title}
        icon={icon}
        right={
          <span className="inline-flex items-center gap-2">
            {note ? <span className="text-[10px] text-muted-foreground">{note}</span> : null}
            <span className="num text-[11px] text-muted-foreground">{count}</span>
          </span>
        }
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
<<<<<<< HEAD
  const { injectDisruption, analysis, suppliers, factories, machines, inventory, workforce, logisticsRoutes } =
    useParallax();
=======
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const { injectDisruption, analysis } = useParallax();

  /* Data path: SAP S/4HANA demo provider → SAP adapter → PARALLAX domain.
     Falls back to the seeded demo data set while loading or on error. */
  const sap = useSapResources();
  const suppliers = sap.snapshot?.suppliers ?? fallbackSuppliers;
  const factories = sap.snapshot?.factories ?? fallbackFactories;
  const machines = sap.snapshot?.machines ?? fallbackMachines;
  const inventory = sap.snapshot?.inventory ?? fallbackInventory;
  const workforce = sap.snapshot?.workforce ?? fallbackWorkforce;

  const q = query.trim().toLowerCase();
  const matches = (id: string, name: string) =>
    !q || id.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  const visible = (kind: TypeFilter) => typeFilter === "all" || typeFilter === kind;

  const supplierList = useMemo(
    () => suppliers.filter((s) => matches(s.id, s.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suppliers, q],
  );
  const factoryList = useMemo(
    () => factories.filter((f) => matches(f.id, f.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [factories, q],
  );
  const machineList = useMemo(
    () => machines.filter((m) => matches(m.id, m.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [machines, q],
  );
  const inventoryList = useMemo(
    () => inventory.filter((i) => matches(i.id, i.name)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inventory, q],
  );
  const routeList = useMemo(
    () => logisticsRoutes.filter((r) => matches(r.id, `${r.from} ${r.to}`)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q],
  );
>>>>>>> integration-suvreen
  const transferable = workforce.filter((w) => w.compatibility >= 70);

  const total =
    (visible("supplier") ? supplierList.length : 0) +
    (visible("factory") ? factoryList.length : 0) +
    (visible("machine") ? machineList.length : 0) +
    (visible("inventory") ? inventoryList.length : 0) +
    (visible("route") ? routeList.length : 0);

  const noResults =
    visible("supplier") &&
    visible("factory") &&
    visible("machine") &&
    visible("inventory") &&
    visible("route") &&
    total === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resource discovery"
        title="Available Resources"
        subtitle="Enterprise resources that can contribute to reconstructing CAP-THS-017 — normalized from the SAP S/4HANA demo provider."
        right={
          <>
            <SourceBadge />
            <DemoTag />
          </>
        }
      />

      {/* Search + type filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-[240px] flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID or name…"
            className="w-full rounded-sm border border-border bg-surface py-1.5 pr-3 pl-8 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-info/50 focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {typeFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={cn(
                "rounded-sm border px-2 py-1 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors",
                typeFilter === f.id
                  ? "border-info/50 bg-info/12 text-info"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="num ml-auto text-[11px] text-muted-foreground">{total} shown</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {visible("supplier") ? (
          <ResourceGroup
            title="Suppliers"
            icon={<Boxes className="size-4" />}
            count={supplierList.length}
            note="S/4HANA"
          >
            {supplierList.map((s) => (
              <ResourceRow
                key={s.id}
                id={s.id}
                name={s.name}
                meta={`${s.region} · tier ${s.tier} · lead ${s.leadTimeDays}d`}
                status={s.status}
                onClick={() =>
                  setDetail({
                    id: s.id,
                    kind: "supplier",
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
        ) : null}

        <div className="space-y-4">
          {visible("factory") ? (
            <ResourceGroup
              title="Plants"
              icon={<Factory className="size-4" />}
              count={factoryList.length}
              note="S/4HANA"
            >
              {factoryList.map((f) => (
                <ResourceRow
                  key={f.id}
                  id={f.id}
                  name={f.name}
                  meta={`${f.location} · ${f.freeCapacityPct}% available capacity`}
                  status={f.status}
                  onClick={() =>
                    setDetail({
                      id: f.id,
                      kind: "factory",
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
          ) : null}

          {visible("inventory") ? (
            <ResourceGroup
              title="Inventory"
              icon={<Warehouse className="size-4" />}
              count={inventoryList.length}
              note="SAP MM"
            >
              {inventoryList.map((i) => (
                <ResourceRow
                  key={i.id}
                  id={i.id}
                  name={`${i.name} — ${i.units.toLocaleString("en-IN")} ${i.uom}`}
                  meta={`${i.location} · covers ${i.coversDays}d`}
                  status={i.status}
                  onClick={() =>
                    setDetail({
                      id: i.id,
                      kind: "inventory",
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
          ) : null}
        </div>

        <div className="space-y-4">
          {visible("machine") ? (
            <ResourceGroup
              title="Machines"
              icon={<Cpu className="size-4" />}
              count={machineList.length}
              note="SAP PP"
            >
              {machineList.map((m) => (
                <ResourceRow
                  key={m.id}
                  id={m.id}
                  name={m.name}
                  meta={`${m.factoryId} · ${m.utilisationPct}% utilised · ±${m.toleranceMicron}µm`}
                  status={m.status}
                  onClick={() =>
                    setDetail({
                      id: m.id,
                      kind: "machine",
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
          ) : null}

          {visible("route") ? (
            <ResourceGroup
              title="Logistics"
              icon={<Truck className="size-4" />}
              count={routeList.length}
            >
              {routeList.map((r) => (
                <ResourceRow
                  key={r.id}
                  id={r.id}
                  name={`Route ${r.from} → ${r.to}`}
                  meta={`${r.mode} · ${r.transitHours}h · ${r.coldChain ? "cold-chain" : "ambient"}`}
                  status={r.status}
                  onClick={() =>
                    setDetail({
                      id: r.id,
                      kind: "route",
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
          ) : null}

          <ResourceGroup
            title="Workforce"
            icon={<Users className="size-4" />}
            count={transferable.length}
            note="SAP HCM"
          >
            <div className="px-4 py-3">
              <p className="text-xs text-foreground">
                {transferable.length} employees with transferable skills for precision packaging
                operation.
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Modelled by capability, not job title. Average training gap 9%.
              </p>
            </div>
          </ResourceGroup>
        </div>
      </div>

      {noResults ? (
        <Panel className="p-6 text-center">
          <p className="text-sm text-foreground">No resources match “{query}”.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Clear the search or pick a different type filter.
          </p>
        </Panel>
      ) : null}

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
              {detail.kind !== "route" ? (
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="text-[11px] text-muted-foreground">Source system</span>
                  <SourceBadge detail="Demo provider — simulated connection. Real deployments bind an OData/BTP provider." />
                </div>
              ) : null}
              <button
                type="button"
                disabled={analysis === "running"}
                onClick={() => {
                  injectDisruption({ resourceType: detail.kind, resourceId: detail.id });
                  setDetail(null);
                }}
                className="w-full rounded-sm border border-critical/50 bg-critical/15 px-3 py-2 font-mono text-[11px] tracking-[0.1em] text-critical uppercase transition-colors hover:bg-critical/25 disabled:opacity-50"
              >
                {analysis === "running"
                  ? "Pipeline running…"
                  : "Simulate disruption on this resource"}
              </button>
              <DemoTag />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
