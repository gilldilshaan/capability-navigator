import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowDownUp,
  Database,
  GitBranch,
  Route as RouteIcon,
  Server,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { MessageStrip, ObjectStatus } from "@ui5/webcomponents-react";

import { IntegrationFabric } from "@/components/parallax/IntegrationFabric";
import { SourceBadge } from "@/components/parallax/SourceBadge";
import { DemoTag, PageHeader, Panel, PanelHeader } from "@/components/parallax/primitives";
import { sapLayers } from "@/lib/parallax/data";
import { apiConfig } from "@/services";
import {
  adaptSapInventory,
  adaptSapMachine,
  adaptSapPlant,
  adaptSapSupplier,
  adaptSapWorkforce,
  getSapInventory,
  getSapMachines,
  getSapMaterials,
  getSapPlants,
  getSapSuppliers,
  getSapSuppliersNormalized,
  getSapWorkforce,
  sapSystemCatalog,
} from "@/integrations/sap";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/integration")({
  head: () => ({
    meta: [
      { title: "Enterprise Integration Fabric — PARALLAX" },
      {
        name: "description",
        content:
          "PARALLAX normalizes enterprise operational data into a capability graph for resilience analysis. SAP integration runs in demo mode with mock adapters.",
      },
      { property: "og:title", content: "Enterprise Integration Fabric — PARALLAX" },
      {
        property: "og:description",
        content: "SAP-ready architecture, explicitly running in demo mode.",
      },
    ],
  }),
  component: Integration,
});

const entityKinds = ["supplier", "material", "plant", "machine", "inventory", "workforce"] as const;
type EntityKind = (typeof entityKinds)[number];

