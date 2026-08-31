import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * PARALLAX database schema (Bani).
 *
 * Every primary key is a TEXT column that preserves the existing PARALLAX IDs
 * exactly (`SUP-1001`, `FAC-01`, `CNC-17`, `INV-3301`, `EMP-1842`,
 * `RTE-DEL-CHD`, `CAP-THS-017`, `INC-2048`, …).
 *
 * Array / nested fields from src/types/parallax.ts (e.g. Supplier.capabilities,
 * Capability.requirements) are stored as JSON text columns and returned as
 * arrays by the API mappers so responses match the canonical interfaces.
 */

export const suppliers = sqliteTable(
  "suppliers",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    region: text("region").notNull(),
    status: text("status").notNull(),
    tier: integer("tier").notNull(),
    capabilities: text("capabilities", { mode: "json" }).$type<string[]>().notNull(),
    leadTimeDays: integer("lead_time_days").notNull(),
    certifications: text("certifications", { mode: "json" }).$type<string[]>().notNull(),
    constraints: text("constraints").notNull(),
  },
  (t) => [
    index("idx_suppliers_status").on(t.status),
    index("idx_suppliers_status_tier").on(t.status, t.tier),
  ],
);

export const factories = sqliteTable(
  "factories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    location: text("location").notNull(),
    status: text("status").notNull(),
    freeCapacityPct: integer("free_capacity_pct").notNull(),
    lines: integer("lines").notNull(),
    capabilities: text("capabilities", { mode: "json" }).$type<string[]>().notNull(),
    constraints: text("constraints").notNull(),
  },
  (t) => [index("idx_factories_status").on(t.status)],
);

export const capabilities = sqliteTable(
  "capabilities",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    redundancy: integer("redundancy").notNull(),
    targetRedundancy: integer("target_redundancy").notNull(),
    status: text("status").notNull(),
    owner: text("owner").notNull(),
  },
  (t) => [index("idx_capabilities_status").on(t.status)],
);

export const machines = sqliteTable(
  "machines",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    factoryId: text("factory_id")
      .notNull()
      .references(() => factories.id),
    status: text("status").notNull(),
    utilisationPct: integer("utilisation_pct").notNull(),
    capability: text("capability")
      .notNull()
      .references(() => capabilities.id),
    toleranceMicron: integer("tolerance_micron").notNull(),
  },
  (t) => [
    index("idx_machines_factory").on(t.factoryId),
    index("idx_machines_status_capability").on(t.status, t.capability),
  ],
);

export const inventoryItems = sqliteTable(
  "inventory_items",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    units: integer("units").notNull(),
    uom: text("uom").notNull(),
    location: text("location").notNull(),
    status: text("status").notNull(),
    coversDays: integer("covers_days").notNull(),
  },
  (t) => [index("idx_inventory_status").on(t.status)],
);

export const workforceRecords = sqliteTable(
  "workforce_records",
  {
    id: text("id").primaryKey(),
    role: text("role").notNull(),
    site: text("site").notNull(),
    compatibility: integer("compatibility").notNull(),
    machineOperation: integer("machine_operation").notNull(),
    qualityInspection: integer("quality_inspection").notNull(),
    precisionForming: integer("precision_forming").notNull(),
    coldChain: integer("cold_chain").notNull(),
    trainingHours: integer("training_hours").notNull(),
    recommendation: text("recommendation").notNull(),
  },
  (t) => [index("idx_workforce_compatibility").on(t.compatibility)],
);

export const logisticsRoutes = sqliteTable(
  "logistics_routes",
  {
    id: text("id").primaryKey(),
    from: text("from").notNull(),
    to: text("to").notNull(),
    mode: text("mode").notNull(),
    status: text("status").notNull(),
    transitHours: integer("transit_hours").notNull(),
    coldChain: integer("cold_chain", { mode: "boolean" }).notNull(),
    constraints: text("constraints").notNull(),
  },
  (t) => [index("idx_routes_status_coldchain").on(t.status, t.coldChain)],
);

export const capabilityRequirements = sqliteTable(
  "capability_requirements",
  {
    capabilityId: text("capability_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "cascade" }),
    requirementId: text("requirement_id")
      .notNull()
      .references(() => capabilities.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.capabilityId, t.requirementId] }),
    index("idx_capreq_capability").on(t.capabilityId),
    index("idx_capreq_requirement").on(t.requirementId),
  ],
);

export const disruptions = sqliteTable(
  "disruptions",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    supplierId: text("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    supplier: text("supplier"),
    component: text("component"),
    dependency: text("dependency"),
    capabilityId: text("capability_id").references(() => capabilities.id, {
      onDelete: "set null",
    }),
    severity: text("severity").notNull(),
    detectedAt: text("detected_at").notNull(),
    impactHours: integer("impact_hours"),
    impact: text("impact"),
    affectedSkus: integer("affected_skus"),
    exposedUnits: text("exposed_units"),
    status: text("status").notNull().default("OPEN"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    index("idx_disruptions_status_severity").on(t.status, t.severity),
    index("idx_disruptions_detected").on(t.detectedAt),
  ],
);

export const approvalRequests = sqliteTable(
  "approval_requests",
  {
    id: text("id").primaryKey(),
    disruptionId: text("disruption_id")
      .notNull()
      .references(() => disruptions.id),
    workflowId: text("workflow_id"),
    pathId: text("path_id").notNull(),
    recommendation: text("recommendation"),
    complianceStatus: text("compliance_status"),
    status: text("status").notNull(),
    requestedAt: text("requested_at").notNull(),
    decidedBy: text("decided_by"),
    decidedAt: text("decided_at"),
    note: text("note"),
  },
  (t) => [index("idx_approvals_status_disruption").on(t.status, t.disruptionId)],
);

export type SupplierRow = typeof suppliers.$inferSelect;
export type FactoryRow = typeof factories.$inferSelect;
export type MachineRow = typeof machines.$inferSelect;
export type InventoryRow = typeof inventoryItems.$inferSelect;
export type WorkforceRow = typeof workforceRecords.$inferSelect;
export type LogisticsRouteRow = typeof logisticsRoutes.$inferSelect;
export type CapabilityRow = typeof capabilities.$inferSelect;
export type CapabilityRequirementRow = typeof capabilityRequirements.$inferSelect;
export type DisruptionRow = typeof disruptions.$inferSelect;
export type ApprovalRequestRow = typeof approvalRequests.$inferSelect;
export type NewDisruption = typeof disruptions.$inferInsert;