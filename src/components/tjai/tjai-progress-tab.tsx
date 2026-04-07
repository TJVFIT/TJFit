"use client";

import { useEffect, useState } from "react";

export function TJAIProgressTab({ locale = "en" }: { locale?: string }) {
  const isArabic = locale === "ar";
  const t = isArabic
    ? {
        loading: "جارٍ تحميل التقدم...",
        empty: "لا توجد بيانات تقدم بعد.",
        completion: "إكمال الخطة",
        week: "الأسبوع",
        of: "من",
        complete: "مكتمل",
        macro: "الالتزام بالمغذيات",
        protein: "البروتين",
        calories: "السعرات",
        daysHit: "من الأيام حققت الهدف",
        inRange: "ضمن النطاق",
        insight: "رؤية TJAI الأسبوعية",
        nextWorkouts: "أيام التمرين الثلاثة القادمة"
      }
    : {
        loading: "Loading progress...",
        empty: "No progress data yet.",
        completion: "Plan completion",
        week: "Week",
        of: "of",
        complete: "complete",
        macro: "Macro adherence",
        protein: "Protein",
        calories: "Calories",
        daysHit: "of days hit target",
        inRange: "in range",
        insight: "TJAI weekly insight",
        nextWorkouts: "Next 3 workout days"
      };
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    void fetch("/api/tjai/progress", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6 text-sm text-zinc-400">{t.loading}</div>;
  if (!data) return <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6 text-sm text-zinc-400">{t.empty}</div>;

  const dots = Array.from({ length: 7 }).map((_, i) => i < Number(data.completion.logged_days_this_week ?? 0));

  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">{t.completion}</h3>
          <p className="mt-3 text-3xl font-bold text-[#22D3EE]">
            {t.week} {data.completion.current_week} {t.of} {data.completion.total_weeks}
          </p>
          <p className="text-sm text-zinc-400">{data.completion.percent}% {t.complete}</p>
          <div className="mt-3 flex gap-2">
            {dots.map((filled, idx) => (
              <span key={idx} className={`h-2.5 w-2.5 rounded-full ${filled ? "bg-[#22D3EE]" : "bg-[#1E2028]"}`} />
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">{t.macro}</h3>
          <p className="mt-3 text-sm text-zinc-300">{t.protein}: {data.macro_adherence.protein_hit_percent}% {t.daysHit}</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#1E2028]">
            <div className="h-full bg-[#22D3EE]" style={{ width: `${data.macro_adherence.protein_hit_percent}%` }} />
          </div>
          <p className="mt-3 text-sm text-zinc-300">{t.calories}: {data.macro_adherence.calorie_hit_percent}% {t.inRange}</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#1E2028]">
            <div className="h-full bg-[#A78BFA]" style={{ width: `${data.macro_adherence.calorie_hit_percent}%` }} />
          </div>
        </article>
      </section>

      <article className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">{t.insight}</h3>
        <p className="mt-3 text-sm text-zinc-300">{data.weekly_insight}</p>
      </article>

      <article className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">{t.nextWorkouts}</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {(data.next_workouts ?? []).map((day: any, idx: number) => (
            <div key={`${day.day}-${idx}`} className="rounded-xl border border-[#1E2028] bg-[#0E0F12] p-3">
              <p className="text-sm font-semibold text-white">{day.day}</p>
              <p className="mt-1 text-xs text-zinc-500">{day.label}</p>
              <p className="mt-2 text-xs text-zinc-400">{(day.exercises ?? []).slice(0, 2).map((x: any) => x.name).join(" · ")}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
