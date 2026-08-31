import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import type { ResourceKind } from "@/types/parallax";

import { db } from "../db/client";
import {
  capabilities,
  disruptions as disruptionsTable,
  factories,
  inventoryItems,
  logisticsRoutes,
  machines,
  suppliers,
  workforceRecords,
  type NewDisruption,
} from "../db/schema";
import { toDisruption } from "./mappers";
import type { ApiResponse, Handler } from "./router";
import { HttpError } from "./router";

const injectSchema = z.object({
  resourceType: z.enum([
    "supplier",
    "factory",
    "machine",
    "inventory",
    "route",
    "workforce",
    "capability",
  ]),
  resourceId: z.string().min(1, "resourceId is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  note: z.string().optional(),
});

const ACTIVE_STATUSES = ["OPEN", "ANALYZING", "AWAITING APPROVAL"] as const;

interface ResourceLookup {
  name: string;
  capabilityIds: string[];
}

function findResource(kind: ResourceKind, resourceId: string): ResourceLookup | null {
  switch (kind) {
    case "supplier": {
      const row = db.select().from(suppliers).where(eq(suppliers.id, resourceId)).get();
      return row ? { name: row.name, capabilityIds: row.capabilities } : null;
    }
    case "factory": {
      const row = db.select().from(factories).where(eq(factories.id, resourceId)).get();
      return row ? { name: row.name, capabilityIds: row.capabilities } : null;
    }
    case "machine": {
      const row = db.select().from(machines).where(eq(machines.id, resourceId)).get();
      return row ? { name: row.name, capabilityIds: [row.capability] } : null;
    }
    case "capability": {
      const row = db.select().from(capabilities).where(eq(capabilities.id, resourceId)).get();
      return row ? { name: row.name, capabilityIds: [row.id] } : null;
    }
    case "inventory": {
      const row = db.select().from(inventoryItems).where(eq(inventoryItems.id, resourceId)).get();
      return row ? { name: row.name, capabilityIds: [] } : null;
    }
    case "route": {
      const row = db.select().from(logisticsRoutes).where(eq(logisticsRoutes.id, resourceId)).get();
      return row ? { name: `${row.from} → ${row.to}`, capabilityIds: [] } : null;
    }
    case "workforce": {
      const row = db.select().from(workforceRecords).where(eq(workforceRecords.id, resourceId)).get();
      return row ? { name: row.role, capabilityIds: [] } : null;
    }
    default:
      return null;
  }
}

function nextDisruptionId(): string {
  const rows = db.select({ id: disruptionsTable.id }).from(disruptionsTable).all();
  let maxSuffix = 2048;
  for (const row of rows) {
    const match = /^INC-(\d{4})$/.exec(row.id);
    if (match) maxSuffix = Math.max(maxSuffix, Number(match[1]));
  }
  const next = Math.max(2100, maxSuffix + 1);
  return `INC-${String(next).padStart(4, "0")}`;
}

/**
 * POST /api/disruptions/inject
 * Validates the payload, verifies the resource exists, derives the affected
 * capability from the existing data relationships and persists a Disruption.
 */
const inject: Handler = async ({ body }): Promise<ApiResponse> => {
  const parsed = injectSchema.safeParse(body);
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new HttpError(400, "VALIDATION_ERROR", `Invalid payload — ${detail}`);
  }

  const { resourceType, resourceId, severity } = parsed.data;
  const resource = findResource(resourceType, resourceId);
  if (!resource) {
    throw new HttpError(
      404,
      "RESOURCE_NOT_FOUND",
      `No ${resourceType} with id '${resourceId}' exists.`,
    );
  }

  const firstCapability = resource.capabilityIds[0] ?? null;

  const title = `Injected ${resourceType} disruption`;
  const component =
    resourceType === "supplier"
      ? firstCapability
        ? `Supply of ${firstCapability}`
        : undefined
      : resourceType === "factory"
        ? `Production capacity at ${resource.name}`
        : resourceType === "machine"
          ? `${resource.name} downtime`
          : resourceType === "capability"
            ? resource.name
            : undefined;

  const now = new Date().toISOString();
  const id = nextDisruptionId();

  const row: NewDisruption = {
    id,
    title,
    severity: severity ?? "HIGH",
    detectedAt: now,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
    ...(resourceType === "supplier" ? { supplierId: resourceId, supplier: resource.name } : {}),
    ...(firstCapability ? { capabilityId: firstCapability } : {}),
    ...(component ? { component } : {}),
    ...(parsed.data.note ? { impact: parsed.data.note } : {}),
  };

  db.insert(disruptionsTable).values(row).run();

  const created = db.select().from(disruptionsTable).where(eq(disruptionsTable.id, id)).get();
  if (!created) {
    throw new HttpError(500, "INSERT_FAILED", "Disruption could not be created.");
  }
  return { status: 201, body: toDisruption(created) };
};

/**
 * GET /api/disruptions/active
 * Returns disruptions that are still open (OPEN / ANALYZING / AWAITING APPROVAL),
 * newest first.
 */
const active: Handler = async (): Promise<ApiResponse> => {
  const rows = db
    .select()
    .from(disruptionsTable)
    .where(inArrayStatus())
    .orderBy(descCreated())
    .all();
  return { status: 200, body: rows.map(toDisruption) };
};

const byId: Handler = async ({ params }): Promise<ApiResponse> => {
  const id = params["id"] ?? "";
  const row = db.select().from(disruptionsTable).where(eq(disruptionsTable.id, id)).get();
  if (!row) {
    throw new HttpError(404, "DISRUPTION_NOT_FOUND", `No disruption with id '${id}'.`);
  }
  return { status: 200, body: toDisruption(row) };
};

export const disruptions = { inject, active, byId };

// --- query helpers ----------------------------------------------------------

function inArrayStatus() {
  return inArray(disruptionsTable.status, [...ACTIVE_STATUSES]);
}

function descCreated() {
  return desc(disruptionsTable.createdAt);
}