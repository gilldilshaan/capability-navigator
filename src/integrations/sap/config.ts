/**
 * PARALLAX — SAP connection configuration.
 *
 * The integration runs in DEMO MODE: entities are served by the mock provider
 * and the adapter normalizes them into the PARALLAX domain model. Flipping
 * VITE_SAP_MODE=live + VITE_SAP_ENDPOINT would switch the provider binding —
 * no frontend code changes required.
 */

import type { SAPConnectionConfig, SAPSystemStatus } from "./types";

const env = import.meta.env;

const mode = env["VITE_SAP_MODE"] === "live" ? "live" : "demo";

/** Current connection descriptor — demo mode by design, never claims real SAP. */
export const sapConfig: SAPConnectionConfig = {
  mode,
  system: "SAP S/4HANA",
  status: mode === "live" ? "connected" : "simulated",
  endpoint:
    typeof env["VITE_SAP_ENDPOINT"] === "string" && env["VITE_SAP_ENDPOINT"]
      ? env["VITE_SAP_ENDPOINT"]
      : null,
};

export const isSapDemoMode = (): boolean => sapConfig.mode === "demo";

/** Status catalog for the Enterprise Integration Fabric page. Honest labels only. */
export const sapSystemCatalog: SAPSystemStatus[] = [
  {
    id: "S4HANA",
    name: "SAP S/4HANA",
    status: "DEMO MODE",
    detail: "Simulated connection",
    simulated: true,
  },
  {
    id: "HANA",
    name: "SAP HANA Cloud",
    status: "NOT CONNECTED",
    detail: "Architecture ready",
    simulated: false,
  },
  {
    id: "BTP",
    name: "SAP BTP",
    status: "OPTIONAL",
    detail: "Future deployment target",
    simulated: false,
  },
  {
    id: "IS",
    name: "SAP Integration Suite",
    status: "DEMO ADAPTER",
    detail: "Mock event flow",
    simulated: true,
  },
  {
    id: "BUILD",
    name: "SAP Build / Joule",
    status: "FUTURE EXTENSION",
    detail: "AI workflow integration",
    simulated: false,
  },
];
