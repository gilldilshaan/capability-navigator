import { cn } from "@/lib/utils";

/**
 * Compact SVG radial gauge for composite scores (0–100).
 * Pure SVG/CSS — no chart dependency. Track + value arc + centered value.
 */
export function ResilienceGauge({
  value,
  size = 56,
  tone = "success",
  label,
  className,
}: {
  value: number;
  size?: number;
  tone?: "success" | "warning" | "critical" | "info";
  label?: string;
  className?: string;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  const dash = (clamped / 100) * c;

  const colorVar =
    tone === "critical"
      ? "var(--color-critical)"
      : tone === "warning"
        ? "var(--color-warning)"
        : tone === "info"
          ? "var(--color-info)"
          : "var(--color-success)";

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colorVar}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="num text-[13px] font-semibold leading-none text-foreground">
          {clamped}
          {label ? (
            <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">{label}</span>
          ) : null}
        </span>
      </span>
    </div>
  );
}
