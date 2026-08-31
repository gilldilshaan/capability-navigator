/**
 * PARALLAX — master data service (backend: Bani).
 *
 * Live reads of the reference datasets (suppliers, factories, machines,
 * inventory, workforce, logistics routes, capability register) plus the
 * health probe. Mock responses are built from src/lib/parallax/data.ts and
 * keep the app fully functional when no backend is configured or reachable.
 * See FRONTEND_INTEGRATION_PLAN.md §3.
 */

import type {
  Capability,
  Factory,
  InventoryItem,
  LogisticsRoute,
  Machine,
  Supplier,
  WorkforceRecord,
} from "@/types/parallax";
import {
  capabilities,
  factories,
  inventory,
  logisticsRoutes,
  machines,
  suppliers,
  workforce,
} from "@/lib/parallax/data";
import { get, withFallback, type ApiEnvelope } from "./api";
import { apiConfig } from "./config";

/** Shape returned by GET /api/health. */
export interface HealthStatus {
  status: string;
  database: string;
}

/** Flow §1 — reference datasets, one function per master endpoint. */
export function getSuppliers(): Promise<ApiEnvelope<Supplier[]>> {
  return withFallback<Supplier[]>({
    label: "suppliers",
    live: () => get<Supplier[]>(`${apiConfig.urls.master()}/suppliers`),
    mock: () => suppliers,
  });
}

export function getFactories(): Promise<ApiEnvelope<Factory[]>> {
  return withFallback<Factory[]>({
    label: "factories",
    live: () => get<Factory[]>(`${apiConfig.urls.master()}/factories`),
    mock: () => factories,
  });
}

export function getMachines(): Promise<ApiEnvelope<Machine[]>> {
  return withFallback<Machine[]>({
    label: "machines",
    live: () => get<Machine[]>(`${apiConfig.urls.master()}/machines`),
    mock: () => machines,
  });
}

export function getInventory(): Promise<ApiEnvelope<InventoryItem[]>> {
  return withFallback<InventoryItem[]>({
    label: "inventory",
    live: () => get<InventoryItem[]>(`${apiConfig.urls.master()}/inventory`),
    mock: () => inventory,
  });
}

export function getWorkforce(): Promise<ApiEnvelope<WorkforceRecord[]>> {
  return withFallback<WorkforceRecord[]>({
    label: "workforce",
    live: () => get<WorkforceRecord[]>(`${apiConfig.urls.master()}/workforce`),
    mock: () => workforce,
  });
}

export function getLogisticsRoutes(): Promise<ApiEnvelope<LogisticsRoute[]>> {
  return withFallback<LogisticsRoute[]>({
    label: "logistics routes",
    live: () => get<LogisticsRoute[]>(`${apiConfig.urls.master()}/logistics-routes`),
    mock: () => logisticsRoutes,
  });
}

/**
 * Flow §1 — capability register. The live source is Bani's master endpoint
 * GET /api/capabilities (not /api/graph/capabilities, which belongs to the
 * graph engine and is not a master-data source).
 */
export function getCapabilities(): Promise<ApiEnvelope<Capability[]>> {
  return withFallback<Capability[]>({
    label: "capability register",
    live: () => get<Capability[]>(`${apiConfig.urls.master()}/capabilities`),
    mock: () => capabilities,
  });
}

/** Health probe — drives the connectivity/status signals on the app shell. */
export function getHealth(): Promise<ApiEnvelope<HealthStatus>> {
  return withFallback<HealthStatus>({
    label: "backend health",
    live: () => get<HealthStatus>(`${apiConfig.urls.health()}`),
    mock: () => ({ status: "ok", database: "demo (mock mode)" }),
  });
}