import { AlertTriangle, X } from "lucide-react";

import { useParallax } from "@/lib/parallax/store";
import { cn } from "@/lib/utils";

/**
 * Slim, design-consistent banner for backend problems.
 * - warning: configured backend unreachable, mock fallback served
 * - critical: the pipeline failed and no fallback was available
 * Rendered once under the app header by AppShell. Demo mode (no
 * VITE_API_BASE_URL) never triggers it.
 */
export function SystemStatusBanner() {
  const { backendNotice, dismissNotice } = useParallax();
  if (!backendNotice) return null;

  const warning = backendNotice.tone === "warning";

  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2.5 border-b px-5 py-2",
        warning ? "border-warning/40 bg-warning/10" : "border-critical/40 bg-critical/10",
      )}
    >
      <AlertTriangle
        className={cn("size-3.5 shrink-0", warning ? "text-warning" : "text-critical")}
      />
      <span
        className={cn(
          "shrink-0 font-mono text-[10px] tracking-[0.1em] uppercase",
          warning ? "text-warning" : "text-critical",
        )}
      >
        {warning ? "Backend offline" : "Pipeline error"}
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
        {backendNotice.message}
      </span>
      <button
        type="button"
        onClick={dismissNotice}
        className="shrink-0 rounded-sm border border-border-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase hover:text-foreground"
      >
        <X className="size-3" />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  );
}
