/**
 * PARALLAX — Recovery Path + Simulation Engine
 * Owner: recovery-diya branch
 *
 * This module implements the two functions this branch is responsible for:
 *   1. generateRecoveryPaths(graph, failedNodeId)
 *   2. breakSupplyChain(graph, nodeId)
 *
 * Design note: `data.ts` (owned by main) already contains a hardcoded
 * `recoveryPaths` array and `failureToggles` array that only work for the
 * one scripted MedCore scenario. This engine replaces that with a real
 * algorithm that works for ANY node in the graph, so:
 *   - Recovery Paths responds to whichever node is actually disrupted
 *   - Break My Supply Chain works when a user clicks/removes any node,
 *     not just the 6 pre-baked toggles
 *
 * It reuses the existing types (GraphNode, GraphEdge, RecoveryPath,
 * PathFactor, Capability, etc.) from data.ts so the output can be fed
 * directly into the existing RecoveryPathCard / RecoveryPathDetail
 * components with zero changes to anyone else's files.
 */

import {
  graphNodes,
  graphEdges,
  capabilities,
  capabilityById,
  suppliers,
  factories,
  machines,
  inventory,
  workforce,
  logisticsRoutes,
  type GraphNode,
  type GraphEdge,
  type NodeKind,
  type Availability,
  type RecoveryPath,
  type PathFactor,
} from "./data";

/* ============================================================================
 * GRAPH TYPE
 * ==========================================================================*/

/** The whole supply-chain network the engine operates on. */
export interface SupplyChainGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Build the live graph from the app's current mock dataset. */
export function buildGraph(): SupplyChainGraph {
  return { nodes: graphNodes, edges: graphEdges };
}

/* ============================================================================
 * LOW-LEVEL GRAPH HELPERS
 * ==========================================================================*/

function adjacency(edges: GraphEdge[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const e of edges) {
    if (!map.has(e.from)) map.set(e.from, []);
    map.get(e.from)!.push(e.to);
  }
  return map;
}

/**
 * Origins of the network: raw inputs nothing else supplies (suppliers,
 * workforce pools). Deliberately kind-based rather than "zero incoming
 * edges" — indegree can drop to zero on a downstream node (e.g. a
 * capability) purely because we removed its only feeder, and that node
 * must read as ORPHANED, not as a newly-legitimate source.
 */
const ORIGIN_KINDS: NodeKind[] = ["supplier", "workforce"];

function sourceNodeIds(nodes: GraphNode[], _edges: GraphEdge[]): string[] {
  return nodes.filter((n) => ORIGIN_KINDS.includes(n.kind)).map((n) => n.id);
}

function outcomeNodeIds(nodes: GraphNode[]): string[] {
  return nodes.filter((n) => n.kind === "outcome").map((n) => n.id);
}

