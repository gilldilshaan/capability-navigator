/**
 * PARALLAX — disruption service (backend: Bani).
 *
 * Creates and reads disruptions. Mock responses are built from
 * src/lib/parallax/data.ts and are temporary until the disruption endpoints
 * exist (see FRONTEND_INTEGRATION_PLAN.md §3.1).
 */

import type { Disruption, InjectDisruptionPayload } from "@/types/parallax";
import { factories, activeDisruption, machines, suppliers } from "@/lib/parallax/data";
import { get, post, withFallback, type ApiEnvelope } from "./api";
import { apiConfig } from "./config";

/** Deterministic mock incident for an injected resource. */
function mockDisruptionFor(payload: InjectDisruptionPayload): Disruption {
  // The canonical demo incident (MedCore SUP-1001) stays exactly as authored.
  if (payload.resourceType === "supplier" && payload.resourceId === activeDisruption.supplierId) {
    return activeDisruption;
  }

  let name = payload.resourceId;
  let capabilityId = activeDisruption.capabilityId ?? "CAP-THS-017";
  let component = activeDisruption.component ?? "Packaging module";

  const supplier = suppliers.find((s) => s.id === payload.resourceId);
  const factory = factories.find((f) => f.id === payload.resourceId);
  const machine = machines.find((m) => m.id === payload.resourceId);

  if (supplier) {
    name = supplier.name;
    capabilityId = supplier.capabilities[0] ?? capabilityId;
    component = `Supply of ${supplier.capabilities[0] ?? "component"}`;
  } else if (factory) {
    name = factory.name;
    capabilityId = factory.capabilities[0] ?? capabilityId;
    component = `Production capacity at ${factory.name}`;
  } else if (machine) {
    name = machine.name;
    capabilityId = machine.capability;
    component = `${machine.name} downtime`;
  }

  return {
    ...activeDisruption,
    id: `INC-${2100 + (Math.abs(hash(payload.resourceId)) % 900)}`,
    title: `Injected ${payload.resourceType} disruption`,
    ...(payload.resourceType === "supplier" ? { supplierId: payload.resourceId } : {}),
    supplier: name,
    component,
    capabilityId,
    severity: payload.severity ?? "HIGH",
    status: "OPEN",
    ...(payload.note ? { impact: payload.note } : {}),
  };
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return h;
}

/** Flow A — user picks a supplier/resource, frontend asks the backend to inject it. */
export function injectDisruption(
  payload: InjectDisruptionPayload,
): Promise<ApiEnvelope<Disruption>> {
  return withFallback<Disruption>({
    label: `inject disruption (${payload.resourceType} ${payload.resourceId})`,
    live: () => post<Disruption>(`${apiConfig.urls.disruptions()}/inject`, payload),
    mock: () => mockDisruptionFor(payload),
  });
}

export function getActiveDisruptions(): Promise<ApiEnvelope<Disruption[]>> {
  return withFallback<Disruption[]>({
    label: "list active disruptions",
    live: () => get<Disruption[]>(`${apiConfig.urls.disruptions()}/active`),
    mock: () => [activeDisruption],
  });
}

export function getDisruption(id: string): Promise<ApiEnvelope<Disruption>> {
  return withFallback<Disruption>({
    label: `get disruption ${id}`,
    live: () => get<Disruption>(`${apiConfig.urls.disruptions()}/${encodeURIComponent(id)}`),
    mock: () => {
      if (id === activeDisruption.id) return activeDisruption;
      throw new Error(`Unknown disruption ${id}`);
    },
  });
}
