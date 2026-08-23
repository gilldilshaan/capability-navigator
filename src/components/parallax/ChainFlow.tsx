import { ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function ChainFlow({ chain, active = true }: { chain: string[]; active?: boolean }) {
  const [step, setStep] = useState(active ? 0 : chain.length);

  useEffect(() => {
    if (!active) return;
    setStep(0);
    const timers = chain.map((_, i) => setTimeout(() => setStep(i + 1), 220 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [chain, active]);

  return (
    <ol className="space-y-0">
      {chain.map((node, i) => {
        const on = i < step;
        const isLast = i === chain.length - 1;
        return (
          <li key={node}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-sm border px-3 py-2.5 transition-all duration-300",
                on
                  ? isLast
                    ? "border-success/50 bg-success/10"
                    : "border-info/45 bg-info/8"
                  : "border-border/70 bg-transparent opacity-45",
              )}
            >
              <span className="num text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span className={cn("text-[13px]", on ? "text-foreground" : "text-muted-foreground")}>{node}</span>
              {on && !isLast ? (
                <span className="relative ml-auto flex size-1.5">
                  <span className="pulse-ring absolute inline-flex size-1.5 rounded-full bg-info" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-info" />
                </span>
              ) : null}
              {isLast && on ? (
                <span className="ml-auto font-mono text-[10px] tracking-[0.08em] text-success uppercase">Outcome</span>
              ) : null}
            </div>
            {!isLast ? (
              <div className="flex h-5 items-center justify-start pl-5">
                <ArrowDown
                  className={cn("size-3.5 transition-colors", i < step - 1 ? "text-info" : "text-border-strong")}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
