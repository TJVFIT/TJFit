"use client";

import { cn } from "@/lib/utils";

const steps = [
  {
    n: 1,
    title: "Define your target",
    body: "Goals, schedule, equipment, constraints. Captured once, respected everywhere."
  },
  {
    n: 2,
    title: "TJAI builds the system",
    body: "Metabolism-aware training blocks, meals, and progression — the way a real coach plans."
  },
  {
    n: 3,
    title: "Train with precision",
    body: "Log work, adapt loads, stay consistent. Twelve weeks of compounding output."
  }
];

/**
 * "How it works" — editorial three-step layout. No glow, no glass.
 * Numbered rule above the title; content arranged on a strict baseline.
 */
export function CinematicHowItWorks() {
  return (
    <section className="reveal-section relative border-t border-white/[0.06] bg-[#08080A] px-6 py-[clamp(4rem,9vw,8rem)] lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">How it works</p>
            <h2 className="mt-4 font-display text-[clamp(28px,4.6vw,52px)] font-semibold leading-[1.04] tracking-[-0.02em] text-white">
              From intake to execution.
            </h2>
          </div>
          <p className="max-w-xl self-end text-[15px] leading-[1.65] text-white/55">
            Three disciplined layers. No novelty UI. A pipeline that respects physiology and your calendar.
          </p>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="relative flex flex-col gap-4 bg-[#0A0B0E] p-7">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[12px] font-medium text-accent">
                  {String(s.n).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-white/[0.08]" aria-hidden />
              </div>
              <h3 className="font-display text-[18px] font-semibold leading-tight tracking-tight text-white sm:text-[20px]">
                {s.title}
              </h3>
              <p className="max-w-[28ch] text-[13px] leading-[1.6] text-white/60">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * Before / after editorial split. Two columns separated by a thin "12 weeks" rule.
 * No glass card or glow drop-shadows.
 */
export function CinematicTransformation({ reduce }: { reduce: boolean }) {
  return (
    <section className="reveal-section relative border-t border-white/[0.06] bg-[#08080A] px-6 py-[clamp(4rem,9vw,8rem)] lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-baseline justify-between gap-6 border-b border-white/[0.06] pb-4">
          <h2 className="font-display text-[clamp(24px,3.6vw,40px)] font-semibold tracking-tight text-white">
            What twelve weeks looks like.
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">Before / after</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
          <div className="border-l-2 border-red-400/30 bg-gradient-to-br from-red-500/[0.04] to-transparent p-7 md:p-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-300/85">Week 1</p>
            <p className="mt-4 text-[14px] leading-[1.65] text-white/70">
              Baseline load, habit wiring, honest volume. No hero weeks. We measure where you actually are, not where ego says you should be.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 border-y border-white/[0.06] py-5 md:border-x md:border-y-0 md:py-0 md:px-2">
            <div className="h-14 w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">12 weeks</span>
            <div className="h-14 w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent" />
          </div>

          <div
            className={cn(
              "border-r-2 border-accent/40 bg-gradient-to-bl from-accent/[0.05] to-transparent p-7 md:p-9",
              !reduce && "transition-colors"
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Week 12</p>
            <p className="mt-4 text-[14px] leading-[1.65] text-white/85">
              Progressive overload you can feel. Strength, composition, and consistency compound. The plan adapts when you do.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
