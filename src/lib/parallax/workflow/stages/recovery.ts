import type { WorkflowResource, WorkflowState } from "../schema";

type WorkflowRecoveryPath = WorkflowState["recoveryPaths"][number];
type WorkflowPathFactor = WorkflowRecoveryPath["factors"][number];

const score = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const statusScore = (status: string) =>
  ({ AVAILABLE: 100, IDLE: 100, PARTIAL: 70, "AT RISK": 40 })[status] ?? 0;

function makeFactors(
  days: number,
  horizonHours: number,
  capacity: number,
  contributors: WorkflowResource[],
): WorkflowPathFactor[] {
  const averageStatus =
    contributors.reduce((sum, item) => sum + statusScore(item.status), 0) /
    Math.max(contributors.length, 1);
  const externalCount = contributors.filter(
    (item) => item.kind === "supplier" || item.kind === "route",
  ).length;
  return [
    {
      key: "speed",
      label: "Recovery speed",
      weight: 30,
      score: score((horizonHours / 24 / Math.max(days, 0.1)) * 100),
      note: `${days.toFixed(1)} days against a ${horizonHours}h impact horizon.`,
    },
    {
      key: "risk",
      label: "Risk",
      weight: 25,
      score: score(averageStatus),
      note: "Calculated from selected resource availability states.",
    },
    {
      key: "cost",
      label: "Cost",
      weight: 20,
      score: score(100 - externalCount * 18 - Math.max(0, days - 3) * 3),
      note: "Relative cost proxy: external dependencies and recovery duration.",
    },
    {
      key: "capacity",
      label: "Capacity coverage",
      weight: 15,
      score: score(capacity),
      note: "Calculated from selected production capacity.",
    },
    {
      key: "dependency",
      label: "Dependency resilience",
      weight: 10,
      score: score(100 - 100 / Math.max(contributors.length, 1)),
      note: `${contributors.length} independently selected contributors.`,
    },
  ];
}

function makePath(
  id: WorkflowRecoveryPath["id"],
  title: string,
  strategy: string,
  contributors: WorkflowResource[],
  days: number,
  capacity: number,
  horizonHours: number,
): WorkflowRecoveryPath {
  const factors = makeFactors(days, horizonHours, capacity, contributors);
  const externalCount = contributors.filter(
    (item) => item.kind === "supplier" || item.kind === "route",
  ).length;
  const risk: WorkflowRecoveryPath["risk"] = contributors.some((item) => item.status === "AT RISK")
    ? "Medium"
    : externalCount > 1
      ? "Medium-Low"
      : "LOW";
  return {
    id,
    title,
    strategy,
    composition: contributors.map((item) => `${item.name} (${item.id})`),
    recoveryDays: Number(days.toFixed(1)),
    costLakh: Number((externalCount * 1.5 + contributors.length * 0.25).toFixed(1)),
    risk,
    capacityCoveragePct: score(capacity),
    dependencyConcentration: `${contributors.length} contributing resources`,
    compliance: "Pending workflow compliance evaluation",
    chain: [...contributors.map((item) => item.name), "ThermoShield Packaging"],
    rationale: `Generated from ${contributors.length} currently usable resources and their measured availability/capacity data.`,
    factors,
  };
}

export function runRecoveryStage(state: WorkflowState): WorkflowState {
  if (!state.disruption) throw new Error("Recovery stage requires a disruption.");
  const resources = state.availableResources;
  const alternateSupplier = resources
    .filter((item) => item.kind === "supplier")
    .sort((a, b) => statusScore(b.status) - statusScore(a.status))[0];
  const factory = resources
    .filter((item) => item.kind === "factory")
    .sort((a, b) => (b.metrics["freeCapacityPct"] ?? 0) - (a.metrics["freeCapacityPct"] ?? 0))[0];
  const machine =
    resources.find((item) => item.kind === "machine" && item.status === "IDLE") ??
    resources.find((item) => item.kind === "machine");
  const inventory = resources
    .filter((item) => item.kind === "inventory")
    .sort((a, b) => (b.metrics["coversDays"] ?? 0) - (a.metrics["coversDays"] ?? 0))[0];
  const workforce = resources.filter((item) => item.kind === "workforce").slice(0, 3);
  const route = resources
    .filter((item) => item.kind === "route")
    .sort(
      (a, b) => (a.metrics["transitHours"] ?? Infinity) - (b.metrics["transitHours"] ?? Infinity),
    )[0];
  const paths: WorkflowRecoveryPath[] = [];
  if (alternateSupplier)
    paths.push(
      makePath(
        "A",
        "Direct Supplier Replacement",
        "Replace the disrupted supplier",
        [alternateSupplier],
        alternateSupplier.metrics["leadTimeDays"] ?? 14,
        100,
        state.disruption.impactHours,
      ),
    );
  if (factory && alternateSupplier && inventory)
    paths.push(
      makePath(
        "B",
        "Alternate Manufacturing",
        "Shift production to available internal capacity",
        [factory, alternateSupplier, inventory],
        Math.max(1, (alternateSupplier.metrics["leadTimeDays"] ?? 7) / 2),
        factory.metrics["freeCapacityPct"] ?? 0,
        state.disruption.impactHours,
      ),
    );
  if (factory && machine && inventory && route)
    paths.push(
      makePath(
        "C",
        "Capability Reconstruction",
        "Reconstruct the capability from available resources",
        [factory, machine, inventory, route, ...workforce],
        Math.max(1, (route.metrics["transitHours"] ?? 24) / 24 + 1),
        factory.metrics["freeCapacityPct"] ?? 0,
        state.disruption.impactHours,
      ),
    );
  return {
    ...state,
    recoveryPaths: paths,
    trace: [
      ...state.trace,
      {
        stage: "RECOVERY",
        status: "COMPLETE",
        summary: `${paths.length} recovery configurations generated from discovered resources.`,
      },
    ],
  };
}
