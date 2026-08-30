/**
 * PARALLAX — service layer barrel.
 *
 * UI code (the store) imports from here; individual modules stay independent
 * so each backend module can be pointed at its own URL via env vars.
 */

export { apiConfig } from "./config";
export {
  ApiError,
  ApiUnavailableError,
  clearLastFallbackReason,
  getLastFallbackReason,
  post,
  get,
  request,
  withFallback,
  type ApiEnvelope,
  type ApiSource,
} from "./api";

export * from "./disruptionService";
export * from "./graphService";
export * from "./recoveryService";
export * from "./simulationService";
export * from "./agentService";
