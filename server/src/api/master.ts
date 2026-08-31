import type { ApiResponse, Handler } from "./router";

import { db } from "../db/client";
import {
  capabilityRequirements,
  capabilities,
  factories,
  inventoryItems,
  logisticsRoutes,
  machines,
  suppliers,
  workforceRecords,
} from "../db/schema";
import { eq } from "drizzle-orm";
import {
  toCapability,
  toFactory,
  toInventoryItem,
  toLogisticsRoute,
  toMachine,
  toSupplier,
  toWorkforceRecord,
} from "./mappers";

/**
 * Master-data endpoints. Each GET returns the full collection for the given
 * resource; row shapes map 1:1 to the canonical interfaces in
 * src/types/parallax.ts. Capabilities additionally hydrate their requirement
 * graph from the capability_requirements table.
 */
export const master: Record<string, Handler> = {
  suppliers: async (): Promise<ApiResponse> => ({
    status: 200,
    body: db.select().from(suppliers).all().map(toSupplier),
  }),

  factories: async (): Promise<ApiResponse> => ({
    status: 200,
    body: db.select().from(factories).all().map(toFactory),
  }),

  machines: async (): Promise<ApiResponse> => ({
    status: 200,
    body: db.select().from(machines).all().map(toMachine),
  }),

  inventory: async (): Promise<ApiResponse> => ({
    status: 200,
    body: db.select().from(inventoryItems).all().map(toInventoryItem),
  }),

  workforce: async (): Promise<ApiResponse> => ({
    status: 200,
    body: db.select().from(workforceRecords).all().map(toWorkforceRecord),
  }),

  logisticsRoutes: async (): Promise<ApiResponse> => ({
    status: 200,
    body: db.select().from(logisticsRoutes).all().map(toLogisticsRoute),
  }),

  capabilities: async (): Promise<ApiResponse> => {
    const caps = db.select().from(capabilities).all();
    const reqRows = db.select().from(capabilityRequirements).all();
    const byCapability = new Map<string, string[]>();
    for (const req of reqRows) {
      const list = byCapability.get(req.capabilityId) ?? [];
      list.push(req.requirementId);
      byCapability.set(req.capabilityId, list);
    }
    return {
      status: 200,
      body: caps.map((row) => toCapability(row, byCapability.get(row.id) ?? [])),
    };
  },
};