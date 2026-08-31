/**
 * PARALLAX — hook exposing the SAP-sourced reference snapshot.
 *
 * Demonstrates the real data path on the Resource Network page:
 *   MockSAPDataProvider → SAPAdapter → normalized PARALLAX domain objects.
 * Falls back to nothing on error — the page renders its own fallback.
 */

import { useEffect, useState } from "react";

import { getNormalizedSnapshot, type SapNormalizedSnapshot } from "./sapService";

export type SapSnapshotStatus = "loading" | "ready" | "error";

export function useSapResources(): {
  status: SapSnapshotStatus;
  snapshot: SapNormalizedSnapshot | null;
  error: string | null;
} {
  const [status, setStatus] = useState<SapSnapshotStatus>("loading");
  const [snapshot, setSnapshot] = useState<SapNormalizedSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getNormalizedSnapshot()
      .then((snap) => {
        if (!active) return;
        setSnapshot(snap);
        setStatus("ready");
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  return { status, snapshot, error };
}
