import type { ReactNode } from "react";

import { useRouterState } from "@tanstack/react-router";
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

import { ActivityRail } from "@/components/layout/ActivityRail";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

import { SystemStatusBanner } from "@/components/parallax/SystemStatusBanner";
import { StatusPill } from "@/components/parallax/primitives";

import { useParallax } from "@/lib/parallax/store";
import { user } from "@/lib/parallax/data";

import { apiConfig } from "@/services";
import { cn } from "@/lib/utils";

/**
 * Application shell: global top bar · left navigation · main workspace ·
 * AI activity rail.
 */
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
    recoveryStatus,
    healthStatus,
    dataSource,
    hydrated,
  } = useParallax();

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const backendLive =
    healthStatus !== null || dataSource === "live";

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
      <TopBar />

      <SystemStatusBanner />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-5 py-6">
          {children}
        </main>

        <ActivityRail />
      </div>
    </div>
  );
}