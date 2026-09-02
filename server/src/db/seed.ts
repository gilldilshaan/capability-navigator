import { pathToFileURL } from "node:url";

import {
  activeDisruption,
  capabilities as sourceCapabilities,
  factories as sourceFactories,
  failureToggles as sourceFailureToggles,
  graphEdges as sourceGraphEdges,
  graphNodes as sourceGraphNodes,
  hiddenDependencies as sourceHiddenDependencies,
  inventory as sourceInventory,
  logisticsRoutes as sourceRoutes,
  machines as sourceMachines,
  suppliers as sourceSuppliers,
  workforce as sourceWorkforce,
} from "../../../src/lib/parallax/data";

import { config } from "../config";
import { db } from "./client";
import { runMigrations } from "./migrate";
import {
  approvalRequests,
  capabilities,
  capabilityRequirements,
  disruptions,
  factories,
  failureTogglesTable,
  graphEdges,
  graphNodes,
  hiddenDependenciesTable,
  inventoryItems,
  logisticsRoutes,
  machines,
  suppliers,
  workforceRecords,
} from "./schema";

/**
 * Idempotent seed: transfers the existing PARALLAX mock dataset
 * (src/lib/parallax/data.ts) into the database, preserving IDs exactly.
 *
 * Every insert uses onConflictDoNothing() so running seed multiple times does
 * not duplicate records and does not overwrite state created at runtime.
 * data.ts is left untouched — it remains the frontend mock fallback.
 */
