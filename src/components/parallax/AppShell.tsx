import type { ReactNode } from "react";

import { ActivityRail } from "@/components/layout/ActivityRail";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { SystemStatusBanner } from "@/components/parallax/SystemStatusBanner";

/**
 * Application shell: global top bar · left navigation · main workspace ·
 * AI activity rail (collapsed 56px ↔ expanded 320px).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <SystemStatusBanner />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-5 py-6">
          {/* Required: nested routes render here. Removing this breaks all child routes. */}
          {children}
        </main>

        <ActivityRail />
      </div>
    </div>
  );
}
