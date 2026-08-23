import { useMemo, useState } from "react";

import { graphEdges, graphNodes, type GraphNode } from "@/lib/parallax/data";
import { StatusPill } from "@/components/parallax/primitives";
import { cn } from "@/lib/utils";

const NODE_W = 132;
const NODE_H = 42;

const kindLabel: Record<GraphNode["kind"], string> = {
  supplier: "Supplier",
  material: "Material",
  factory: "Factory",
  machine: "Machine",
  workforce: "Workforce",
  route: "Route",
  capability: "Capability",
  outcome: "Outcome",
};

function collect(startId: string, dir: "up" | "down") {
  const out = new Set<string>();
  const walk = (id: string) => {
    for (const e of graphEdges) {
      const from = dir === "down" ? e.from : e.to;
      const to = dir === "down" ? e.to : e.from;
      if (from === id && !out.has(to)) {
        out.add(to);
        walk(to);
      }
    }
  };
  walk(startId);
  return out;
}

export function NetworkGraph({
  removed = [],
  height = 500,
  showLegend = true,
  onSelect,
}: {
  removed?: string[];
  height?: number;
  showLegend?: boolean;
  onSelect?: (node: GraphNode | null) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const { up, down } = useMemo(
    () =>
      selected
        ? { up: collect(selected, "up"), down: collect(selected, "down") }
        : { up: new Set<string>(), down: new Set<string>() },
    [selected],
  );

  const select = (node: GraphNode | null) => {
    setSelected(node?.id ?? null);
    onSelect?.(node);
  };

  const isDown = (id: string) => down.has(id);
  const isUp = (id: string) => up.has(id);
  const dim = (id: string) => Boolean(selected) && id !== selected && !isUp(id) && !isDown(id);

  const node = (id: string) => graphNodes.find((n) => n.id === id)!;

  return (
    <div className="relative">
      <div className="grid-backdrop overflow-x-auto rounded-sm border border-border bg-background/60">
        <svg viewBox={`0 0 1330 ${height}`} style={{ minWidth: 980 }} className="h-auto w-full">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
            </marker>
          </defs>

          {graphEdges.map((e) => {
            const a = node(e.from);
            const b = node(e.to);
            const broken = removed.includes(e.from) || removed.includes(e.to);
            const onPath =
              selected != null &&
              ((e.from === selected || isDown(e.from)) && isDown(e.to) ||
                (e.to === selected || isUp(e.to)) && isUp(e.from) ||
                e.from === selected ||
                e.to === selected);
            const x1 = a.x + NODE_W / 2;
            const x2 = b.x - NODE_W / 2;
            const mid = (x1 + x2) / 2;
            const d = `M ${x1} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${x2} ${b.y}`;
            const color = broken
              ? "var(--color-critical)"
              : onPath && e.critical
                ? "var(--color-critical)"
                : onPath
                  ? "var(--color-info)"
                  : "var(--color-border-strong)";
            return (
              <path
                key={`${e.from}-${e.to}`}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={onPath || broken ? 1.6 : 1}
                strokeDasharray={broken ? "3 4" : undefined}
                opacity={selected && !onPath ? 0.22 : broken ? 0.75 : 0.6}
                className={cn(onPath && !broken && "edge-flow")}
              />
            );
          })}

          {graphNodes.map((n) => {
            const gone = removed.includes(n.id);
            const active = n.id === selected;
            const critical = gone || n.status === "OFFLINE" || (active && n.risk === "HIGH");
            return (
              <g
                key={n.id}
                transform={`translate(${n.x - NODE_W / 2}, ${n.y - NODE_H / 2})`}
                onClick={() => select(active ? null : n)}
                className="cursor-pointer transition-opacity duration-300"
                opacity={gone ? 0.3 : dim(n.id) ? 0.3 : 1}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={4}
                  fill={
                    critical
                      ? "color-mix(in oklab, var(--color-critical) 16%, var(--color-surface))"
                      : n.status === "AT RISK" || n.status === "PARTIAL"
                        ? "color-mix(in oklab, var(--color-warning) 12%, var(--color-surface))"
                        : active || isDown(n.id) || isUp(n.id)
                          ? "color-mix(in oklab, var(--color-info) 14%, var(--color-surface))"
                          : "var(--color-surface)"
                  }
                  stroke={
                    critical
                      ? "var(--color-critical)"
                      : n.status === "AT RISK" || n.status === "PARTIAL"
                        ? "var(--color-warning)"
                        : active
                          ? "var(--color-info)"
                          : isDown(n.id) || isUp(n.id)
                            ? "color-mix(in oklab, var(--color-info) 70%, transparent)"
                            : "var(--color-border-strong)"
                  }
                  strokeWidth={active ? 1.8 : 1}
                />
                <text x={9} y={16} className="fill-current text-[8.5px] tracking-[0.14em] uppercase" fill="var(--color-muted-foreground)">
                  {kindLabel[n.kind]}
                </text>
                <text x={9} y={31} className="text-[11px] font-medium" fill="var(--color-foreground)">
                  {n.label.length > 19 ? `${n.label.slice(0, 18)}…` : n.label}
                </text>
                {gone ? (
                  <line x1={6} y1={NODE_H - 6} x2={NODE_W - 6} y2={6} stroke="var(--color-critical)" strokeWidth={1.2} />
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {showLegend ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="label-xs">Legend</span>
          {[
            { c: "bg-success", t: "Healthy" },
            { c: "bg-warning", t: "At risk / partial" },
            { c: "bg-critical", t: "Critical dependency" },
            { c: "bg-info", t: "Selected path" },
          ].map((l) => (
            <span key={l.t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("size-2 rounded-full", l.c)} />
              {l.t}
            </span>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            Click a node to trace upstream and downstream dependencies.
          </span>
        </div>
      ) : null}

      {selected ? (
        <div className="rise-in panel mt-3 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="num text-[11px] text-muted-foreground">{selected}</span>
            <h3 className="text-sm font-semibold text-foreground">{node(selected).label}</h3>
            <StatusPill>{node(selected).status}</StatusPill>
            <StatusPill tone={node(selected).risk === "HIGH" ? "critical" : node(selected).risk === "MEDIUM" ? "warning" : "success"}>
              Risk {node(selected).risk}
            </StatusPill>
            <span className="text-xs text-muted-foreground">{node(selected).meta}</span>
            <button
              type="button"
              onClick={() => select(null)}
              className="ml-auto font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <p className="label-xs mb-1.5">Upstream dependencies ({up.size})</p>
              <p className="text-xs text-foreground/85">
                {up.size ? [...up].map((id) => node(id).label).join(" · ") : "None — this is a source node."}
              </p>
            </div>
            <div>
              <p className="label-xs mb-1.5">Downstream impact ({down.size})</p>
              <p className="text-xs text-foreground/85">
                {down.size ? [...down].map((id) => node(id).label).join(" · ") : "None — terminal node."}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
