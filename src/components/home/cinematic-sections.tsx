"use client";

import { Target, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    n: 1,
    title: "Define your target",
    body: "Goals, schedule, equipment, and constraints — captured once, respected everywhere.",
    Icon: Target,
  },
  {
    n: 2,
    title: "TJAI builds the system",
    body: "Metabolism-aware training blocks, meals, and progression — structured like a coach plan.",
    Icon: Sparkles,
  },
  {
    n: 3,
    title: "Train with precision",
    body: "Log work, adapt loads, and stay consistent — the OS tracks momentum across 12 weeks.",
    Icon: Zap,
  },
];

/** “How it works” — glass steps + flow connectors */
export function CinematicHowItWorks() {
  return (
    <section className="reveal-section relative overflow-hidden border-t border-[rgba(255,255,255,0.06)] bg-background px-6 py-[clamp(3.5rem,8vw,7.5rem)] lg:px-12">
      <span className="ghost-text pointer-events-none start-4 top-16 max-md:opacity-[0.015] md:start-8" aria-hidden>
        PROCESS
      </span>
      <div className="relative z-[1] mx-auto max-w-6xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">How it works</p>
        <h2 className="mt-4 font-display text-[clamp(1.75rem,5vw,3.25rem)] font-extrabold tracking-[-0.02em] text-white">
          From intake to execution
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Three disciplined layers — no chaos, no novelty UI. Just a pipeline that respects physiology and your calendar.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5">
          {steps.map((s) => (
            <div key={s.n} className="relative flex flex-col">
              <article
                className={cn(
                  "glass-panel flex flex-1 flex-col rounded-2xl p-6 transition-[transform,box-shadow,border-color] duration-[250ms]",
                  "tj-card-cinematic-hover"
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.08)] text-[13px] font-bold text-accent">
                  {s.n}
                </div>
                <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(34,211,238,0.06)]">
                  <s.Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dim">{s.body}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Before / after transformation strip */
export function CinematicTransformation({ reduce }: { reduce: boolean }) {
  return (
    <section className="reveal-section relative border-t border-[rgba(255,255,255,0.06)] bg-background px-6 py-[clamp(3.5rem,8vw,7.5rem)] lg:px-12">
      <div className="relative z-[1] mx-auto max-w-3xl">
        <div className="glass-panel-glow relative grid overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] md:grid-cols-[1fr_auto_1fr]">
          <div className="relative border-e border-[rgba(255,255,255,0.04)] bg-gradient-to-br from-[rgba(239,68,68,0.06)] to-transparent p-8 md:border-e-0 md:border-s-2 md:border-s-[rgba(239,68,68,0.25)]">
            <span className="rounded-full border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.08)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300/90">
              Week 1
            </span>
            <p className="mt-4 text-sm leading-relaxed text-muted">Baseline load, habit wiring, and honest volume — no hero weeks.</p>
            <svg className="mt-8 h-28 w-full text-white/10" viewBox="0 0 120 100" preserveAspectRatio="xMidYMid meet" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                d="M40 85 Q55 40 70 38 Q85 36 88 55 Q90 72 78 82"
              />
            </svg>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 border-y border-[rgba(34,211,238,0.15)] bg-[#0D0F12] px-4 py-6 md:border-x md:border-y-0">
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-[rgba(34,211,238,0.35)] to-transparent" />
            <span className="rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.08)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              12 weeks
            </span>
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-[rgba(34,211,238,0.35)] to-transparent" />
          </div>

          <div className="relative border-s border-[rgba(255,255,255,0.04)] bg-gradient-to-bl from-[rgba(34,211,238,0.07)] to-transparent p-8 md:border-s-0 md:border-e-2 md:border-e-[rgba(34,211,238,0.25)]">
            <span className="rounded-full border border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.1)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              Week 12
            </span>
            <p className="mt-4 text-sm leading-relaxed text-muted">Progressive overload you can feel — strength, composition, and consistency compound.</p>
            <svg
              className={cn("mt-8 h-28 w-full text-accent/25", !reduce && "drop-shadow-[0_0_24px_rgba(34,211,238,0.12)]")}
              viewBox="0 0 120 100"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <path fill="none" stroke="currentColor" strokeWidth="1.4" d="M35 78 Q50 52 62 48 Q78 42 88 38 Q96 50 92 62 Q88 78 72 82" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
