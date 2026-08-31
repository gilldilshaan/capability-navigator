import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "critical" | "warning" | "success" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  critical: "border-critical/45 bg-critical/12 text-critical",
  warning: "border-warning/45 bg-warning/12 text-warning",
  success: "border-success/45 bg-success/12 text-success",
  info: "border-info/45 bg-info/12 text-info",
  neutral: "border-border-strong bg-surface-2 text-muted-foreground",
};

export function toneFor(status: string): Tone {
  const s = status.toUpperCase();
  if (["OFFLINE", "CRITICAL", "HIGH", "REJECTED", "FAILED"].includes(s)) return "critical";
  if (
    [
      "PARTIAL",
      "AT RISK",
      "MEDIUM",
      "WARNING",
      "AWAITING APPROVAL",
      "ALTERNATIVE REQUESTED",
      "RUNNING",
      "MEDIUM-LOW",
    ].includes(s)
  )
    return "warning";
  if (["AVAILABLE", "COMPLETE", "APPROVED", "LOW", "OPERATIONAL", "RECOVERED"].includes(s))
    return "success";
  if (["IDLE", "QUEUED", "INFO"].includes(s)) return "info";
  return "neutral";
}

export function StatusPill({
  children,
  tone,
  dot = true,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}) {
  const resolved = tone ?? toneFor(String(children));
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] leading-4 tracking-[0.09em] uppercase",
        toneClasses[resolved],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function Panel({
  children,
  className,
  tone,
}: {
  children: ReactNode;
  className?: string;
  tone?: "critical" | "info" | "success" | undefined;
}) {
  return (
    <section
      className={cn(
        "panel transition-colors duration-300",
        tone === "critical" && "border-critical/35",
        tone === "info" && "border-info/35",
        tone === "success" && "border-success/35",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  subtitle,
  right,
  icon,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border px-4 py-3",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        {icon ? <span className="mt-0.5 text-muted-foreground">{icon}</span> : null}
        <div>
          <h2 className="text-[13px] font-semibold tracking-[0.02em] text-foreground uppercase">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
      <div>
        {eyebrow ? <p className="label-xs mb-2">{eyebrow}</p> : null}
        <h1 className="page-title">{title}</h1>
        {subtitle ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  suffix,
  note,
  tone = "neutral",
  large,
  visual,
}: {
  label: string;
  value: string;
  suffix?: string;
  note: string;
  tone?: Tone;
  large?: boolean;
  /** Optional mini-visualization (gauge, meter, sparkline) docked to the right. */
  visual?: ReactNode;
}) {
  const accent =
    tone === "critical"
      ? "text-critical"
      : tone === "warning"
        ? "text-warning"
        : tone === "success"
          ? "text-success"
          : tone === "info"
            ? "text-info"
            : "text-foreground";
  return (
    <div className="panel relative overflow-hidden p-4">
      <span
        className={cn(
          "absolute inset-x-0 top-0 h-px",
          tone === "critical" && "bg-critical/60",
          tone === "warning" && "bg-warning/60",
          tone === "success" && "bg-success/60",
          tone === "info" && "bg-info/60",
          tone === "neutral" && "bg-border-strong",
        )}
      />
      <div className={cn("flex items-start gap-3", visual && "justify-between")}>
        <div className="min-w-0">
          <p className="label-xs">{label}</p>
          <p className={cn("num mt-3 font-semibold", accent, large ? "text-5xl" : "text-4xl")}>
            {value}
            {suffix ? (
              <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>
            ) : null}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{note}</p>
        </div>
        {visual ? <div className="shrink-0 self-center">{visual}</div> : null}
      </div>
    </div>
  );
}

/** Marks AI/agentic surfaces. Uses the reserved --ai-accent, nothing else. */
export function AiTag({ children = "AI" }: { children?: ReactNode }) {
  return (
    <span
      title="AI-generated intelligence"
      className="inline-flex items-center gap-1 rounded-sm border border-ai/40 bg-ai/10 px-1.5 py-0.5 font-mono text-[10px] leading-4 tracking-[0.09em] text-ai uppercase"
    >
      {children}
    </span>
  );
}

export function DataRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-0">
      <span className="label-xs shrink-0">{label}</span>
      <span className={cn("text-right text-xs text-foreground", mono && "num")}>{value}</span>
    </div>
  );
}

export function Meter({
  value,
  tone = "info",
  className,
}: {
  value: number;
  tone?: "critical" | "warning" | "success" | "info";
  className?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          tone === "critical" && "bg-critical",
          tone === "warning" && "bg-warning",
          tone === "success" && "bg-success",
          tone === "info" && "bg-info",
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function DemoTag({ children = "Illustrative simulation" }: { children?: ReactNode }) {
  return (
    <span
      title="Demo label — all figures are modelled from sample data"
      className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground/80 uppercase"
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  actions,
  icon,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="panel-inset flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon ? <div className="mb-3 text-muted-foreground">{icon}</div> : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1.5 max-w-md text-xs text-muted-foreground">{description}</p>
      {actions ? <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  );
}
