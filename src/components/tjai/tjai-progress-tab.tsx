"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EvalRecommendation = {
  type: string;
  action: string;
  reason: string;
};

type EvalResult = {
  shouldAdapt: boolean;
  urgency: "low" | "medium" | "high";
  headline: string;
  findings: string[];
  recommendations: EvalRecommendation[];
  triggerRegen: boolean;
  regenReason: string | null;
};

type EvalData = {
  hasEnoughData: boolean;
  evaluation: EvalResult | null;
  weeksSincePlan?: number;
  actualWeeklyChange?: number;
  projectedWeeklyChange?: number;
  workoutsPerWeek?: number;
  error?: string;
};

type ProgressData = {
  completion: {
    current_week: number;
    total_weeks: number;
    percent: number;
    logged_days_this_week: number;
  };
  macro_adherence: {
    protein_hit_percent: number;
    calorie_hit_percent: number;
  };
  body_metrics: {
    starting_weight: number | null;
    current_weight: number | null;
    change_kg: number | null;
    sparkline: number[];
  };
  weekly_insight: string;
  next_workouts: Array<{
    day: string;
    label: string;
    exercises: Array<{ name: string }>;
  }>;
  current_streak: number;
};

export function TJAIProgressTab({ locale = "en" }: { locale?: string }) {
  const router = useRouter();
  const isArabic = locale === "ar";
  const t = isArabic
    ? {
        loading: "جارٍ تحميل التقدم...",
        empty: "لا توجد بيانات تقدم بعد.",
        completion: "إكمال الخطة",
        bodyMetrics: "قياسات الجسم",
        week: "الأسبوع",
        of: "من",
        complete: "مكتمل",
        macro: "الالتزام بالمغذيات",
        macroPending: "سيظهر التزام التغذية بعد ربط تسجيل الطعام.",
        protein: "البروتين",
        calories: "السعرات",
        daysHit: "من الأيام حققت الهدف",
        inRange: "ضمن النطاق",
        insight: "رؤية TJAI الأسبوعية",
        nextWorkouts: "أيام التمرين الثلاثة القادمة",
        planCheck: "مراجعة الخطة",
        updatePlan: "تحديث خطتي"
      }
    : {
        loading: "Loading progress...",
        empty: "No progress data yet.",
        completion: "Plan completion",
        bodyMetrics: "Body metrics",
        week: "Week",
        of: "of",
        complete: "complete",
        macro: "Macro adherence",
        macroPending: "Nutrition adherence will appear after food logging is connected.",
        protein: "Protein",
        calories: "Calories",
        daysHit: "of days hit target",
        inRange: "in range",
        insight: "TJAI weekly insight",
        nextWorkouts: "Next 3 workout days",
        planCheck: "TJAI Plan Check",
        updatePlan: "Update My Plan →"
      };

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressData | null>(null);
  const [evalData, setEvalData] = useState<EvalData | null>(null);

  useEffect(() => {
    void fetch("/api/tjai/progress", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: ProgressData | null) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Task 6 — fetch adaptive evaluation after progress data loads
  useEffect(() => {
    void fetch("/api/tjai/evaluate-progress", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: EvalData | null) => setEvalData(json))
      .catch(() => { /* evaluation failure is non-critical */ });
  }, []);

  if (loading) return <div className="rounded-2xl border border-divider bg-surface p-6 text-sm text-muted">{t.loading}</div>;
  if (!data) return <div className="rounded-2xl border border-divider bg-surface p-6 text-sm text-muted">{t.empty}</div>;

  const dots = Array.from({ length: 7 }).map((_, i) => i < Number(data.completion.logged_days_this_week ?? 0));

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-divider bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-faint">{t.completion}</h3>
          <p className="mt-3 text-3xl font-bold text-accent">
            {t.week} {data.completion.current_week} {t.of} {data.completion.total_weeks}
          </p>
          <p className="text-sm text-muted">{data.completion.percent}% {t.complete}</p>
          <div className="mt-3 flex gap-2">
            {dots.map((filled, idx) => (
              <span key={idx} className={`h-2.5 w-2.5 rounded-full ${filled ? "bg-accent" : "bg-divider"}`} />
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-divider bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-faint">{t.bodyMetrics}</h3>
          <p className="mt-3 text-sm text-bright">
            {data.body_metrics.current_weight != null ? `${data.body_metrics.current_weight} kg` : t.empty}
          </p>
          <p className="mt-1 text-xs text-faint">
            {data.body_metrics.change_kg != null
              ? `${data.body_metrics.change_kg > 0 ? "+" : ""}${data.body_metrics.change_kg} kg from start`
              : "Need more weight logs"}
          </p>
          {data.body_metrics.sparkline.length > 1 ? (
            <div className="mt-3 flex items-end gap-1 rounded-xl border border-divider bg-surface-2 p-3">
              {data.body_metrics.sparkline.map((value, idx, arr) => {
                const min = Math.min(...arr);
                const max = Math.max(...arr);
                const height = max === min ? 28 : 14 + ((value - min) / (max - min)) * 42;
                return <span key={idx} className="w-2 rounded-full bg-accent" style={{ height }} />;
              })}
            </div>
          ) : null}
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-divider bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-faint">{t.macro}</h3>
          {data.macro_adherence.protein_hit_percent === 0 && data.macro_adherence.calorie_hit_percent === 0 ? (
            <p className="mt-3 text-sm text-muted">{t.macroPending}</p>
          ) : (
            <>
              <p className="mt-3 text-sm text-bright">{t.protein}: {data.macro_adherence.protein_hit_percent}% {t.daysHit}</p>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-divider">
                <div className="h-full bg-accent" style={{ width: `${data.macro_adherence.protein_hit_percent}%` }} />
              </div>
              <p className="mt-3 text-sm text-bright">{t.calories}: {data.macro_adherence.calorie_hit_percent}% {t.inRange}</p>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-divider">
                <div className="h-full bg-accent-violet" style={{ width: `${data.macro_adherence.calorie_hit_percent}%` }} />
              </div>
            </>
          )}
        </article>
      </section>

      <article className="rounded-2xl border border-divider bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-faint">{t.insight}</h3>
        <p className="mt-3 text-sm text-bright">{data.weekly_insight}</p>
      </article>

      <article className="rounded-2xl border border-divider bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-faint">{t.nextWorkouts}</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {(data.next_workouts ?? []).map((day, idx) => (
            <div key={`${day.day}-${idx}`} className="rounded-xl border border-divider bg-surface-2 p-3">
              <p className="text-sm font-semibold text-white">{day.day}</p>
              <p className="mt-1 text-xs text-faint">{day.label}</p>
              <p className="mt-2 text-xs text-muted">
                {(day.exercises ?? []).slice(0, 2).map((x) => x.name).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </article>

      {/* Task 6 — Adaptive plan evaluation card */}
      {evalData?.hasEnoughData && evalData?.evaluation?.shouldAdapt && (
        <article className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">⚡</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-orange-400">
                {t.planCheck}
              </h3>
              <p className="mt-1 text-sm font-medium text-white">
                {evalData.evaluation.headline}
              </p>
              {evalData.evaluation.findings.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {evalData.evaluation.findings.slice(0, 2).map((finding, i) => (
                    <li key={i} className="text-xs text-muted">• {finding}</li>
                  ))}
                </ul>
              )}
              <ul className="mt-3 space-y-1.5">
                {evalData.evaluation.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-bright">
                    <span className="font-semibold text-orange-400">{rec.type.toUpperCase()}: </span>
                    {rec.action}
                  </li>
                ))}
              </ul>
              {evalData.evaluation.triggerRegen && (
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/ai?regen=1`)}
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-orange-500/40 bg-orange-500/15 px-5 py-2 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500/25"
                >
                  {t.updatePlan}
                </button>
              )}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
