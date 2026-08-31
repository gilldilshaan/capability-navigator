import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Availability, DecompNode } from "@/types/parallax";

/**
 * SVG fan-out tree for a capability decomposition: the lost capability on the
 * left, each required sub-capability on the right, connectors colored by
 * status so the impact path is instantly readable. Pure SVG — no dependencies.
 */

const NODE_W = 340;
const NODE_H = 56;
const GAP = 18;
const ROOT_W = 210;

function statusColors(status: Availability | string): {
  stroke: string;
  fill: string;
  text: string;
} {
  const s = status.toUpperCase();
  if (s === "OFFLINE" || s === "AT RISK") {
    return {
      stroke: "color-mix(in oklab, var(--color-critical) 55%, transparent)",
      fill: "color-mix(in oklab, var(--color-critical) 10%, var(--color-surface))",
      text: "var(--color-critical)",
    };
  }
  if (s === "PARTIAL") {
    return {
      stroke: "color-mix(in oklab, var(--color-warning) 55%, transparent)",
      fill: "color-mix(in oklab, var(--color-warning) 10%, var(--color-surface))",
      text: "var(--color-warning)",
    };
  }
  if (s === "AVAILABLE") {
    return {
      stroke: "color-mix(in oklab, var(--color-success) 50%, transparent)",
      fill: "color-mix(in oklab, var(--color-success) 8%, var(--color-surface))",
      text: "var(--color-success)",
    };
  }
  return {
    stroke: "var(--color-border-strong)",
    fill: "var(--color-surface)",
    text: "var(--color-muted-foreground)",
  };
}

export function CapabilityTree({
  rootId,
  rootName,
  rootMeta,
  nodes,
  selectedId,
  onSelect,
}: {
  rootId: string;
  rootName: string;
  rootMeta: string;
  nodes: DecompNode[];
  /** Controlled selection — when provided, the parent owns the state. */
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}) {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selected = selectedId !== undefined ? selectedId : internalSelected;
  const setSelected = (id: string | null) => {
    if (selectedId === undefined) setInternalSelected(id);
    onSelect?.(id);
  };

  const height = Math.max(nodes.length * (NODE_H + GAP) + 24, 200);
  const centerY = height / 2;
  const width = 760;

  return (
    <div className="grid-backdrop overflow-x-auto rounded-sm border border-border bg-background/60">
      <svg viewBox={`0 0 ${width} ${height}`} style={{ minWidth: 720 }} className="h-auto w-full">
        {/* connectors first so nodes sit on top */}
        {nodes.map((n, i) => {
          const y = 12 + i * (NODE_H + GAP) + NODE_H / 2;
          const colors = statusColors(n.status);
          const impacted = n.status !== "AVAILABLE";
          const active = selected === n.id;
          return (
            <path
              key={`edge-${n.id}`}
              d={`M ${20 + ROOT_W} ${centerY} C ${20 + ROOT_W + 90} ${centerY}, ${330 - 90} ${y}, ${330} ${y}`}
              fill="none"
              stroke={active ? colors.stroke : colors.stroke}
              strokeOpacity={selected && !active ? 0.25 : impacted ? 0.9 : 0.6}
              strokeWidth={active ? 2 : 1.4}
              strokeDasharray={impacted ? "5 6" : undefined}
              className={cn(impacted && "edge-flow")}
            />
          );
        })}

        {/* root node */}
        <g
          onClick={() => setSelected(null)}
          className="cursor-pointer"
          role="button"
          aria-label={`${rootName} — clear selection`}
        >
          <rect
            x={20}
            y={centerY - 40}
            width={ROOT_W}
            height={80}
            rx={4}
            fill="color-mix(in oklab, var(--color-info) 10%, var(--color-surface))"
            stroke={selected === null ? "var(--color-info)" : "var(--color-border-strong)"}
            strokeWidth={selected === null ? 2 : 1.2}
          />
          <text x={34} y={centerY - 16} fontSize={10} className="num" fill="var(--color-info)">
            {rootId}
          </text>
          <text
            x={34}
            y={centerY + 4}
            fontSize={13}
            fontWeight={600}
            fill="var(--color-foreground)"
          >
            {rootName.length > 24 ? `${rootName.slice(0, 23)}…` : rootName}
          </text>
          <text x={34} y={centerY + 24} fontSize={10} fill="var(--color-muted-foreground)">
            {rootMeta}
          </text>
        </g>

        {/* sub-capability nodes */}
        {nodes.map((n, i) => {
          const y = 12 + i * (NODE_H + GAP);
          const colors = statusColors(n.status);
          const active = selected === n.id;
          const impacted = n.status !== "AVAILABLE";
          return (
            <g
              key={n.id}
              onClick={() => setSelected(active ? null : n.id)}
              className="cursor-pointer transition-opacity duration-200"
              role="button"
              aria-label={`${n.label} — ${n.status}`}
              opacity={selected && !active ? 0.55 : 1}
            >
              <rect
                x={330}
                y={y}
                width={NODE_W}
                height={NODE_H}
                rx={4}
                fill={colors.fill}
                stroke={active ? colors.stroke : "var(--color-border)"}
                strokeWidth={active ? 2 : 1.2}
              />
              <text
                x={344}
                y={y + 20}
                fontSize={12}
                fontWeight={500}
                fill="var(--color-foreground)"
              >
                {n.label}
              </text>
              <text x={344} y={y + 38} fontSize={10} fill="var(--color-muted-foreground)">
                {n.id} · {n.provider.length > 34 ? `${n.provider.slice(0, 33)}…` : n.provider}
              </text>
              <text
                x={330 + NODE_W - 14}
                y={y + 22}
                fontSize={10}
                textAnchor="end"
                fill={colors.text}
                className="num"
              >
                {n.status}
              </text>
              <text
                x={330 + NODE_W - 14}
                y={y + 40}
                fontSize={9}
                textAnchor="end"
                fill="var(--color-muted-foreground)"
                className="num"
              >
                {n.dependencies} downstream
              </text>
              {impacted ? (
                <circle
                  cx={330 + NODE_W - 24}
                  cy={y + 14}
                  r={3}
                  fill={colors.text}
                  className="breath"
                />
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
