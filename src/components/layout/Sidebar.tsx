import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertOctagon,
  GitBranch,
  Layers,
  Route as RouteIcon,
  ScrollText,
  Server,
  Users,
  Zap,
} from "lucide-react";

import { ResilienceGauge } from "@/components/parallax/ResilienceGauge";
import { useParallax } from "@/lib/parallax/store";
import { apiConfig } from "@/services";
import { cn } from "@/lib/utils";

const navGroups: {
  label: string;
  items: readonly { to: string; label: string; icon: typeof Activity }[];
}[] = [
  {
    label: "Command center",
    items: [
      { to: "/", label: "Overview", icon: Activity },
      { to: "/disruptions", label: "Disruptions", icon: AlertOctagon },
      { to: "/capability-map", label: "Capability Map", icon: GitBranch },
      { to: "/resources", label: "Resource Network", icon: Layers },
      { to: "/recovery-paths", label: "Recovery Paths", icon: RouteIcon },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/break-my-supply-chain", label: "Break My Supply Chain", icon: Zap },
      { to: "/workforce", label: "Workforce", icon: Users },
      { to: "/audit", label: "Audit & Decisions", icon: ScrollText },
    ],
  },
  {
    label: "System",
    items: [{ to: "/integration", label: "Integration", icon: Server }],
  },
];

/** Left navigation — Command Center / Intelligence / System grouping + live status footer. */
export function Sidebar() {
  const { activeDisruptions, recoveryStatus, resilience, dataSource } = useParallax();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
      : "Demo fallback";

  return (
    <nav className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[220px] shrink-0 flex-col border-r border-border bg-sidebar px-2.5 py-4 lg:flex">
      {navGroups.map((group) => (
        <div key={group.label} className="mb-4">
          <p className="label-xs px-2 pb-2">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] transition-colors",
                      active
                        ? "bg-sidebar-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                    )}
                  >
                    {active ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-info"
                      />
                    ) : null}
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
        </div>
      ))}

      <div className="mt-auto space-y-3 px-2">
        <div className="panel-inset px-3 py-2.5">
          <p className="label-xs mb-2">System status</p>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <span
                  className={cn(
                    "inline-flex size-1.5 rounded-full",
                    networkStatus === "Operational"
                      ? "bg-success"
                      : networkStatus === "Recovering"
                        ? "bg-info"
                        : "bg-warning",
                  )}
                />
                Network {networkStatus.toLowerCase()}
              </p>
              <p className="num mt-1 text-[10px] text-muted-foreground">
                {dataSourceLabel} · resilience {resilience}/100
              </p>
            </div>
            <ResilienceGauge
              value={resilience}
              size={40}
              tone={resilience >= 85 ? "success" : "warning"}
            />
          </div>
        </div>
        <p className="label-xs">Doctrine</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Don&apos;t replace the broken link. Reconstruct the capability.
        </p>
      </div>
    </nav>
  );
}
