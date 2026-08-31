import { useState } from "react";
import { CheckCircle2, ChevronDown, Database } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * ENTERPRISE INTEGRATION FABRIC — interactive architecture diagram.
 * Clicking a layer opens its details: data sources, provider binding and mode.
 * Every label is honest about demo mode (simulated, not connected, future).
 */

interface FabricLayer {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  dataSources: string[];
  source: string;
  mode: string;
  accent: "info" | "ai" | "success" | "muted";
}

const layers: FabricLayer[] = [
  {
    id: "s4hana",
    title: "SAP S/4HANA",
    subtitle: "Suppliers · Materials · Plants · Inventory · Workforce",
    detail:
      "Source system for enterprise operational data. This build binds a simulated demo provider — no SAP system is contacted.",
    dataSources: [
      "Supplier master",
      "Material master",
      "Plant data",
      "Inventory / stock levels",
      "Workforce skill profiles",
    ],
    source: "MockSAPDataProvider — src/integrations/sap/sapMockData.ts",
    mode: "Simulated (demo mode)",
    accent: "info",
  },
  {
    id: "adapter",
    title: "SAP Adapter Layer",
    subtitle: "Normalization · Mapping · Fallback demo provider",
    detail:
      "Converts SAP-shaped payloads into normalized PARALLAX domain objects. The provider binding is one seam — swapping in a real OData/BTP provider changes nothing downstream.",
    dataSources: [
      "Field normalization to PARALLAX domain types",
      "ID mapping (SUP- / MAT- / FAC- / INV- / EMP-)",
      "Unit and status harmonization",
      "Demo fallback provider binding",
    ],
    source: "src/integrations/sap/sapAdapter.ts",
    mode: "Implemented in-repo",
    accent: "info",
  },
  {
    id: "graph",
    title: "PARALLAX Capability Graph",
    subtitle: "Resources → capabilities · dependencies → outcomes",
    detail:
      "The normalized domain model feeds capability decomposition and redundancy analysis. The graph engine contract is served by graphService (backend module: Capability Graph Engine).",
    dataSources: [
      "Resource → capability contributions",
      "Dependency → outcome edges",
      "Redundancy scores vs targets",
    ],
    source: "src/services/graphService.ts",
    mode: "Live contract ready · demo fallback active",
    accent: "ai",
  },
];

const leafLayers: FabricLayer[] = [
  {
    id: "discovery",
    title: "Resource Discovery",
    subtitle: "31 of 48 resources usable for reconstruction",
    detail:
      "Scans the normalized resource network for assets that can contribute to the lost capability.",
    dataSources: ["SAP-sourced suppliers, plants, machines, inventory, workforce"],
    source: "Resource Network page",
    mode: "Active on demo data",
    accent: "ai",
  },
  {
    id: "simulation",
    title: "Recovery Simulation",
    subtitle: "Path scoring · resilience delta · chaos testing",
    detail:
      "Simulates every viable reconstruction configuration and the Break My Supply Chain stress tests on the same graph.",
    dataSources: ["Weighted path scoring", "Before/after resilience", "Hidden dependency exposure"],
    source: "src/services/recoveryService.ts + simulationService.ts",
    mode: "Live contract ready · demo fallback active",
    accent: "ai",
  },
];

function layerBorder(accent: FabricLayer["accent"]): string {
  if (accent === "ai") return "border-ai/40 bg-ai/6";
  if (accent === "info") return "border-info/40 bg-info/6";
  if (accent === "success") return "border-success/40 bg-success/6";
  return "border-border bg-surface-2";
}

export function IntegrationFabric() {
  const [selected, setSelected] = useState<string>("s4hana");
  const active = [...layers, ...leafLayers].find((l) => l.id === selected) ?? layers[0];
  if (!active) return null;

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        {layers.map((layer, i) => (
          <div key={layer.id}>
            <button
              type="button"
              onClick={() => setSelected(layer.id)}
              className={cn(
                "flex w-full flex-wrap items-center gap-3 rounded-sm border px-4 py-3 text-left transition-all duration-200",
                layerBorder(layer.accent),
                selected === layer.id ? "ring-1 ring-info/40" : "hover:border-border-strong",
              )}
            >
              <Database className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-foreground">
                  {layer.title}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {layer.subtitle}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform",
                  selected === layer.id ? "rotate-0" : "-rotate-90",
                )}
              />
            </button>
            <div className="flex h-5 items-center justify-center">
              <span className="h-full w-px bg-border-strong" aria-hidden />
            </div>
          </div>
        ))}

        <div className="grid gap-2 sm:grid-cols-2">
          {leafLayers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setSelected(layer.id)}
              className={cn(
                "flex flex-wrap items-center gap-2 rounded-sm border px-3 py-2.5 text-left transition-all duration-200",
                layerBorder(layer.accent),
                selected === layer.id ? "ring-1 ring-ai/40" : "hover:border-border-strong",
              )}
            >
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-foreground">
                  {layer.title}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {layer.subtitle}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <span className="h-5 w-px bg-border-strong" aria-hidden />
          <span className="panel-inset border-ai/35 px-4 py-2 text-center">
            <span className="block text-[12px] font-semibold text-foreground">
              Agent Orchestration
            </span>
            <span className="block text-[11px] text-muted-foreground">
              coordinated analysis → <span className="text-warning">Human Approval</span>
            </span>
          </span>
        </div>
      </div>

      {/* details for the selected layer */}
      <div className="rise-in panel-inset mx-auto mt-5 max-w-2xl p-4">
        <p className="label-xs mb-1">Layer detail</p>
        <p className="text-[13px] font-semibold text-foreground">{active.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{active.detail}</p>
        <p className="label-xs mt-3 mb-1.5">Data sources</p>
        <ul className="space-y-1">
          {active.dataSources.map((d) => (
            <li key={d} className="flex items-start gap-2 text-xs text-foreground/85">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
              {d}
            </li>
          ))}
        </ul>
        <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
          <div>
            <p className="label-xs mb-1">Source</p>
            <p className="num text-[11px] text-info">{active.source}</p>
          </div>
          <div>
            <p className="label-xs mb-1">Mode</p>
            <p className="text-[11px] font-medium text-warning">{active.mode}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
