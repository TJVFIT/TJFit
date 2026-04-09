"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { TJAIShell } from "@/components/tjai/tjai-shell";
import type { Locale } from "@/lib/i18n";
import type { TJAIPlan } from "@/lib/tjai-types";
import { cn } from "@/lib/utils";

const COPY = {
  en: {
    loading: "Loading your plan...",
    buildTitle: "Build Your 12-Week Plan",
    buildSub: "Answer 19 questions. TJAI does the rest in minutes.",
    start: "Start Building",
    oneTime: "Or get just your plan — one time (€9.99)",
    note: "~5 minutes · Completely personalized · Science-based",
    dailyCalories: "Daily calories",
    proteinTarget: "Protein target",
    trainingDays: "Training days/week",
    goal: "Goal",
    workout: "Workout",
    nutrition: "Nutrition",
    dailyTotals: "Daily totals",
    downloadPdf: "Download as PDF",
    regenerate: "Regenerate Plan",
    days: "days",
    transformation: "Transformation"
  },
  tr: {
    loading: "Planim yukleniyor...",
    buildTitle: "12 Haftalik Planini Olustur",
    buildSub: "19 soruyu cevapla. TJAI kalanini dakikalar icinde yapar.",
    start: "Olusturmaya Basla",
    oneTime: "Veya sadece planini al — tek seferlik (€9.99)",
    note: "~5 dakika · Tamamen kisisel · Bilim temelli",
    dailyCalories: "Gunluk kalori",
    proteinTarget: "Protein hedefi",
    trainingDays: "Antrenman gunu/hafta",
    goal: "Hedef",
    workout: "Antrenman",
    nutrition: "Beslenme",
    dailyTotals: "Gunluk toplamlar",
    downloadPdf: "PDF olarak indir",
    regenerate: "Plani yenile",
    days: "gun",
    transformation: "Donusum"
  },
  ar: {
    loading: "جارٍ تحميل خطتك...",
    buildTitle: "ابنِ خطتك لمدة 12 أسبوعاً",
    buildSub: "أجب عن 19 سؤالاً وTJAI يتكفّل بالباقي خلال دقائق.",
    start: "ابدأ البناء",
    oneTime: "أو احصل على خطتك فقط — مرة واحدة (€9.99)",
    note: "~5 دقائق · مخصص بالكامل · مبني على العلم",
    dailyCalories: "سعرات يومية",
    proteinTarget: "هدف البروتين",
    trainingDays: "أيام التدريب/الأسبوع",
    goal: "الهدف",
    workout: "التمرين",
    nutrition: "التغذية",
    dailyTotals: "إجمالي اليوم",
    downloadPdf: "تحميل PDF",
    regenerate: "إعادة توليد الخطة",
    days: "أيام",
    transformation: "تحول"
  },
  es: {
    loading: "Cargando tu plan...",
    buildTitle: "Crea tu Plan de 12 Semanas",
    buildSub: "Responde 19 preguntas. TJAI hace el resto en minutos.",
    start: "Comenzar",
    oneTime: "O consigue solo tu plan — pago unico (€9.99)",
    note: "~5 minutos · Totalmente personalizado · Basado en ciencia",
    dailyCalories: "Calorias diarias",
    proteinTarget: "Objetivo de proteina",
    trainingDays: "Dias de entrenamiento/semana",
    goal: "Objetivo",
    workout: "Entrenamiento",
    nutrition: "Nutricion",
    dailyTotals: "Totales diarios",
    downloadPdf: "Descargar PDF",
    regenerate: "Regenerar plan",
    days: "dias",
    transformation: "Transformacion"
  },
  fr: {
    loading: "Chargement de votre plan...",
    buildTitle: "Construisez votre plan sur 12 semaines",
    buildSub: "Repondez a 19 questions. TJAI fait le reste en quelques minutes.",
    start: "Commencer",
    oneTime: "Ou obtenez uniquement votre plan — en une fois (€9.99)",
    note: "~5 minutes · Entierement personnalise · Base sur la science",
    dailyCalories: "Calories quotidiennes",
    proteinTarget: "Objectif proteines",
    trainingDays: "Jours d'entrainement/semaine",
    goal: "Objectif",
    workout: "Entrainement",
    nutrition: "Nutrition",
    dailyTotals: "Totaux journaliers",
    downloadPdf: "Telecharger en PDF",
    regenerate: "Regenerer le plan",
    days: "jours",
    transformation: "Transformation"
  }
} as const;

