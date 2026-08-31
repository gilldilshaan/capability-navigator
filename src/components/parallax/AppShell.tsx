import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertOctagon,
  GitBranch,
  Layers,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Route as RouteIcon,
  ScrollText,
  Server,
  Square,
  Users,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";

import { AgentActivity } from "@/components/parallax/AgentActivity";
import { SystemStatusBanner } from "@/components/parallax/SystemStatusBanner";
import { StatusPill } from "@/components/parallax/primitives";
import { useParallax } from "@/lib/parallax/store";
import { user } from "@/lib/parallax/data";
import { apiConfig } from "@/services";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Overview", icon: Activity },
  { to: "/disruptions", label: "Disruptions", icon: AlertOctagon },
  { to: "/capability-map", label: "Capability Map", icon: GitBranch },
  { to: "/resources", label: "Resource Network", icon: Layers },
  { to: "/recovery-paths", label: "Recovery Paths", icon: RouteIcon },
  { to: "/break-my-supply-chain", label: "Break My Supply Chain", icon: Zap },
  { to: "/workforce", label: "Workforce", icon: Users },
  { to: "/audit", label: "Audit & Decisions", icon: ScrollText },
  { to: "/integration", label: "Integration", icon: Server },
] as const;

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
        <span className="mt-0.5 block text-[10px] tracking-[0.05em] text-muted-foreground">
          Same outcome. Different path.
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
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] tracking-[0.08em] uppercase transition-colors",
        tone === "primary" && "border-info/50 bg-info/15 text-info hover:bg-info/25",
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

export function AppShell({ children }: { children: ReactNode }) {
  const {
    presentation,
    setPresentation,
    startDemo,
    nextDemoStep,
    demoTotalSteps,
    stopDemo,
    resetDemo,
    demoRunning,
    demoLabel,
    demoStep,
    activeDisruptions,
    recoveryStatus,
    healthStatus,
    dataSource,
    hydrated,
  } = useParallax();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  /** True once a live backend response has been received (health and/or data). */
  const backendLive = healthStatus !== null || dataSource === "live";

  const networkStatus = apiConfig.demoMode
    ? "Demo"
    : recoveryStatus === "APPROVED" && backendLive
      ? "Recovering"
      : !hydrated
        ? "Connecting"
        : backendLive
          ? "Operational"
          : "Degraded";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur">
        <div className="flex h-14 items-center gap-6 px-5">
          <Wordmark />
          <div className="hidden items-center gap-2 lg:flex">
            <span className="label-xs">Network Status</span>
            <StatusPill
              tone={
                networkStatus === "Operational"
                  ? "success"
                  : networkStatus === "Recovering" || networkStatus === "Connecting"
                    ? "info"
                    : "warning"
              }
            >
              {networkStatus}
            </StatusPill>
            <span className="ml-2 rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
              {backendLive && !apiConfig.demoMode ? "Live data" : "Demo environment"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {demoRunning ? (
              <span className="hidden items-center gap-2 rounded-sm border border-info/40 bg-info/10 px-2.5 py-1.5 md:inline-flex">
                <span className="inline-flex size-1.5 rounded-full bg-info" />
                <span className="font-mono text-[11px] tracking-[0.08em] text-info uppercase">
                  Step {String(demoStep).padStart(2, "0")}/{String(demoTotalSteps).padStart(2, "0")}{" "}
                  · {demoLabel}
                </span>
              </span>
            ) : null}
            {demoRunning ? (
              <>
                <TopBarButton
                  onClick={nextDemoStep}
                  icon={<Play className="size-3.5" />}
                  tone="primary"
                >
                  {demoStep >= demoTotalSteps ? "Finish" : "Next step"}
                </TopBarButton>
                <TopBarButton
                  onClick={stopDemo}
                  icon={<Square className="size-3.5" />}
                  tone="danger"
                >
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
                presentation ? (
                  <Minimize2 className="size-3.5" />
                ) : (
                  <Maximize2 className="size-3.5" />
                )
              }
            >
              {presentation ? "Exit presentation" : "Presentation"}
            </TopBarButton>
            <TopBarButton onClick={resetDemo} icon={<RotateCcw className="size-3.5" />}>
              Reset demo
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

      <SystemStatusBanner />

      <div className="flex">
        {presentation ? null : (
          <nav className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[228px] shrink-0 flex-col border-r border-border bg-sidebar px-2.5 py-4 lg:flex">
            <p className="label-xs px-2 pb-2">Command center</p>
            <ul className="space-y-0.5">
              {nav.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] transition-colors",
                        active
                          ? "bg-sidebar-accent text-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn("size-4", active ? "text-info" : "text-muted-foreground")}
                      />
                      <span className="truncate">{item.label}</span>
                      {item.to === "/disruptions" && activeDisruptions > 0 ? (
                        <span className="num ml-auto rounded-sm border border-critical/45 bg-critical/12 px-1 text-[10px] text-critical">
                          01
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto space-y-2 px-2">
              <p className="label-xs">Doctrine</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Don&apos;t replace the broken link. Reconstruct the capability.
              </p>
            </div>
          </nav>
        )}

        <main className={cn("min-w-0 flex-1 px-5 py-6", presentation && "px-10 py-8")}>
          {children}
        </main>

        {presentation ? null : (
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[320px] shrink-0 border-l border-border bg-sidebar xl:block">
            <AgentActivity />
          </aside>
        )}
      </div>
    </div>
  );
}