/** BFS forward reachability from a set of start ids, optionally skipping one node entirely. */
function reachableFrom(
  startIds: string[],
  nodes: GraphNode[],
  edges: GraphEdge[],
  excludeId?: string,
): Set<string> {
  const adj = adjacency(edges.filter((e) => e.from !== excludeId && e.to !== excludeId));
  const seen = new Set<string>();
  const queue = startIds.filter((id) => id !== excludeId);
  queue.forEach((id) => seen.add(id));
  while (queue.length) {
    const cur = queue.shift()!;
    for (const next of adj.get(cur) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  return seen;
}

/** All simple forward paths (as arrays of node ids) from `startId` to `endId`, excluding `excludeId`. */
function findPaths(
  startId: string,
  endId: string,
  edges: GraphEdge[],
  excludeId?: string,
  maxPaths = 5,
): string[][] {
  const adj = adjacency(edges.filter((e) => e.from !== excludeId && e.to !== excludeId));
  const results: string[][] = [];

  function dfs(node: string, path: string[], visited: Set<string>) {
    if (results.length >= maxPaths) return;
    if (node === endId) {
      results.push([...path]);
      return;
    }
    for (const next of adj.get(node) ?? []) {
      if (!visited.has(next)) {
        visited.add(next);
        path.push(next);
        dfs(next, path, visited);
        path.pop();
        visited.delete(next);
      }
    }
  }

  if (startId !== excludeId) dfs(startId, [startId], new Set([startId]));
  return results;
}

function nodeLabel(nodes: GraphNode[], id: string): string {
  return nodes.find((n) => n.id === id)?.label ?? id;
}

/* ============================================================================
 * SINGLE POINTS OF FAILURE (used by both functions)
 * ==========================================================================*/

/**
 * A node c (not itself a source or the outcome) is a single point of failure
 * if at least one *tracked* source would stop reaching the outcome if c were
 * removed. Returns the set of SPOF node ids, each mapped to the sources that
 * depend on it.
 *
 * `trackedSources`, when given, should be the sources that reached the
 * outcome in the ORIGINAL (undamaged) graph, intersected with sources still
 * present now. This matters for before/after comparisons: without a fixed
 * tracked set, a source that stops reaching the outcome for an unrelated
 * reason (e.g. it was removed, or something upstream of it was) silently
 * drops out of consideration and can make an unrelated candidate look like
 * it "stopped being a SPOF" simply because there's nothing left to expose —
 * which would make resilience look like it improved after a failure.
 */
export function findSinglePointsOfFailure(
  nodes: GraphNode[],
  edges: GraphEdge[],
  trackedSources?: string[],
): Map<string, string[]> {
  const outcomes = outcomeNodeIds(nodes);
  const spofs = new Map<string, string[]>();

  const candidateSources =
    trackedSources ??
    sourceNodeIds(nodes, edges).filter((s) => outcomes.some((o) => reachableFrom([s], nodes, edges).has(o)));

  for (const candidate of nodes) {
    if (candidateSources.includes(candidate.id) || outcomes.includes(candidate.id)) continue;
    const dependentSources: string[] = [];
    for (const s of candidateSources) {
      const stillReaches = outcomes.some((o) => reachableFrom([s], nodes, edges, candidate.id).has(o));
      if (!stillReaches) dependentSources.push(s);
    }
    if (dependentSources.length > 0) spofs.set(candidate.id, dependentSources);
  }
  return spofs;
}

/** A single (source, terminal) connection that existed in the original, undamaged graph. */
export interface ReachabilityPair {
  source: string;
  terminal: string;
}

/**
 * Every (source, capability/outcome) pair that was connected in the given
 * graph. This is the fixed baseline the resilience score is measured
 * against — capture it from the ORIGINAL network before removing anything.
 */
export function baselinePairs(nodes: GraphNode[], edges: GraphEdge[]): ReachabilityPair[] {
  const sources = sourceNodeIds(nodes, edges);
  const terminals = nodes.filter((n) => n.kind === "capability" || n.kind === "outcome").map((n) => n.id);
  const pairs: ReachabilityPair[] = [];
  for (const s of sources) {
    const reach = reachableFrom([s], nodes, edges);
    for (const t of terminals) if (reach.has(t)) pairs.push({ source: s, terminal: t });
  }
  return pairs;
}

/**
 * Transparent 0-100 resilience score: the percentage of the ORIGINAL
 * network's (source, capability) connections that still hold in the graph
 * passed in.
 *
 * This is deliberately measured against a fixed `baseline` (see
 * `baselinePairs`) rather than recomputed from whatever graph is passed in.
 * Because the current graph is always the original graph minus some nodes
 * and edges, it can only ever preserve the same pairs or fewer — so the
 * score is monotonic by construction: removing something can never make
 * resilience look like it improved, including when the thing removed is a
 * source itself (its own pairs simply become unreachable, same as anyone
 * else's). If no baseline is given, one is derived from the graph passed in
 * (fine for a single, standalone score with nothing removed yet).
 */
export function resilienceScore(
  nodes: GraphNode[],
  edges: GraphEdge[],
  baseline: ReachabilityPair[] = baselinePairs(nodes, edges),
): number {
  if (baseline.length === 0) return 100;
  const preserved = baseline.filter((p) => reachableFrom([p.source], nodes, edges).has(p.terminal)).length;
  return Math.round((100 * preserved) / baseline.length);
}

/* ============================================================================
 * FUNCTION 2 — break_supply_chain(graph, node_id)
 * ==========================================================================*/

export interface BreakSupplyChainResult {
  removedNodeId: string;
  removedNodeLabel: string;
  resilienceBefore: number;
  resilienceAfter: number;
  lostCapabilities: { id: string; name: string }[];
  newSinglePointsOfFailure: { id: string; label: string; exposesSourceIds: string[] }[];
}

export function breakSupplyChain(graph: SupplyChainGraph, nodeId: string): BreakSupplyChainResult {
  const { nodes, edges } = graph;
  const target = nodes.find((n) => n.id === nodeId);
  if (!target) throw new Error(`breakSupplyChain: node ${nodeId} not found in graph`);

  const sources = sourceNodeIds(nodes, edges);
  const outcomes = outcomeNodeIds(nodes);
  const capabilityNodes = nodes.filter((n) => n.kind === "capability" || n.kind === "outcome");

  const reachableBefore = new Set(
    capabilityNodes.filter((c) => sources.some((s) => reachableFrom([s], nodes, edges).has(c.id))).map((c) => c.id),
  );

  const nodesAfter = nodes.filter((n) => n.id !== nodeId);
  const edgesAfter = edges.filter((e) => e.from !== nodeId && e.to !== nodeId);
  const sourcesAfter = sourceNodeIds(nodesAfter, edgesAfter);

  const reachableAfter = new Set(
    capabilityNodes
      .filter((c) => c.id !== nodeId && sourcesAfter.some((s) => reachableFrom([s], nodesAfter, edgesAfter).has(c.id)))
      .map((c) => c.id),
  );

  const lostCapabilities = [...reachableBefore]
    .filter((id) => !reachableAfter.has(id))
    .map((id) => ({ id, name: capabilityById[id]?.name ?? nodeLabel(nodes, id) }));

  // Fixed baseline pairs from the ORIGINAL graph — see resilienceScore() for
  // why this must stay fixed across the before/after comparison.
  const baseline = baselinePairs(nodes, edges);
  const baselineTrackedSources = sources.filter((s) =>
    outcomes.some((o) => reachableFrom([s], nodes, edges).has(o)),
  );
  const trackedSourcesAfter = baselineTrackedSources.filter((s) => nodesAfter.some((n) => n.id === s));

  const spofsBefore = new Set(findSinglePointsOfFailure(nodes, edges, baselineTrackedSources).keys());
  const spofsAfterMap = findSinglePointsOfFailure(nodesAfter, edgesAfter, trackedSourcesAfter);
  const newSinglePointsOfFailure = [...spofsAfterMap.entries()]
    .filter(([id]) => !spofsBefore.has(id))
    .map(([id, exposesSourceIds]) => ({ id, label: nodeLabel(nodes, id), exposesSourceIds }));

  return {
    removedNodeId: nodeId,
    removedNodeLabel: target.label,
    resilienceBefore: resilienceScore(nodes, edges, baseline),
    resilienceAfter: resilienceScore(nodesAfter, edgesAfter, baseline),
    lostCapabilities,
    newSinglePointsOfFailure,
  };
}

/* ============================================================================
 * FUNCTION 1 — generate_recovery_paths(graph, failed_node_id)
 * ==========================================================================*/

/** Nodes of the same kind that provide overlapping capability coverage with the failed node. */
function findSiblings(failed: GraphNode, nodes: GraphNode[]): GraphNode[] {
  return nodes.filter(
    (n) => n.id !== failed.id && n.kind === failed.kind && n.status !== "OFFLINE",
  );
}

function statusToRiskScore(status: Availability): number {
  switch (status) {
    case "AVAILABLE":
      return 90;
    case "IDLE":
      return 85;
    case "PARTIAL":
      return 60;
    case "AT RISK":
      return 35;
    case "OFFLINE":
      return 10;
    default:
      return 50;
  }
}

/** Same weighted formula the app already uses: 30 speed / 25 risk / 20 cost / 15 capacity / 10 dependency. */
function buildFactors(input: {
  recoveryDays: number;
  impactHorizonDays: number;
  riskScore: number;
  costLakh: number;
  costCeilingLakh: number;
  capacityCoveragePct: number;
  contributorCount: number;
}): PathFactor[] {
  const speedScore = Math.max(0, Math.round(100 - (input.recoveryDays / input.impactHorizonDays) * 60));
  const costScore = Math.max(0, Math.round(100 - (input.costLakh / input.costCeilingLakh) * 100));
  const dependencyScore = Math.min(100, Math.round(30 + input.contributorCount * 12));

  return [
    { key: "speed", label: "Recovery speed", weight: 30, score: speedScore, note: `${input.recoveryDays} days vs ${input.impactHorizonDays}-day impact horizon` },
    { key: "risk", label: "Risk", weight: 25, score: input.riskScore, note: "Derived from resource status" },
    { key: "cost", label: "Cost", weight: 20, score: costScore, note: `₹${input.costLakh.toFixed(1)}L` },
    { key: "capacity", label: "Capacity coverage", weight: 15, score: Math.round(input.capacityCoveragePct), note: `${Math.round(input.capacityCoveragePct)}% of committed volume` },
    { key: "dependency", label: "Dependency resilience", weight: 10, score: dependencyScore, note: `${input.contributorCount} contributing resource(s)` },
  ];
}

export function scorePath(factors: PathFactor[]): number {
  return Math.round(factors.reduce((sum, f) => sum + (f.weight / 100) * f.score, 0));
}

export function generateRecoveryPaths(
  graph: SupplyChainGraph,
  failedNodeId: string,
  impactHorizonDays = 3,
): RecoveryPath[] {
  const { nodes, edges } = graph;
  const failed = nodes.find((n) => n.id === failedNodeId);
  if (!failed) throw new Error(`generateRecoveryPaths: node ${failedNodeId} not found in graph`);

  const sources = sourceNodeIds(nodes, edges);
  const outcomes = outcomeNodeIds(nodes);
  const outcomeId = outcomes[0];
  const paths: RecoveryPath[] = [];

  /* --- PATH A: Replace — swap the failed node for a same-kind sibling --- */
  const siblings = findSiblings(failed, nodes);
  if (siblings.length > 0) {
    const best = [...siblings].sort((a, b) => statusToRiskScore(b.status) - statusToRiskScore(a.status))[0];
    const recoveryDays = best.status === "AVAILABLE" ? 5 : 10;
    const costLakh = 12 + (100 - statusToRiskScore(best.status)) * 0.1;
    const factors = buildFactors({
      recoveryDays,
      impactHorizonDays,
      riskScore: statusToRiskScore(best.status),
      costLakh,
      costCeilingLakh: 25,
      capacityCoveragePct: 100,
      contributorCount: 1,
    });
    paths.push({
      id: "A",
      title: "Direct Replacement",
      strategy: "Replace the broken link",
      composition: [`${best.label} (${best.id})`],
      recoveryDays,
      costLakh: Math.round(costLakh * 10) / 10,
      risk: statusToRiskScore(best.status) >= 80 ? "Medium-Low" : "Medium",
      capacityCoveragePct: 100,
      dependencyConcentration: "HIGH — single substitute node",
      compliance: "Qualification / requalification required",
      chain: [best.label, "Qualification", nodeLabel(nodes, outcomeId)],
      rationale: `${best.label} covers the same role as ${failed.label} and is currently ${best.status}.`,
      factors,
    });
  }

  /* --- PATH B: Reroute — an alternate end-to-end chain avoiding the failed node --- */
  if (outcomeId) {
    const reachableSources = sources.filter((s) => reachableFrom([s], nodes, edges).has(outcomeId));
    let bestAltPath: string[] | null = null;
    for (const s of reachableSources) {
      if (s === failedNodeId) continue;
      const candidatePaths = findPaths(s, outcomeId, edges, failedNodeId);
      const viable = candidatePaths.find((p) => !p.includes(failedNodeId));
      if (viable && (!bestAltPath || viable.length < bestAltPath.length)) bestAltPath = viable;
    }
    if (bestAltPath) {
      const chainLabels = bestAltPath.map((id) => nodeLabel(nodes, id));
      const contributorCount = bestAltPath.length - 1; // exclude outcome
      const recoveryDays = 6 + bestAltPath.length * 0.5;
      const costLakh = 6 + bestAltPath.length * 1.1;
      const factors = buildFactors({
        recoveryDays,
        impactHorizonDays,
        riskScore: 70,
        costLakh,
        costCeilingLakh: 25,
        capacityCoveragePct: 80,
        contributorCount,
      });
      paths.push({
        id: "B",
        title: "Reroute",
        strategy: "Take an entirely different chain",
        composition: chainLabels.slice(0, -1),
        recoveryDays: Math.round(recoveryDays * 10) / 10,
        costLakh: Math.round(costLakh * 10) / 10,
        risk: "Medium-Low",
        capacityCoveragePct: 80,
        dependencyConcentration: "MEDIUM — new chain, unproven under load",
        compliance: "Line/route validation required",
        chain: chainLabels,
        rationale: `Avoids ${failed.label} entirely via ${chainLabels.slice(0, -1).join(" → ")}.`,
        factors,
      });
    }
  }

  /* --- PATH C: Reconstruct — combine partial/idle resources to cover the lost capacity --- */
  const capabilityNode = nodes.find(
    (n) => n.kind === "capability" && edges.some((e) => e.from === failedNodeId && e.to === n.id),
  );
  const capability = capabilityNode ? capabilityById[capabilityNode.id] : undefined;
  const contributors = nodes.filter(
    (n) =>
      n.id !== failedNodeId &&
      (n.status === "AVAILABLE" || n.status === "IDLE" || n.status === "PARTIAL") &&
      edges.some((e) => e.to === (capabilityNode?.id ?? "") && e.from === n.id),
  );
  if (contributors.length > 0) {
    const recoveryDays = Math.max(2, 5 - contributors.length * 0.4);
    const costLakh = Math.max(2, 8 - contributors.length * 0.8);
    const avgRisk = Math.round(
      contributors.reduce((sum, c) => sum + statusToRiskScore(c.status), 0) / contributors.length,
    );
    const capacityCoveragePct = Math.min(100, 60 + contributors.length * 8);
    const factors = buildFactors({
      recoveryDays,
      impactHorizonDays,
      riskScore: avgRisk,
      costLakh,
      costCeilingLakh: 25,
      capacityCoveragePct,
      contributorCount: contributors.length,
    });
    paths.push({
      id: "C",
      title: "Capability Reconstruction",
      strategy: "Rebuild the capability from what already exists",
      composition: contributors.map((c) => `${c.label} (${c.id})`),
      recoveryDays: Math.round(recoveryDays * 10) / 10,
      costLakh: Math.round(costLakh * 10) / 10,
      risk: "LOW",
      capacityCoveragePct,
      dependencyConcentration: `LOW — ${contributors.length} independent contributors`,
      compliance: "REQUIRES HUMAN VERIFICATION",
      chain: [...contributors.map((c) => c.label), capability?.name ?? "Reconstructed Capability", nodeLabel(nodes, outcomeId ?? "")],
      rationale: `Reconstructs ${capability?.name ?? "the lost capability"} from ${contributors.length} resources already inside the network.`,
      factors,
    });
  }

  return paths.sort((a, b) => scorePath(b.factors) - scorePath(a.factors));
}
