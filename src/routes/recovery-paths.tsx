import { createFileRoute } from "@tanstack/react-router";
import { Route as RouteIcon } from "lucide-react";

import { RecommendationCard } from "@/components/parallax/RecommendationCard";
import { RecoveryPathCard } from "@/components/parallax/RecoveryPathCard";
import { RecoveryPathDetail } from "@/components/parallax/RecoveryPathDetail";
import {
  DemoTag,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
import { scorePath, useParallax } from "@/lib/parallax/store";
import type { RecoveryPath } from "@/lib/parallax/data";

export const Route = createFileRoute("/recovery-paths")({
  head: () => ({
    meta: [
      { title: "Recovery Paths — PARALLAX" },
      {
        name: "description",
        content:
          "Compare direct supplier replacement, alternate manufacturing and full capability reconstruction using a transparent weighted recovery score.",
      },
      { property: "og:title", content: "Recovery Paths — PARALLAX" },
      {
        property: "og:description",
        content:
          "Three ways to achieve the same outcome, scored on speed, risk, cost, capacity and dependency resilience.",
      },
    ],
  }),
  component: RecoveryPaths,
});

function RecoveryPaths() {
  const {
    paths,
    pathsGenerated,
    recommendedPathId,
    selectedPathId,
    selectPath,
    runAnalysis,
    analysis,
    pipelineStage,
    approveRecovery,
    approving,
    recoveryStatus,
  } = useParallax();

  const selected = paths.find((p) => p.id === selectedPathId) ?? null;
  const recommendedPath = paths.find((p) => p.id === recommendedPathId) ?? null;

  /* Comparative labels derived from the engine data — never invented. */
  const badgeFor = (p: RecoveryPath): string | undefined => {
    if (p.id === recommendedPathId) return undefined;
    if (paths.length && p.recoveryDays === Math.min(...paths.map((x) => x.recoveryDays)))
      return "Fastest";
    if (paths.length && p.costLakh === Math.min(...paths.map((x) => x.costLakh)))
      return "Lowest cost";
    return undefined;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reconstruct capability"
        title="Recovery Paths"
        subtitle="Same outcome. Different path. Each configuration reconstructs CAP-THS-017 from a different combination of resources."
        right={
          <>
            <StatusPill tone={recoveryStatus === "APPROVED" ? "success" : "warning"}>
              {recoveryStatus}
            </StatusPill>
            <DemoTag />
          </>
        }
      />

      {!pathsGenerated ? (
        <EmptyState
          icon={<RouteIcon className="size-6" />}
          title="No recovery paths generated yet."
          description="The reconstruction agent generates alternative capability configurations once the disruption analysis has run."
          actions={
            <button
              type="button"
              onClick={runAnalysis}
              disabled={analysis === "running"}
              className="rounded-sm border border-info/50 bg-info/15 px-3 py-2 font-mono text-[11px] tracking-[0.1em] text-info uppercase disabled:opacity-50"
            >
              {analysis === "running" ? pipelineStage || "Analysis running…" : "Run analysis"}
            </button>
          }
        />
      ) : (
        <>
          {recommendedPath ? (
            <RecommendationCard
              title={`Path ${recommendedPath.id} — ${recommendedPath.title}`}
              confidence={scorePath(recommendedPath)}
              reasoning={recommendedPath.rationale}
              benefits={[
                ...[...recommendedPath.factors]
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 3)
                  .map((f) => `${f.label}: ${f.score}/100`),
                `${recommendedPath.capacityCoveragePct}% capacity coverage`,
              ]}
              risks={[recommendedPath.compliance, recommendedPath.dependencyConcentration]}
              requiresHumanApproval
              action={{ label: "Open decision center", to: "/audit" }}
            />
          ) : null}

          <div className="grid gap-4 xl:grid-cols-3">
            {paths.map((p) => (
              <RecoveryPathCard
                key={p.id}
                path={p}
                recommended={p.id === recommendedPathId}
                selected={p.id === selectedPathId}
                badge={badgeFor(p)}
                onOpen={() => {
                  const next = p.id === selectedPathId ? null : p.id;
                  selectPath(next);
                  if (next) {
                    requestAnimationFrame(() =>
                      document
                        .getElementById("path-detail")
                        ?.scrollIntoView({ block: "start", behavior: "smooth" }),
                    );
                  }
                }}
              />
            ))}
          </div>

          {selected ? (
            <div id="path-detail" className="scroll-mt-20">
              <RecoveryPathDetail
                path={selected}
                onClose={() => selectPath(null)}
                onApprove={selected.id === recommendedPathId ? approveRecovery : undefined}
                approving={approving}
                recoveryStatus={recoveryStatus}
              />
            </div>
          ) : null}

          <Panel>
            <PanelHeader
              title="Scoring model"
              subtitle="Recovery score = 30% recovery speed + 25% risk + 20% cost + 15% capacity + 10% dependency resilience"
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "Path",
                      "Strategy",
                      "Speed 30%",
                      "Risk 25%",
                      "Cost 20%",
                      "Capacity 15%",
                      "Dependency 10%",
                      "Score",
                    ].map((h) => (
                      <th key={h} className="label-xs px-4 py-2.5 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paths.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/60 last:border-0 hover:bg-surface-2/60"
                    >
                      <td className="num px-4 py-2.5 text-xs text-info">Path {p.id}</td>
                      <td className="px-4 py-2.5 text-xs text-foreground">{p.title}</td>
                      {p.factors.map((f) => (
                        <td key={f.key} className="num px-4 py-2.5 text-xs text-muted-foreground">
                          {f.score}
                        </td>
                      ))}
                      <td
                        className={`num px-4 py-2.5 text-xs font-semibold ${
                          p.id === recommendedPathId ? "text-success" : "text-foreground"
                        }`}
                      >
                        {scorePath(p)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
              Illustrative simulation — figures are modelled from demo data, not measured real-world
              savings.
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}
