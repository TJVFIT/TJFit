"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { TJAIShell } from "@/components/tjai/tjai-shell";
import type { Locale } from "@/lib/i18n";
import type { TJAIPlan } from "@/lib/tjai-types";
import { cn } from "@/lib/utils";

export function TJAIMyPlanTab({ locale }: { locale: Locale }) {
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [plan, setPlan] = useState<TJAIPlan | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [dayIdx, setDayIdx] = useState(0);
  const [canRegenerate, setCanRegenerate] = useState(false);
  const [canDownloadPdf, setCanDownloadPdf] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [plansRes, accessRes] = await Promise.all([
        fetch("/api/tjai/save", { credentials: "include", cache: "no-store" }),
        fetch("/api/tjai/access", { credentials: "include", cache: "no-store" })
      ]);
      const plansData = await plansRes.json().catch(() => ({}));
      const accessData = await accessRes.json().catch(() => ({}));
      const latest = (plansData?.plans?.[0]?.plan_json ?? null) as TJAIPlan | null;
      setPlan(latest);
      setCanRegenerate(Boolean(accessData?.canRegeneratePlan));
      setCanDownloadPdf(Boolean(accessData?.canDownloadPdf));
      setLoading(false);
    };
    void load();
  }, []);

  const activePhase = plan?.diet?.weeks?.[phaseIdx];
  const activeDay = activePhase?.days?.[dayIdx];

  const summaryCards = useMemo(
    () =>
      plan
        ? [
            { label: "Daily calories", value: `${plan.summary.calorieTarget} kcal` },
            { label: "Protein target", value: `${plan.summary.protein}g` },
            { label: "Training days/week", value: "7 days" },
            { label: "Goal", value: String(plan.summary.timeToGoal || "Transformation") }
          ]
        : [],
    [plan]
  );

  if (showBuilder) {
    return <TJAIShell locale={locale} />;
  }

  if (loading) {
    return <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6 text-sm text-zinc-400">Loading your plan...</div>;
  }

  if (!plan) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <div className="w-full max-w-xl rounded-2xl border border-[#1E2028] bg-[#111215] p-8 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-[#22D3EE] shadow-[0_0_24px_rgba(34,211,238,0.35)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-2xl font-bold text-white">Build Your 12-Week Plan</h3>
          <p className="mt-2 text-sm text-zinc-400">Answer 19 questions. TJAI does the rest in minutes.</p>
          <button type="button" onClick={() => setShowBuilder(true)} className="mt-5 rounded-full bg-[#22D3EE] px-5 py-2 text-sm font-semibold text-[#09090B]">
            Start Building
          </button>
          <a href={`/${locale}/membership?tjai_onetime=1`} className="mt-3 inline-flex rounded-full border border-[#1E2028] px-4 py-2 text-xs text-zinc-300">
            Or get just your plan — one time (€9.99)
          </a>
          <p className="mt-3 text-xs text-zinc-500">~5 minutes · Completely personalized · Science-based</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        {summaryCards.map((item) => (
          <article key={item.label} className="rounded-xl border border-[#1E2028] bg-[#111215] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{item.label}</p>
            <p className="mt-1 text-lg font-bold text-white">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[#1E2028] bg-[#111215] p-4">
        <div className="flex flex-wrap gap-2">
          {plan.diet.weeks.map((week, idx) => (
            <button
              key={`${week.weekRange}-${idx}`}
              type="button"
              onClick={() => {
                setPhaseIdx(idx);
                setDayIdx(0);
              }}
              className={cn("rounded-full border px-3 py-1.5 text-xs", idx === phaseIdx ? "border-[#22D3EE] bg-[rgba(34,211,238,0.08)] text-white" : "border-[#1E2028] text-zinc-400")}
            >
              {week.weekRange}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(activePhase?.days ?? []).map((day, idx) => (
            <button
              key={`${day.label}-${idx}`}
              type="button"
              onClick={() => setDayIdx(idx)}
              className={cn("rounded-full border px-3 py-1.5 text-xs", idx === dayIdx ? "border-[#22D3EE] bg-[rgba(34,211,238,0.08)] text-white" : "border-[#1E2028] text-zinc-400")}
            >
              {day.label}
            </button>
          ))}
        </div>

        {activeDay ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-[#1E2028] bg-[#0E0F12] p-4">
              <h4 className="font-semibold text-white">Workout</h4>
              <div className="mt-2 space-y-2">
                {(plan.program.weeks[phaseIdx]?.days[dayIdx]?.exercises ?? []).map((exercise) => (
                  <div key={`${exercise.name}-${exercise.reps}`} className="rounded-lg border border-[#1E2028] p-2 text-sm text-zinc-300">
                    <p className="font-medium text-white">{exercise.name}</p>
                    <p className="text-xs text-zinc-500">
                      {exercise.sets} sets · {exercise.reps} reps · {exercise.rest}
                    </p>
                  </div>
                ))}
              </div>
            </article>
            <article className="rounded-xl border border-[#1E2028] bg-[#0E0F12] p-4">
              <h4 className="font-semibold text-white">Nutrition</h4>
              <div className="mt-2 space-y-2">
                {activeDay.meals.map((meal) => (
                  <div key={`${meal.name}-${meal.time}`} className="rounded-lg border border-[#1E2028] p-2 text-sm text-zinc-300">
                    <p className="font-medium text-white">{meal.name}</p>
                    <p className="text-xs text-zinc-500">
                      {meal.calories} kcal · P {meal.protein} / C {meal.carbs} / F {meal.fat}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                Daily totals: {activeDay.totals.calories} kcal · P {activeDay.totals.protein} · C {activeDay.totals.carbs} · F {activeDay.totals.fat}
              </p>
            </article>
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canDownloadPdf}
          onClick={() => window.open("/api/tjai/generate-pdf", "_blank")}
          className="rounded-full border border-[#1E2028] px-4 py-2 text-sm text-zinc-200 disabled:opacity-50"
        >
          Download as PDF
        </button>
        <button
          type="button"
          disabled={!canRegenerate}
          onClick={() => setShowBuilder(true)}
          className="rounded-full border border-[#1E2028] px-4 py-2 text-sm text-zinc-200 disabled:opacity-50"
        >
          Regenerate Plan
        </button>
      </div>
    </div>
  );
}
