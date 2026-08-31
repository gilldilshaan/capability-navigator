import { Database } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Subtle source-system attribution badge. Used sparingly — only where a value
 * genuinely comes from the SAP demo provider. Demo mode is explicit.
 */
export function SourceBadge({
  system = "SAP S/4HANA",
  detail,
  className,
}: {
  system?: string;
  detail?: string;
  className?: string;
}) {
  return (
    <span
      title={detail ?? `${system} — demo provider (simulated connection)`}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-sm border border-info/35 bg-info/8 px-1.5 py-0.5 font-mono text-[9px] leading-4 tracking-[0.08em] text-info/90 uppercase",
        className,
      )}
    >
      <Database className="size-2.5" />
      {system}
    </span>
  );
}