export function seedDatabase(): void {
  for (const c of sourceCapabilities) {
    db.insert(capabilities)
      .values({
        id: c.id,
        name: c.name,
        redundancy: c.redundancy,
        targetRedundancy: c.targetRedundancy,
        status: c.status,
        owner: c.owner,
      })
      .onConflictDoNothing()
      .run();
  }

  for (const c of sourceCapabilities) {
    for (const requirementId of c.requirements) {
      db.insert(capabilityRequirements)
        .values({ capabilityId: c.id, requirementId })
        .onConflictDoNothing()
        .run();
    }
  }

  for (const s of sourceSuppliers) {
    db.insert(suppliers)
      .values({
        id: s.id,
        name: s.name,
        region: s.region,
        status: s.status,
        tier: s.tier,
        capabilities: s.capabilities,
        leadTimeDays: s.leadTimeDays,
        certifications: s.certifications,
        constraints: s.constraints,
      })
      .onConflictDoNothing()
      .run();
  }

  for (const f of sourceFactories) {
    db.insert(factories)
      .values({
        id: f.id,
        name: f.name,
        location: f.location,
        status: f.status,
        freeCapacityPct: f.freeCapacityPct,
        lines: f.lines,
        capabilities: f.capabilities,
        constraints: f.constraints,
      })
      .onConflictDoNothing()
      .run();
  }

  for (const m of sourceMachines) {
    db.insert(machines)
      .values({
        id: m.id,
        name: m.name,
        factoryId: m.factoryId,
        status: m.status,
        utilisationPct: m.utilisationPct,
        capability: m.capability,
        toleranceMicron: m.toleranceMicron,
      })
      .onConflictDoNothing()
      .run();
  }

  for (const item of sourceInventory) {
    db.insert(inventoryItems)
      .values({
        id: item.id,
        name: item.name,
        units: item.units,
        uom: item.uom,
        location: item.location,
        status: item.status,
        coversDays: item.coversDays,
      })
      .onConflictDoNothing()
      .run();
  }

  for (const w of sourceWorkforce) {
    db.insert(workforceRecords)
      .values({
        id: w.id,
        role: w.role,
        site: w.site,
        compatibility: w.compatibility,
        machineOperation: w.machineOperation,
        qualityInspection: w.qualityInspection,
        precisionForming: w.precisionForming,
        coldChain: w.coldChain,
        trainingHours: w.trainingHours,
        recommendation: w.recommendation,
      })
      .onConflictDoNothing()
      .run();
  }

  for (const r of sourceRoutes) {
    db.insert(logisticsRoutes)
      .values({
        id: r.id,
        from: r.from,
        to: r.to,
        mode: r.mode,
        status: r.status,
        transitHours: r.transitHours,
        coldChain: r.coldChain,
        constraints: r.constraints,
      })
      .onConflictDoNothing()
      .run();
  }

  // Baseline disruption INC-2048 — mirrors data.ts activeDisruption.
  const now = new Date().toISOString();
  db.insert(disruptions)
    .values({
      id: activeDisruption.id,
      title: activeDisruption.title,
      supplierId: activeDisruption.supplierId ?? null,
      supplier: activeDisruption.supplier ?? null,
      component: activeDisruption.component ?? null,
      dependency: activeDisruption.dependency ?? null,
      capabilityId: activeDisruption.capabilityId ?? null,
      severity: activeDisruption.severity,
      detectedAt: activeDisruption.detectedAt,
      impactHours: activeDisruption.impactHours ?? null,
      impact: activeDisruption.impact ?? null,
      affectedSkus: activeDisruption.affectedSkus ?? null,
      exposedUnits: activeDisruption.exposedUnits ?? null,
      status: "OPEN",
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing()
    .run();

  // Graph nodes
  for (const node of sourceGraphNodes) {
    db.insert(graphNodes)
      .values({
        id: node.id,
        label: node.label,
        kind: node.kind,
        x: node.x,
        y: node.y,
        status: node.status,
        risk: node.risk,
        meta: node.meta,
      })
      .onConflictDoNothing()
      .run();
  }

  // Graph edges (auto-increment PK → guard against re-insert on repeat seeds by
  // checking the natural from/to key instead of relying on conflict handling).
  const existingEdges = new Set(
    db.select().from(graphEdges).all().map((e) => `${e.from}\u0000${e.to}`),
  );
  for (const edge of sourceGraphEdges) {
    const key = `${edge.from}\u0000${edge.to}`;
    if (existingEdges.has(key)) continue;
    db.insert(graphEdges)
      .values({
        from: edge.from,
        to: edge.to,
        critical: edge.critical ?? false,
      })
      .run();
    existingEdges.add(key);
  }

  // Failure toggles
  for (const ft of sourceFailureToggles) {
    db.insert(failureTogglesTable)
      .values({
        id: ft.id,
        label: ft.label,
        detail: ft.detail,
        resilienceHit: ft.resilienceHit,
        removes: ft.removes,
      })
      .onConflictDoNothing()
      .run();
  }

  // Hidden dependencies
  for (const hd of sourceHiddenDependencies) {
    db.insert(hiddenDependenciesTable)
      .values({
        id: hd.id,
        name: hd.name,
        impact: hd.impact,
        alternatives: hd.alternatives,
        redundancy: hd.redundancy,
        target: hd.target,
        mitigation: hd.mitigation,
        sharedBy: hd.sharedBy,
      })
      .onConflictDoNothing()
      .run();
  }
}

const isMain = (): boolean =>
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain()) {
  runMigrations();
  seedDatabase();

  const counts = {
    suppliers: db.select().from(suppliers).all().length,
    factories: db.select().from(factories).all().length,
    machines: db.select().from(machines).all().length,
    inventory: db.select().from(inventoryItems).all().length,
    workforce: db.select().from(workforceRecords).all().length,
    logisticsRoutes: db.select().from(logisticsRoutes).all().length,
    capabilities: db.select().from(capabilities).all().length,
    capabilityRequirements: db.select().from(capabilityRequirements).all().length,
    disruptions: db.select().from(disruptions).all().length,
    approvalRequests: db.select().from(approvalRequests).all().length,
    graphNodes: db.select().from(graphNodes).all().length,
    graphEdges: db.select().from(graphEdges).all().length,
    failureToggles: db.select().from(failureTogglesTable).all().length,
    hiddenDependencies: db.select().from(hiddenDependenciesTable).all().length,
  };

  console.log(`[parallax] seed complete — database: ${config.dbPath}`);
  console.log("[parallax] counts:", JSON.stringify(counts, null, 2));
}