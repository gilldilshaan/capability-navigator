import type { ReactNode } from "react";

import { ActivityRail } from "@/components/layout/ActivityRail";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

import { useParallax } from "@/lib/parallax/store";

/**
 * Application shell: global top bar · left navigation · main workspace ·
 * AI activity rail.
 */
export function AppShell({ children }: { children: ReactNode }) {
  useParallax();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-5 py-6">{children}</main>

        <ActivityRail />
      </div>
    </div>
  );
}
