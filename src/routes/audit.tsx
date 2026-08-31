import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ScrollText, XCircle } from "lucide-react";

import { RecommendationCard } from "@/components/parallax/RecommendationCard";
import {
  DemoTag,
  PageHeader,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/parallax/primitives";
import { scorePath, useParallax } from "@/lib/parallax/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Decision & Audit Trail — PARALLAX" },
      {
        name: "description",
        content:
          "Human-in-the-loop approval for agentic recovery: a timestamped decision trail from disruption detection to recovery plan approval and execution handoff.",
      },
      { property: "og:title", content: "Decision & Audit Trail — PARALLAX" },
      {
        property: "og:description",
        content: "Nothing executes without a human decision. Every agent action is logged.",
      },
    ],
  }),
  component: Audit,
});

function Audit() {
  const {
    audit,
    recoveryStatus,
    approveRecovery,
    requestAlternative,
    rejectRecovery,
    recommendedPathId,
    activity,
    approving,
    paths,
  } = useParallax();

  const decided = recoveryStatus === "APPROVED" || recoveryStatus === "REJECTED";
  const recommendedPath = paths.find((p) => p.id === recommendedPathId) ?? null;
  const pending =
    recoveryStatus === "AWAITING APPROVAL" || recoveryStatus === "ALTERNATIVE REQUESTED";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Human-in-the-loop"
        title="Decision & Audit Trail"
        subtitle="PARALLAX recommends. A resilience manager decides. Every agent step is timestamped and attributable."
        right={
          <>
            <StatusPill
              tone={
                recoveryStatus === "APPROVED"
                  ? "success"
                  : recoveryStatus === "REJECTED"
                    ? "critical"
                    : recoveryStatus === "NOT STARTED"
                      ? "info"
                      : "warning"
              }
            >
              Recovery: {recoveryStatus}
            </StatusPill>
            <DemoTag />
          </>
        }
      />

      {pending && recommendedPath ? (
        <RecommendationCard
          title={`Path ${recommendedPath.id} — ${recommendedPath.title}`}
          confidence={scorePath(recommendedPath)}
          reasoning={recommendedPath.rationale}
          benefits={[
            `Capacity coverage ${recommendedPath.capacityCoveragePct}%`,
            `Recovery time ${recommendedPath.recoveryDays} days · cost ₹${recommendedPath.costLakh}L`,
          ]}
          risks={[recommendedPath.compliance, recommendedPath.dependencyConcentration]}
          requiresHumanApproval
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <PanelHeader title="Decision trail" icon={<ScrollText className="size-4" />} />
          <ol className="p-4">
            {audit.map((e, i) => (
              <li key={e.id} className="rise-in relative flex gap-4 pb-5 last:pb-0">
                <span className="num w-11 shrink-0 pt-0.5 text-[11px] text-muted-foreground">
                  {e.time}
                </span>
                <span className="relative flex flex-col items-center">
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      e.tone === "critical" && "bg-critical",
                      e.tone === "warning" && "bg-warning",
                      e.tone === "success" && "bg-success",
                      e.tone === "info" && "bg-info",
                    )}
                  />
                  {i < audit.length - 1 ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
                </span>
                <span className="pb-1">
                  <span className="block text-[13px] font-medium text-foreground">{e.label}</span>
                  <span className="block text-xs text-muted-foreground">{e.detail}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="border-t border-border p-4">
            {recoveryStatus === "NOT STARTED" ? (
              <p className="text-xs text-muted-foreground">
                No recommendation is pending. Run the disruption analysis to generate recovery
                paths.{" "}
                <Link to="/disruptions" className="text-info hover:underline">
                  Open incident
                </Link>
              </p>
            ) : recoveryStatus === "APPROVED" ? (
              <div className="rise-in flex flex-wrap items-center gap-3">
                <CheckCircle2 className="size-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-success">Recovery plan approved.</p>
                  <p className="text-xs text-muted-foreground">
                    Path {recommendedPathId ?? "C"} · Capability Reconstruction · execution handoff
                    ready.
                  </p>
                </div>
                <Link
                  to="/break-my-supply-chain"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-border-strong bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase hover:text-foreground"
                >
                  Stress-test the new network <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : recoveryStatus === "REJECTED" ? (
              <div className="flex flex-wrap items-center gap-3">
                <XCircle className="size-5 text-critical" />
                <div>
                  <p className="text-sm font-medium text-critical">Recommendation rejected.</p>
                  <p className="text-xs text-muted-foreground">
                    Incident INC-2048 remains open. Increase redundancy, qualify an alternative
                    resource, or develop workforce capability.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <p className="mr-auto text-xs text-muted-foreground">
                  Path {recommendedPathId ?? "C"} recommended — awaiting your decision.
                </p>
                <button
                  type="button"
                  onClick={approveRecovery}
                  disabled={approving}
                  className="rounded-sm border border-success/50 bg-success/15 px-3 py-2 font-mono text-[11px] tracking-[0.1em] text-success uppercase transition-colors hover:bg-success/25 disabled:opacity-50"
                >
                  {approving ? "Recording…" : "Approve recovery"}
                </button>
                <button
                  type="button"
                  onClick={requestAlternative}
                  disabled={approving}
                  className="rounded-sm border border-warning/50 bg-warning/12 px-3 py-2 font-mono text-[11px] tracking-[0.1em] text-warning uppercase transition-colors hover:bg-warning/22 disabled:opacity-50"
                >
                  {approving ? "Recording…" : "Request alternative"}
                </button>
                <button
                  type="button"
                  onClick={rejectRecovery}
                  disabled={approving}
                  className="rounded-sm border border-critical/50 bg-critical/12 px-3 py-2 font-mono text-[11px] tracking-[0.1em] text-critical uppercase transition-colors hover:bg-critical/22 disabled:opacity-50"
                >
                  {approving ? "Recording…" : "Reject"}
                </button>
              </div>
            )}
            {decided ? null : (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Compliance status for Path C: requires human verification of GDP cold-chain
                sign-off.
              </p>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Agent log" subtitle={`${activity.length} events recorded`} />
          <div className="max-h-[560px] overflow-y-auto p-4">
            {activity.map((e) => (
              <div key={e.id} className="border-l border-border py-1.5 pl-3">
                <div className="flex items-center gap-2">
                  <span className="num text-[10px] text-muted-foreground">{e.time}</span>
                  <span className="num text-[10px] tracking-[0.08em] text-info uppercase">
                    [{e.channel}]
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-foreground/85">{e.text}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