function Integration() {
  /* Adapter-in-action preview: raw SAP shape vs normalized PARALLAX domain. */
  const [kind, setKind] = useState<EntityKind>("supplier");
  const [raw, setRaw] = useState<unknown>(null);
  const [normalized, setNormalized] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      let r: unknown = null;
      let n: unknown = null;
      if (kind === "supplier") {
        r = (await getSapSuppliers())[0] ?? null;
        n = (await getSapSuppliersNormalized())[0] ?? null;
      } else if (kind === "material") {
        r = (await getSapMaterials())[0] ?? null;
        n = r; // materials are consumed SAP-shaped by the capability graph
      } else if (kind === "plant") {
        const plants = await getSapPlants();
        r = plants[0] ?? null;
        n = plants[0] ? adaptSapPlant(plants[0]) : null;
      } else if (kind === "machine") {
        const ms = await getSapMachines();
        r = ms[0] ?? null;
        n = ms[0] ? adaptSapMachine(ms[0]) : null;
      } else if (kind === "inventory") {
        const inv = await getSapInventory();
        r = inv[0] ?? null;
        n = inv[0] ? adaptSapInventory(inv[0]) : null;
      } else {
        const ws = await getSapWorkforce();
        r = ws[0] ?? null;
        n = ws[0] ? adaptSapWorkforce(ws[0]) : null;
      }
      if (active) {
        setRaw(r);
        setNormalized(n);
      }
    })();
    return () => {
      active = false;
    };
  }, [kind]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integration fabric"
        title="Enterprise Integration Fabric"
        subtitle="PARALLAX normalizes enterprise operational data into a capability graph for resilience analysis."
        right={
          <>
            <SourceBadge />
            <DemoTag>Contract: FRONTEND_INTEGRATION_PLAN.md</DemoTag>
          </>
        }
      />

      {/* SAP connection status */}
      <Panel>
        <PanelHeader
          title="SAP connection status"
          subtitle="Demo adapter binding — flip VITE_SAP_MODE=live to point at a real OData provider"
          icon={<ArrowDownUp className="size-4" />}
        />
        <div className="space-y-3 p-4">
          <MessageStrip design="Information" hideCloseButton>
            All SAP systems on this page run in demo mode with mock adapters. No SAP credentials,
            backend or paid services are required — and no real SAP connection is claimed.
          </MessageStrip>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-border">
                  {["System", "Status", "Detail", "Transport"].map((h) => (
                    <th key={h} className="label-xs px-4 py-2.5 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sapSystemCatalog.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/60 last:border-0 hover:bg-surface-2/60"
                  >
                    <td className="px-4 py-2.5 text-[13px] font-medium text-foreground">
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5">
                      <ObjectStatus
                        state={
                          s.status === "DEMO MODE" || s.status === "DEMO ADAPTER"
                            ? "Information"
                            : "None"
                        }
                      >
                        {s.status}
                      </ObjectStatus>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.detail}</td>
                    <td className="num px-4 py-2.5 text-xs text-muted-foreground">
                      {s.simulated ? "In-repo demo provider" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>

      {/* Interactive architecture */}
      <Panel>
        <PanelHeader
          title="Integration architecture"
          subtitle="Click any layer to inspect its data sources, provider binding and mode."
          icon={<Server className="size-4" />}
        />
        <div className="p-6">
          <IntegrationFabric />
        </div>
      </Panel>

      {/* Adapter in action */}
      <Panel>
        <PanelHeader
          title="Adapter in action"
          subtitle="The same entity in its SAP source shape and after normalization into the PARALLAX domain model"
          icon={<GitBranch className="size-4" />}
          right={<SourceBadge />}
        />
        <div className="p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {entityKinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-sm border px-2 py-1 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors",
                  kind === k
                    ? "border-info/50 bg-info/12 text-info"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground",
                )}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="panel-inset overflow-hidden">
              <p className="label-xs border-b border-border px-3 py-2">SAP source payload (demo)</p>
              <pre className="num max-h-72 overflow-auto px-3 py-2.5 text-[10px] leading-relaxed text-foreground/85">
                {raw ? JSON.stringify(raw, null, 2) : "Loading…"}
              </pre>
            </div>
            <div className="panel-inset overflow-hidden border-info/30">
              <p className="label-xs border-b border-border px-3 py-2">
                Normalized PARALLAX domain object
              </p>
              <pre className="num max-h-72 overflow-auto px-3 py-2.5 text-[10px] leading-relaxed text-foreground/85">
                {normalized ? JSON.stringify(normalized, null, 2) : "Loading…"}
              </pre>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Downstream consumers — capability graph, resource discovery, recovery simulation — only
            ever see the normalized shape.
          </p>
        </div>
      </Panel>

      {/* Service endpoints */}
      <Panel>
        <PanelHeader
          title="Service endpoints"
          subtitle="Every backend URL is configurable via VITE_* env variables — paths shown are the defaults"
          icon={<Zap className="size-4" />}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-border">
                {["Service", "Owner", "Env variable", "Default path"].map((h) => (
                  <th key={h} className="label-xs px-4 py-2.5 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  icon: <Database className="size-4 text-critical" />,
                  name: "disruptionService",
                  env: "VITE_API_DISRUPTIONS_URL",
                  def: "/api/disruptions",
                  owner: "Backend + DB",
                },
                {
                  icon: <GitBranch className="size-4 text-info" />,
                  name: "graphService",
                  env: "VITE_API_GRAPH_URL",
                  def: "/api/graph",
                  owner: "Capability Graph Engine",
                },
                {
                  icon: <RouteIcon className="size-4 text-info" />,
                  name: "recoveryService",
                  env: "VITE_API_RECOVERY_URL",
                  def: "/api/recovery",
                  owner: "Recovery Engine",
                },
                {
                  icon: <Zap className="size-4 text-warning" />,
                  name: "simulationService",
                  env: "VITE_API_SIMULATION_URL",
                  def: "/api/simulation",
                  owner: "Simulation Engine",
                },
                {
                  icon: <Database className="size-4 text-ai" />,
                  name: "agentService",
                  env: "VITE_API_AGENTS_URL",
                  def: "/api/agents",
                  owner: "Agent Orchestrator",
                },
              ].map((s) => (
                <tr
                  key={s.name}
                  className="border-b border-border/60 last:border-0 hover:bg-surface-2/60"
                >
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs text-foreground">
                      {s.icon}
                      <span className="num">{s.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.owner}</td>
                  <td className="num px-4 py-2.5 text-xs text-muted-foreground">{s.env}</td>
                  <td className="num px-4 py-2.5 text-xs text-info">{s.def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="SAP platform mapping"
          subtitle="Where each capability would sit on the reference platform"
        />
        <div className="mx-auto max-w-2xl p-6">
          {sapLayers.map((l, i) => (
            <div key={l.id}>
              <div className="panel-inset flex flex-wrap items-center gap-3 p-4">
                <span className="num w-6 text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
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
          <p className="label-xs">What this build is</p>
          <ul className="mt-3 space-y-2 text-xs text-foreground/85">
            {[
              "A working frontend with a real service layer and per-call mock fallback.",
              "An SAP integration layer: provider → adapter → normalized domain model, running on demo data.",
              "A deterministic demo pipeline: disruption → graph → agents → recovery paths.",
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
          <p className="label-xs">What this build is not</p>
          <ul className="mt-3 space-y-2 text-xs text-foreground/85">
            {[
              "Not connected to a real SAP S/4HANA, HANA Cloud or BTP system.",
              "Not a claim of measured real-world cost or time savings.",
              "Not a supplier-risk monitoring or inventory management tool.",
              "Not executing anything without a recorded human decision.",
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
