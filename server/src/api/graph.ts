import { eq } from "drizzle-orm";
import type {
  AffectedCapability,
  AffectedResource,
  AlternativeResource,
  Capability,
  CapabilityNetwork,
  GraphAnalysisResult,
  Supplier,
} from "@/types/parallax";
import {
  capabilities as dataCapabilities,
  capabilityById,
  graphEdges,
  graphNodes,
  hiddenDependencies,
  suppliers as dataSuppliers,
  thermoShieldDecomposition,
  activeDisruption,
} from "@/lib/parallax/data";
import { db } from "../db/client";
import {
  capabilities as capabilitiesTable,
  capabilityRequirements,
  disruptions as disruptionsTable,
  suppliers as suppliersTable,
} from "../db/schema";
import { toCapability, toSupplier } from "./mappers";
import type { ApiResponse, Handler } from "./router";

/**
 * POST /api/graph/analyze
 */
const analyze: Handler = async ({ body }): Promise<ApiResponse> => {
  const reqBody = (body as Record<string, unknown>) ?? {};
  const disruptionId = typeof reqBody["disruptionId"] === "string" ? reqBody["disruptionId"] : "";
  const capabilityIdParam =
    typeof reqBody["capabilityId"] === "string" ? reqBody["capabilityId"] : undefined;

  let dbDisruption = null;
  if (disruptionId) {
    dbDisruption = db
      .select()
      .from(disruptionsTable)
      .where(eq(disruptionsTable.id, disruptionId))
      .get();
  }

  const capabilityId =
    capabilityIdParam ?? dbDisruption?.capabilityId ?? activeDisruption.capabilityId ?? "CAP-THS-017";

  const caps = db.select().from(capabilitiesTable).all();
  const reqRows = db.select().from(capabilityRequirements).all();
  const byCapability = new Map<string, string[]>();
  for (const req of reqRows) {
    const list = byCapability.get(req.capabilityId) ?? [];
    list.push(req.requirementId);
    byCapability.set(req.capabilityId, list);
  }
  const dbCapList = caps.map((row) => toCapability(row, byCapability.get(row.id) ?? []));
  const capList: Capability[] = dbCapList.length > 0 ? dbCapList : dataCapabilities;

  const targetCap = capList.find((c: Capability) => c.id === capabilityId) ?? capabilityById[capabilityId];

  const affectedCapabilities: AffectedCapability[] = thermoShieldDecomposition.map((node) => {
    const register = capList.find((c: Capability) => c.id === node.id) ?? capabilityById[node.id];
    return {
      id: node.id,
      name: node.label,
      status: node.status,
      redundancy: register?.redundancy ?? 1,
      targetRedundancy: register?.targetRedundancy ?? 3,
      dependencies: node.dependencies,
      provider: node.provider,
      impacted: node.status !== "AVAILABLE",
    };
  });

  const affectedResources: AffectedResource[] = [
    {
      id: dbDisruption?.supplierId ?? activeDisruption.supplierId ?? "SUP-1001",
      kind: "supplier",
      name: dbDisruption?.supplier ?? activeDisruption.supplier ?? "MedCore Components Ltd.",
      status: "OFFLINE",
      role: "affected",
      note: "Sole source — availability event detected",
    },
    ...thermoShieldDecomposition
      .filter((n) => n.status !== "AVAILABLE")
      .map((n) => ({
        id: n.id,
        kind: "capability" as const,
        name: n.label,
        status: n.status,
        role: "supporting" as const,
        note: n.provider,
      })),
  ];

  const dbSuppliers = db.select().from(suppliersTable).all().map(toSupplier);
  const supplierList: Supplier[] = dbSuppliers.length > 0 ? dbSuppliers : dataSuppliers;

  const alternativeResources: AlternativeResource[] = supplierList
    .filter((s: Supplier) => s.status === "AVAILABLE" && s.capabilities.includes(capabilityId))
    .map((s: Supplier) => ({
      id: s.id,
      name: s.name,
      kind: "supplier" as const,
      leadTimeDays: s.leadTimeDays,
      qualified: s.tier === 1 && s.status === "AVAILABLE",
      note: s.constraints,
    }));

  const result: GraphAnalysisResult = {
    disruptionId: disruptionId || "INC-2048",
    capabilityId,
    capabilityName: targetCap?.name ?? "ThermoShield Packaging",
    affectedCapabilities,
    affectedResources,
    hiddenDependencies,
    alternativeResources,
    redundancyScores: capList.map((c: Capability) => ({
      capabilityId: c.id,
      capabilityName: c.name,
      redundancy: c.redundancy,
      target: c.targetRedundancy,
    })),
  };

  return { status: 200, body: result };
};

/**
 * GET /api/graph/network
 */
const network: Handler = async (): Promise<ApiResponse> => {
  const result: CapabilityNetwork = {
    nodes: graphNodes,
    edges: graphEdges,
  };
  return { status: 200, body: result };
};

export const graph = { analyze, network };
