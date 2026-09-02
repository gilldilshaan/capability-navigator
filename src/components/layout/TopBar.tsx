import { Link } from "@tanstack/react-router";
import { Maximize2, Minimize2, Play, RotateCcw, Square } from "lucide-react";
import type { ReactNode } from "react";

import { StatusPill } from "@/components/parallax/primitives";
import { useParallax } from "@/lib/parallax/store";
import { user } from "@/lib/parallax/data";
import { apiConfig } from "@/services";
import { cn } from "@/lib/utils";

function Wordmark() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative grid size-7 place-items-center rounded-sm border border-info/50 bg-info/10">
        <span className="block h-3 w-px rotate-[20deg] bg-info" />
        <span className="absolute block h-3 w-px -rotate-[20deg] bg-info/50" />
      </span>
      <span className="leading-none">
        <span className="block font-mono text-[15px] font-semibold tracking-[0.28em] text-foreground">
          PARALLAX
        </span>
        <span className="mt-0.5 hidden text-[10px] tracking-[0.05em] text-muted-foreground md:block">
          Supply Chain Resilience Command Center
        </span>
      </span>
    </Link>
  );
}

function TopBarButton({
  onClick,
  children,
  icon,
  tone = "default",
}: {
  onClick: () => void;
  children: ReactNode;
  icon: ReactNode;
  tone?: "default" | "primary" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-all duration-200",
        tone === "primary" &&
          "border-ai/55 bg-ai/15 text-ai shadow-[0_1px_8px_-4px_var(--color-ai)] hover:bg-ai/25",
        tone === "danger" && "border-critical/50 bg-critical/15 text-critical hover:bg-critical/25",
        tone === "default" &&
          "border-border-strong bg-surface-2 text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/** Global command bar — one primary CTA (Start demo), secondary actions beside it. */
export function TopBar() {
  const {
    presentation,
    setPresentation,
    startDemo,
    demoTotalSteps,
    stopDemo,
    resetDemo,
    demoRunning,
    demoLabel,
    demoStep,
    activeDisruptions,
    recoveryStatus,
    dataSource,
  } = useParallax();

  const networkStatus =
    recoveryStatus === "APPROVED"
      ? "Recovering"
      : activeDisruptions > 0
        ? "Degraded"
        : "Operational";

  const dataSourceLabel = apiConfig.demoMode
    ? "Demo data"
    : dataSource === "live"
      ? "Live API"
      : dataSource === "mock"
        ? "Demo fallback"
        : "Awaiting sync";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur">
      <div className="flex h-14 items-center gap-5 px-5">
        <Wordmark />
        <div className="hidden items-center gap-2 lg:flex">
          <span className="h-5 w-px bg-border" aria-hidden />
          <StatusPill
            tone={
              networkStatus === "Operational"
                ? "success"
                : networkStatus === "Recovering"
                  ? "info"
                  : "warning"
            }
          >
            {networkStatus}
          </StatusPill>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            <span
              className={cn(
                "inline-flex size-1.5 rounded-full breath",
                apiConfig.demoMode ? "bg-warning" : "bg-success",
              )}
            />
            {apiConfig.demoMode ? "Demo" : "Live"} · {dataSourceLabel}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {demoRunning ? (
            <span className="hidden items-center gap-2 rounded-sm border border-ai/40 bg-ai/10 px-2.5 py-1.5 md:inline-flex">
              <span className="inline-flex size-1.5 rounded-full bg-ai breath" />
              <span className="font-mono text-[11px] tracking-[0.08em] text-ai uppercase">
                Step {String(demoStep).padStart(2, "0")}/{String(demoTotalSteps).padStart(2, "0")} ·{" "}
                {demoLabel}
              </span>
            </span>
          ) : null}
          {demoRunning ? (
            <>
              <TopBarButton onClick={stopDemo} icon={<Square className="size-3.5" />} tone="danger">
                Stop
              </TopBarButton>
            </>
          ) : (
            <TopBarButton onClick={startDemo} icon={<Play className="size-3.5" />} tone="primary">
              Start demo
            </TopBarButton>
          )}
          <TopBarButton
            onClick={() => setPresentation(!presentation)}
            icon={
              presentation ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />
            }
          >
            {presentation ? "Exit presentation" : "Presentation"}
          </TopBarButton>
          <TopBarButton onClick={resetDemo} icon={<RotateCcw className="size-3.5" />}>
            Reset
          </TopBarButton>

          <div className="ml-2 hidden items-center gap-2.5 border-l border-border pl-4 xl:flex">
            <span className="grid size-8 place-items-center rounded-sm border border-border-strong bg-surface-2 font-mono text-[11px] text-foreground">
              {user.initials}
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-medium text-foreground">{user.name}</span>
              <span className="block text-[10px] text-muted-foreground">{user.role}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