export function TJAIMyPlanTab({ locale }: { locale: Locale }) {
  const t = COPY[locale] ?? COPY.en;
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
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 5000);
      try {
        const [plansRes, accessRes] = await Promise.all([
          fetch("/api/tjai/save", { credentials: "include", cache: "no-store", signal: controller.signal }),
          fetch("/api/tjai/access", { credentials: "include", cache: "no-store", signal: controller.signal })
        ]);
        window.clearTimeout(timeout);
        const plansData = await plansRes.json().catch(() => ({}));
        const accessData = await accessRes.json().catch(() => ({}));
        const latest = (plansData?.plans?.[0]?.plan_json ?? null) as TJAIPlan | null;
        setPlan(latest);
        setCanRegenerate(Boolean(accessData?.canRegeneratePlan));
        setCanDownloadPdf(Boolean(accessData?.canDownloadPdf));
      } catch {
        // Timeout or network error — show empty state so user can start the quiz
        window.clearTimeout(timeout);
        setPlan(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const activePhase = plan?.diet?.weeks?.[phaseIdx];
  const activeDay = activePhase?.days?.[dayIdx];

  const summaryCards = useMemo(
    () =>
      plan
        ? [
            { label: t.dailyCalories, value: `${plan.summary.calorieTarget} kcal` },
            { label: t.proteinTarget, value: `${plan.summary.protein}g` },
            { label: t.trainingDays, value: `7 ${t.days}` },
            { label: t.goal, value: String(plan.summary.timeToGoal || t.transformation) }
          ]
        : [],
    [plan, t.dailyCalories, t.goal, t.proteinTarget, t.trainingDays, t.days, t.transformation]
  );

  if (showBuilder) {
    return <TJAIShell locale={locale} />;
  }

  if (loading) {
    return <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6 text-sm text-zinc-400">{t.loading}</div>;
  }

  if (!plan) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <div className="w-full max-w-xl rounded-2xl border border-[#1E2028] bg-[#111215] p-8 text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/10 text-[#22D3EE] shadow-[0_0_24px_rgba(34,211,238,0.35)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-2xl font-bold text-white">{t.buildTitle}</h3>
          <p className="mt-2 text-sm text-zinc-400">{t.buildSub}</p>
          <button type="button" onClick={() => setShowBuilder(true)} className="mt-5 rounded-full bg-[#22D3EE] px-5 py-2 text-sm font-semibold text-[#09090B]">
            {t.start}
          </button>
          <a href={`/${locale}/membership?tjai_onetime=1`} className="mt-3 inline-flex rounded-full border border-[#1E2028] px-4 py-2 text-xs text-zinc-300">
            {t.oneTime}
          </a>
          <p className="mt-3 text-xs text-zinc-500">{t.note}</p>
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
              <h4 className="font-semibold text-white">{t.workout}</h4>
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
              <h4 className="font-semibold text-white">{t.nutrition}</h4>
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
                {t.dailyTotals}: {activeDay.totals.calories} kcal · P {activeDay.totals.protein} · C {activeDay.totals.carbs} · F {activeDay.totals.fat}
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
          {t.downloadPdf}
        </button>
        <button
          type="button"
          disabled={!canRegenerate}
          onClick={() => setShowBuilder(true)}
          className="rounded-full border border-[#1E2028] px-4 py-2 text-sm text-zinc-200 disabled:opacity-50"
        >
          {t.regenerate}
        </button>
      </div>
    </div>
  );
}
