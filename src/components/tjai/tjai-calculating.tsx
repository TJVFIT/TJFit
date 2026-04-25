"use client";

import { useEffect, useMemo, useState } from "react";

import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import type { TJAICopy, TJAIMetrics } from "@/lib/tjai-types";

type Props = {
  copy: TJAICopy;
  metrics: TJAIMetrics | null;
  done?: boolean;
};

export function TJAICalculating({ copy, metrics, done = false }: Props) {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const statuses = copy.calculating.statuses;
  const currentMessage = statuses[msgIdx % statuses.length] ?? "";

  useEffect(() => {
    const t = window.setInterval(() => {
      setMsgIdx((v) => v + 1);
    }, 3000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (done) {
      setProgress(100);
      return;
    }
    const start = Date.now();
    const t = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const next = Math.min(95, (elapsed / 25000) * 95);
      setProgress((prev) => (next > prev ? next : prev));
    }, 180);
    return () => window.clearInterval(t);
  }, [done]);

  const stats = useMemo(
    () =>
      metrics
        ? [
            `${copy.calculating.calorieTarget}: ${metrics.calorieTarget} kcal/day`,
            `${copy.calculating.proteinTarget}: ${metrics.protein}g/day`,
            `${copy.calculating.progressTarget}: ${metrics.weeklyWeightChange} kg/week`
          ]
        : [],
    [copy, metrics]
  );

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-background px-4 py-16 text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-accent opacity-10 blur-[60px]" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[-80px] h-[400px] w-[400px] rounded-full bg-accent-violet opacity-10 blur-[60px]" />

      <div className="mx-auto flex min-h-[75svh] w-full max-w-2xl flex-col items-center justify-center">
        <div className="rounded-2xl border border-divider bg-surface/70 px-6 py-10 text-center backdrop-blur">
          <div className="mx-auto w-fit animate-[tjai-glow-pulse_2s_ease_infinite]">
            <Logo size="hero" linked={false} />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-white">{copy.calculating.title}</h2>
          <p key={msgIdx} className="mt-3 text-sm text-muted animate-[tjai-fade-in_300ms_ease]">
            {currentMessage}
          </p>

          <div className="mt-8 h-[2px] w-full overflow-hidden rounded-full bg-divider">
            <div
              className="h-full bg-[linear-gradient(90deg,#22D3EE,#A78BFA)] transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
            />
          </div>

          <div className="mt-6 grid gap-3">
            {stats.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "rounded-xl border border-divider bg-surface px-6 py-4 text-sm text-bright opacity-0",
                  i === 0 && "animate-[tjai-fade-up_500ms_ease_forwards_300ms]",
                  i === 1 && "animate-[tjai-fade-up_500ms_ease_forwards_800ms]",
                  i === 2 && "animate-[tjai-fade-up_500ms_ease_forwards_1300ms]"
                )}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

