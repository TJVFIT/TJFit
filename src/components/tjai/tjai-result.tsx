"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

import { CoachReviewRequest } from "@/components/tjai/coach-review-request";
import { ShareCardGenerator } from "@/components/tjai/share-card-generator";
import { TJAIChat } from "@/components/tjai/tjai-chat";
import { useInView } from "@/hooks/useInView";
import { buildTjaiDecisionReasons } from "@/lib/tjai-explanations";
import { cn } from "@/lib/utils";
import type { QuizAnswers, TJAICopy, TJAIGroceryList, TJAIMeal, TJAIMealPrepTask, TJAIMetrics, TJAIPlan } from "@/lib/tjai-types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

type Props = {
  copy: TJAICopy;
  plan: TJAIPlan;
  answers: QuizAnswers;
  metrics: TJAIMetrics;
  generatedAt: string;
  onSave: (planOverride?: TJAIPlan) => Promise<void>;
  onStartOver: () => void;
  isSaving: boolean;
  coreLimitedChat?: boolean;
  onChatLimitReached?: () => void;
};

export function TJAIResult({
  copy,
  plan,
  answers,
  metrics,
  generatedAt,
  onSave,
  onStartOver,
  isSaving,
  coreLimitedChat = false,
  onChatLimitReached
}: Props) {
  const [dietTab, setDietTab] = useState(0);
  const [dietDayTab, setDietDayTab] = useState(0);
  const [programTab, setProgramTab] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "ok" | "err">("idle");
  const [swapState, setSwapState] = useState<{ meal: TJAIMeal; alternatives: TJAIMeal[]; loading: boolean; dayIndex: number; mealIndex: number } | null>(null);
  const [mutablePlan, setMutablePlan] = useState<TJAIPlan>(plan);
  const [recipeOpen, setRecipeOpen] = useState<Record<string, boolean>>({});
  const [suppOpen, setSuppOpen] = useState({ t1: true, t2: true, t3: true });
  const [cheatOpen, setCheatOpen] = useState(false);
  const [grocery, setGrocery] = useState<TJAIGroceryList | null>(null);
  const [mealPrep, setMealPrep] = useState<{ totalTime?: string; equipment?: string[]; timeline?: TJAIMealPrepTask[] } | null>(null);
  const [loadingGrocery, setLoadingGrocery] = useState(false);
  const [loadingMealPrep, setLoadingMealPrep] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);
  const dietRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const extrasRef = useRef<HTMLDivElement>(null);
  const inSummary = useInView(summaryRef, { threshold: 0.1, once: true });
  const inDiet = useInView(dietRef, { threshold: 0.1, once: true });
  const inProgram = useInView(programRef, { threshold: 0.1, once: true });
  const inExtras = useInView(extrasRef, { threshold: 0.1, once: true });

  const activeDietPhase = mutablePlan.diet.weeks[dietTab];
  const activeDietDay = activeDietPhase?.days?.[dietDayTab];
  const activeProgramPhase = mutablePlan.program.weeks[programTab];

  const summaryCards = useMemo(
    () => [
      { label: copy.result.metrics.calories, value: mutablePlan.summary?.calorieTarget ?? metrics.calorieTarget, unit: "kcal" },
      { label: copy.result.metrics.protein, value: mutablePlan.summary?.protein ?? metrics.protein, unit: "g" },
      { label: copy.result.metrics.fat, value: mutablePlan.summary?.fat ?? metrics.fat, unit: "g" },
      { label: copy.result.metrics.carbs, value: mutablePlan.summary?.carbs ?? metrics.carbs, unit: "g" }
    ],
    [copy, metrics, mutablePlan.summary]
  );

  const handleSave = async () => {
    setSaveStatus("idle");
    try {
      await onSave(mutablePlan);
      setSaveStatus("ok");
    } catch {
      setSaveStatus("err");
    }
  };

  useEffect(() => {
    setMutablePlan(plan);
  }, [plan]);

  const openSwap = async (meal: TJAIMeal, dayIndex: number, mealIndex: number) => {
    setSwapState({ meal, alternatives: [], loading: true, dayIndex, mealIndex });
    const restrictions = [
      ...(Array.isArray(answers.s12_foods_hate) ? answers.s12_foods_hate : [String(answers.s12_foods_hate ?? "")]),
      ...(Array.isArray(answers.s13_allergies) ? answers.s13_allergies : [String(answers.s13_allergies ?? "")]),
      String(answers.s13_religious ?? "")
    ].filter(Boolean);
    const response = await fetch("/api/tjai/swap-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalMeal: meal,
        planContext: {
          goal: answers.s2_goal,
          calorieTarget: metrics.calorieTarget,
          protein: metrics.protein,
          carbs: metrics.carbs,
          fat: metrics.fat,
          preferences: String(answers.s12_foods_like ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          restrictions,
          budget: answers.s14_budget,
          phase: activeDietPhase?.phase
        }
      })
    });
    const data = await response.json().catch(() => ({ alternatives: [] }));
    setSwapState((prev) => (prev ? { ...prev, loading: false, alternatives: data.alternatives ?? [] } : prev));
  };

  const chooseSwap = (meal: TJAIMeal) => {
    if (!swapState) return;
    setMutablePlan((prev) => {
      const next = structuredClone(prev) as TJAIPlan;
      const phase = next.diet.weeks[dietTab];
      const day = phase?.days?.[swapState.dayIndex];
      if (day?.meals?.[swapState.mealIndex]) day.meals[swapState.mealIndex] = meal;
      return next;
    });
    setSwapState(null);
  };

  const generateGrocery = async () => {
    setLoadingGrocery(true);
    try {
      const response = await fetch("/api/tjai/grocery-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: activeDietPhase })
      });
      const data = await response.json();
      setGrocery({ categories: data.categories ?? [] });
    } finally {
      setLoadingGrocery(false);
    }
  };

  const generateMealPrep = async () => {
    setLoadingMealPrep(true);
    try {
      const response = await fetch("/api/tjai/meal-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: activeDietPhase })
      });
      const data = await response.json();
      setMealPrep(data);
    } finally {
      setLoadingMealPrep(false);
    }
  };

  const exportPdf = async () => {
    setLoadingPdf(true);
    try {
      // Detect routing locale from URL (client) so server renders the correct locale label.
      let routingLocale = "en";
      if (typeof window !== "undefined") {
        const seg = window.location.pathname.split("/").filter(Boolean)[0] ?? "";
        if (/^(en|tr|ar|es|fr|de|pt|ru|hi|id)$/.test(seg)) routingLocale = seg;
      }

      const response = await fetch("/api/tjai/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: mutablePlan,
          metrics,
          answers,
          locale: routingLocale,
          generatedAt
        })
      });

      if (response.ok && response.headers.get("content-type")?.includes("application/pdf")) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const cd = response.headers.get("content-disposition") ?? "";
        const match = /filename="?([^";]+)"?/i.exec(cd);
        a.download = match?.[1] ?? `tjai-plan-${routingLocale}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }

      // Server said no — fall back to a client-side minimal PDF so the user still gets something.
      const pdf = new jsPDF();
      pdf.setFontSize(22);
      pdf.text("Your TJAI Transformation Plan", 14, 24);
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date(generatedAt).toLocaleDateString()}`, 14, 34);
      pdf.text(`Goal: ${String(answers.s2_goal ?? "")}`, 14, 42);
      pdf.text(`Calories: ${metrics.calorieTarget} kcal`, 14, 50);
      pdf.text(`Protein: ${metrics.protein}g  Carbs: ${metrics.carbs}g  Fat: ${metrics.fat}g`, 14, 58);
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Diet Plan", 14, 20);
      let y = 30;
      mutablePlan.diet.weeks.forEach((week) => {
        if (y > 260) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFontSize(13);
        pdf.text(`${week.weekRange} - ${week.phase}`, 14, y);
        y += 8;
        week.days.forEach((day) => {
          if (y > 260) {
            pdf.addPage();
            y = 20;
          }
          pdf.setFontSize(11);
          pdf.text(day.label, 16, y);
          y += 6;
          day.meals.forEach((meal) => {
            pdf.text(`- ${meal.name} (${meal.calories} kcal)`, 20, y);
            y += 5;
          });
          y += 3;
        });
      });
      pdf.save(`tjai-plan-${routingLocale}.pdf`);
    } catch (err) {
      console.error("[TJAI] PDF export failed:", err);
    } finally {
      setLoadingPdf(false);
    }
  };

  const lineData = {
    labels: metrics.weightCurve.map((_, i) => `W${i}`),
    datasets: [
      { label: "Projected", data: metrics.weightCurve, borderColor: "#22D3EE", backgroundColor: "rgba(34,211,238,0.12)", tension: 0.35, fill: true },
      { label: "No action", data: metrics.weightCurve.map(() => Number(answers.s1_weight ?? 0)), borderColor: "rgba(239,68,68,0.4)", borderDash: [6, 6], tension: 0.2 }
    ]
  };
  const pieData = {
    labels: ["Protein", "Carbs", "Fat"],
    datasets: [{ data: [metrics.protein * 4, metrics.carbs * 4, metrics.fat * 9], backgroundColor: ["#22D3EE", "#A78BFA", "rgba(255,255,255,0.35)"], borderWidth: 0 }]
  };
  const decisionReasons = useMemo(() => buildTjaiDecisionReasons(answers, metrics), [answers, metrics]);

  return (
    <section className="bg-[#09090B] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-8">

        {/* Medical disclaimer */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <span className="mt-0.5 shrink-0 text-amber-400">⚠️</span>
          <p className="text-xs text-amber-200/80">
            Consult a physician before starting any new training or nutrition program. TJAI generates personalized guidance but is not a substitute for professional medical advice.
          </p>
        </div>

        <div ref={summaryRef} className={cn("plan-result reveal-up", inSummary && "is-in")}>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#22D3EE]">{copy.result.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{mutablePlan.summary?.greeting}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#A1A1AA]">{mutablePlan.summary?.keyInsight}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summaryCards.map((card, i) => (
              <article
                key={card.label}
                className={cn(
                  "rounded-xl border border-[#1E2028] bg-[linear-gradient(135deg,#111215,#0D0F12)] p-5 reveal-up shadow-[0_2px_12px_rgba(0,0,0,0.3)]",
                  inSummary && "is-in",
                  i === 0 && "delay-75",
                  i === 1 && "delay-100",
                  i === 2 && "delay-150",
                  i === 3 && "delay-200"
                )}
              >
                <div className="text-3xl font-extrabold text-[#22D3EE]">
                  {card.value}
                  <span className="ms-1 text-sm font-medium text-[#52525B]">{card.unit}</span>
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.15em] text-[#52525B]">{card.label}</div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#A1A1AA]">
            <span>
              {copy.result.metrics.water}: {mutablePlan.summary?.water ?? metrics.water}ml
            </span>
            <span>
              {copy.result.metrics.weekly}: {mutablePlan.summary?.weeklyChange ?? `${metrics.weeklyWeightChange}kg/week`}
            </span>
            <span>
              {copy.result.metrics.timeToGoal}: {mutablePlan.summary?.timeToGoal ?? metrics.timeToGoal}
            </span>
          </div>
        </div>

        <article className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
          <h3 className="text-lg font-semibold text-white">Why TJAI chose this</h3>
          <ul className="mt-4 space-y-2">
            {decisionReasons.map((reason) => (
              <li key={reason} className="flex gap-2 text-sm text-[#D4D4D8]">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22D3EE]" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </article>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
            <h3 className="text-lg font-semibold text-white">Your Transformation Forecast</h3>
            <div className="mt-3 h-[260px]">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#A1A1AA" } } }, scales: { x: { ticks: { color: "#52525B" }, grid: { color: "rgba(255,255,255,0.04)" } }, y: { ticks: { color: "#52525B" }, grid: { color: "rgba(255,255,255,0.04)" } } } }} />
            </div>
          </article>
          <article className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
            <h3 className="text-lg font-semibold text-white">Macro Split</h3>
            <div className="mt-3 h-[240px]">
              <Doughnut data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: "#A1A1AA" } } } }} />
            </div>
            <div className="mt-2 text-sm text-[#A1A1AA]">P: {metrics.protein}g | C: {metrics.carbs}g | F: {metrics.fat}g</div>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-[#A1A1AA]">Current BF% {metrics.estimatedBodyFat}%</p>
                <div className="mt-1 h-2 rounded-full bg-[#1E2028]">
                  <div className="h-full rounded-full bg-[rgba(239,68,68,0.3)]" style={{ width: `${Math.min(100, Math.max(0, metrics.estimatedBodyFat * 2))}%` }} />
                </div>
              </div>
              <div>
                <p className="text-xs text-[#A1A1AA]">Projected BF% {metrics.projectedFinalBF}%</p>
                <div className="mt-1 h-2 rounded-full bg-[#1E2028]">
                  <div className="h-full rounded-full bg-[rgba(34,211,238,0.3)]" style={{ width: `${Math.min(100, Math.max(0, metrics.projectedFinalBF * 2))}%` }} />
                </div>
              </div>
            </div>
          </article>
        </div>

        <article className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
          <h3 className="text-lg font-semibold text-white">Key Milestones</h3>
          <div className="mt-4 space-y-3">
            {[
              "Week 2: First noticeable energy improvements",
              "Week 4: Visible body composition changes begin",
              `Week ${metrics.plateauWeek || 6}: Plateau breaker week — keep going`,
              `Week 8: Midpoint — likely ${Math.abs(metrics.weeklyWeightChange * 8).toFixed(1)}kg progress`,
              `Week 12: Goal window — estimated ${metrics.projectedFinalWeight}kg`
            ].map((m) => (
              <div key={m} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#22D3EE]" />
                <p className="text-sm text-[#D4D4D8]">{m}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="rounded-xl border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.06)] p-5">
          <p className="text-sm font-semibold text-[#A78BFA]">⚡ Plateau Alert</p>
          <p className="mt-1 text-sm text-[#D4D4D8]">
            Based on your profile, most people with your metabolism plateau around Week {metrics.plateauWeek}. We already built your plateau breaker into that point.
          </p>
        </div>
        {metrics.reverseDietNeeded ? (
          <div className="rounded-xl border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.06)] p-5">
            <p className="text-sm font-semibold text-[#22D3EE]">🔄 Metabolic Reset Added</p>
            <p className="mt-1 text-sm text-[#D4D4D8]">We detected signs of adaptation. Your plan starts with a 2-week reset before the main 12-week system.</p>
          </div>
        ) : null}

        <div ref={dietRef} className={cn("reveal-up space-y-4", inDiet && "is-in")}>
          <h2 className="text-2xl font-bold">{copy.result.yourDiet}</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void generateGrocery()} className="rounded-full bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] px-4 py-2 text-sm font-bold text-[#09090B]">
              {loadingGrocery ? "Building your grocery list..." : "Generate Grocery List"}
            </button>
            <button onClick={() => void generateMealPrep()} className="rounded-full border border-[#1E2028] px-4 py-2 text-sm text-[#A1A1AA]">
              {loadingMealPrep ? "Generating..." : "Generate Meal Prep Guide"}
            </button>
            <button onClick={() => void exportPdf()} className="rounded-full border border-[#1E2028] px-4 py-2 text-sm text-[#A1A1AA]">
              {loadingPdf ? "Generating PDF..." : "Download My Plan (PDF)"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {mutablePlan.diet.weeks.map((phase, i) => (
              <button
                key={`${phase.weekRange}-${phase.phase}`}
                type="button"
                onClick={() => {
                  setDietTab(i);
                  setDietDayTab(0);
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-all",
                  i === dietTab
                    ? "border-[#22D3EE] bg-[rgba(34,211,238,0.08)] text-white"
                    : "border-[#1E2028] text-[#A1A1AA] hover:border-[#22D3EE]"
                )}
              >
                {phase.weekRange} · {phase.phase} {phase.isRefeed ? "· REFEED" : ""} {phase.isPlateauBreaker ? "· BREAKER" : ""}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(activeDietPhase?.days ?? []).map((day, i) => (
              <button
                key={`${day.label}-${i}`}
                type="button"
                onClick={() => setDietDayTab(i)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-all",
                  i === dietDayTab ? "border-[#22D3EE] bg-[#111215] text-white" : "border-[#1E2028] text-[#A1A1AA]"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {(activeDietDay?.meals ?? []).map((meal, i) => (
              <article key={`${meal.name}-${i}`} className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">{meal.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-[#A1A1AA]">
                      {meal.time} · {meal.calories} kcal
                    </div>
                    <button type="button" onClick={() => void openSwap(meal, dietDayTab, i)} className="rounded-full border border-[#1E2028] px-2 py-1 text-[11px] text-[#A1A1AA] hover:border-[#22D3EE] hover:text-[#22D3EE]">
                      ↻ Swap
                    </button>
                  </div>
                </header>
                <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-[#D4D4D8]">
                  {meal.foods.map((food) => (
                    <li key={food}>{food}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[#A1A1AA]">
                  P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fat}g
                </p>
                <p className="mt-2 text-xs italic text-[#52525B]">{meal.prepNote}</p>
                {meal.educationNote ? <p className="mt-2 rounded-lg border border-[#1E2028] bg-[#0f1116] px-3 py-2 text-xs text-[#A1A1AA]">? {meal.educationNote}</p> : null}
                <button type="button" className="mt-3 text-sm text-[#A1A1AA] hover:text-white" onClick={() => setRecipeOpen((prev) => ({ ...prev, [`${dietDayTab}-${i}`]: !prev[`${dietDayTab}-${i}`] }))}>
                  {recipeOpen[`${dietDayTab}-${i}`] ? "Hide Recipe" : "View Recipe"}
                </button>
                <div className={cn("overflow-hidden transition-all duration-300", recipeOpen[`${dietDayTab}-${i}`] ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0")}>
                  {meal.recipe ? (
                    <div className="mt-3 rounded-xl border border-[#1E2028] bg-[#0f1116] p-4">
                      <div className="flex flex-wrap gap-2 text-xs text-[#A1A1AA]">
                        <span className="rounded-full border border-[#1E2028] px-2 py-1">Prep {meal.recipe.prepTime}</span>
                        <span className="rounded-full border border-[#1E2028] px-2 py-1">Cook {meal.recipe.cookTime}</span>
                        <span className="rounded-full border border-[#1E2028] px-2 py-1">{meal.recipe.difficultyLevel}</span>
                      </div>
                      <ol className="mt-3 list-decimal space-y-1 ps-5 text-sm leading-7 text-[#D4D4D8]">
                        {(meal.recipe.steps ?? []).map((stepText) => (
                          <li key={stepText}>{stepText}</li>
                        ))}
                      </ol>
                      {meal.recipe.storageTip ? <p className="mt-3 text-xs italic text-[#A1A1AA]">{meal.recipe.storageTip}</p> : null}
                      {meal.recipe.batchNote ? <p className="mt-1 text-xs text-[#22D3EE]">{meal.recipe.batchNote}</p> : null}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {activeDietDay?.totals ? (
            <div className="rounded-xl border border-[#1E2028] bg-[#111215] p-4 text-sm text-[#D4D4D8]">
              {activeDietDay.totals.calories} kcal · P {activeDietDay.totals.protein}g · C {activeDietDay.totals.carbs}g · F{" "}
              {activeDietDay.totals.fat}g
              {activeDietDay.waterTarget ? <span className="ms-4 text-[#A1A1AA]">{activeDietDay.waterTarget}</span> : null}
            </div>
          ) : null}
        </div>

        <div ref={programRef} className={cn("reveal-up space-y-4", inProgram && "is-in")}>
          <h2 className="text-2xl font-bold">{copy.result.yourProgram}</h2>
          {(mutablePlan.program.beginnerFoundations ?? []).length ? (
            <details className="rounded-xl border border-[#1E2028] bg-[#111215] p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#22D3EE]">Fitness Fundamentals — Read This First</summary>
              <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-[#D4D4D8]">
                {mutablePlan.program.beginnerFoundations?.map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
            </details>
          ) : null}
          <div className="rounded-full border border-[#1E2028] bg-[#111215] px-4 py-2 text-sm text-[#A1A1AA]">
            {mutablePlan.program.structure}
          </div>
          <div className="flex flex-wrap gap-2">
            {mutablePlan.program.weeks.map((phase, i) => (
              <button
                key={`${phase.weekRange}-${phase.phase}`}
                type="button"
                onClick={() => setProgramTab(i)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-all",
                  i === programTab ? "border-[#22D3EE] bg-[rgba(34,211,238,0.08)] text-white" : "border-[#1E2028] text-[#A1A1AA]"
                )}
              >
                {phase.weekRange} · {phase.phase} {phase.isDeload ? "· DELOAD" : ""}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {(activeProgramPhase?.days ?? []).map((day, i) => (
              <article key={`${day.day}-${i}`} className={cn("rounded-xl border border-[#1E2028] bg-[#111215] p-5", activeProgramPhase?.isDeload && "bg-[rgba(34,211,238,0.03)]")}>
                <h3 className="text-lg font-semibold text-[#22D3EE]">
                  {day.day} — {day.label}
                </h3>
                <div className="mt-3 space-y-2">
                  {(day.exercises ?? []).map((ex) => (
                    <div key={`${ex.name}-${ex.reps}`} className="rounded-lg px-3 py-2 transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                      <div className="text-[15px] font-semibold text-white">{ex.name}</div>
                      <div className="text-xs text-[#A1A1AA]">
                        {ex.sets} × {ex.reps} · {ex.rest}
                      </div>
                      {ex.note ? <div className="mt-1 text-xs italic text-[#52525B]">{ex.note}</div> : null}
                      {ex.educationNote ? <div className="mt-1 text-xs text-[#A1A1AA]">? {ex.educationNote}</div> : null}
                    </div>
                  ))}
                </div>
                <footer className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#A1A1AA]">
                  {day.warmup ? <span>{copy.result.labels.warmup}: {day.warmup}</span> : null}
                  {day.cooldown ? <span>{copy.result.labels.cooldown}: {day.cooldown}</span> : null}
                  {day.duration ? <span>{copy.result.labels.duration}: {day.duration}</span> : null}
                </footer>
              </article>
            ))}
          </div>
        </div>

        <div ref={extrasRef} className={cn("grid gap-4 md:grid-cols-2 reveal-up", inExtras && "is-in")}>
          <article className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
            <h3 className="text-lg font-semibold text-white">{copy.result.supplements}</h3>
            {(
              [
                ["Tier 1 — Essential", mutablePlan.diet.supplements?.tier1 ?? [], "#22D3EE", "t1"],
                ["Tier 2 — Helpful", mutablePlan.diet.supplements?.tier2 ?? [], "#A78BFA", "t2"],
                ["Tier 3 — Optional", mutablePlan.diet.supplements?.tier3 ?? [], "#52525B", "t3"]
              ] as const
            ).map(([title, items, border, key]) => (
              <div key={title} className="mt-3 rounded-lg border border-[#1E2028]">
                <button type="button" onClick={() => setSuppOpen((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} className="flex w-full items-center justify-between border-s-2 px-3 py-2 text-left text-sm" style={{ borderLeftColor: border }}>
                  <span>{title}</span>
                  <span className="text-xs text-[#A1A1AA]">{suppOpen[key as keyof typeof suppOpen] ? "Hide" : "Show"}</span>
                </button>
                {suppOpen[key as keyof typeof suppOpen] ? (
                  <div className="space-y-2 p-3 text-sm text-[#D4D4D8]">
                    {items.map((s) => (
                      <div key={`${s.name}-${s.dose}`} className="rounded-md border border-[#1E2028] p-2">
                        <div className="font-medium text-white">{s.name}</div>
                        <div className="text-xs text-[#A1A1AA]">
                          {s.dose} · {s.timing} · {s.estimatedCost}
                        </div>
                        <div className="mt-1 text-xs text-[#A1A1AA]">{s.why}</div>
                        {s.alreadyUsing ? <span className="mt-1 inline-flex rounded-full bg-[rgba(34,197,94,0.15)] px-2 py-0.5 text-[11px] text-[#22C55E]">Already using ✓</span> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </article>
          <article className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
            <h3 className="text-lg font-semibold text-white">{copy.result.mindset}</h3>
            <p className="mt-3 text-sm leading-6 text-[#D4D4D8]">{mutablePlan.mindset?.weeklyCheckin}</p>
            <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">{mutablePlan.mindset?.ifYouStruggle}</p>
            <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">{mutablePlan.mindset?.motivation}</p>
          </article>
        </div>

        {mutablePlan.diet.cheatMealStrategy ? (
          <div className="rounded-xl border border-[rgba(167,139,250,0.15)] bg-[rgba(167,139,250,0.04)] p-5">
            <button type="button" onClick={() => setCheatOpen((v) => !v)} className="text-left text-lg font-semibold text-white">
              Cheat Meal Strategy
            </button>
            {cheatOpen ? (
              <div className="mt-3 space-y-2 text-sm text-[#D4D4D8]">
                <p>When: {mutablePlan.diet.cheatMealStrategy.optimalDay}</p>
                {(mutablePlan.diet.cheatMealStrategy.preMeal ?? []).map((x) => <p key={x}>• {x}</p>)}
                {(mutablePlan.diet.cheatMealStrategy.postMeal ?? []).map((x) => <p key={x}>• {x}</p>)}
              </div>
            ) : null}
          </div>
        ) : null}

        {grocery ? (
          <div className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
            <h3 className="text-lg font-semibold text-white">Week 1 Grocery List</h3>
            <p className="mt-1 text-xs text-[#A1A1AA]">Quantities are for 1 person. Multiply for more.</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {grocery.categories.map((category) => (
                <article key={category.name}>
                  <h4 className="text-sm font-semibold text-[#22D3EE]">{category.name}</h4>
                  <ul className="mt-2 space-y-1 text-sm text-[#D4D4D8]">
                    {category.items.map((item) => (
                      <li key={`${category.name}-${item.name}`}>
                        {item.name}: {item.quantity} {item.unit ?? ""} {item.estimatedCost ? `(${item.estimatedCost})` : ""}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {mealPrep ? (
          <div className="rounded-xl border border-[#1E2028] bg-[#111215] p-5">
            <h3 className="text-lg font-semibold text-white">Your Sunday Meal Prep Plan</h3>
            <p className="mt-1 text-sm text-[#A1A1AA]">Prep once. Eat all week. Total time: {mealPrep.totalTime ?? "~120 min"}</p>
            <p className="mt-2 text-xs text-[#A1A1AA]">You will need: {(mealPrep.equipment ?? []).join(", ")}</p>
            <div className="mt-3 space-y-3">
              {(mealPrep.timeline ?? []).map((task) => (
                <article key={`${task.time}-${task.task}`} className="rounded-lg border border-[#1E2028] p-3">
                  <p className="text-xs text-[#22D3EE]">{task.time}</p>
                  <p className="text-sm font-semibold text-white">{task.task}</p>
                  <p className="mt-1 text-sm text-[#D4D4D8]">{task.detail}</p>
                  {task.storage ? <p className="mt-1 text-xs text-[#A1A1AA]">{task.storage}</p> : null}
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <TJAIChat plan={mutablePlan} metrics={metrics} answers={answers} coreLimited={coreLimitedChat} onLimitReached={onChatLimitReached} />
        <ShareCardGenerator goal={String(answers.s2_goal ?? "Goal")} calories={metrics.calorieTarget} protein={metrics.protein} duration={metrics.timeToGoal} />
        <CoachReviewRequest />
      </div>

      <div className="sticky bottom-0 mt-10 border-t border-[#1E2028] bg-[#09090B]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <span className="text-xs text-[#52525B]">
            {copy.result.generatedAt} {new Date(generatedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="min-h-11 rounded-full bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] px-5 text-sm font-bold text-[#09090B] disabled:opacity-50"
            >
              {isSaving ? copy.result.saving : copy.result.saveToDashboard}
            </button>
            <button
              type="button"
              onClick={onStartOver}
              className="min-h-11 rounded-full border border-[#1E2028] px-4 text-sm text-[#A1A1AA] hover:text-white"
            >
              {copy.result.startOver}
            </button>
          </div>
        </div>
        {saveStatus === "ok" ? <p className="mx-auto mt-2 w-full max-w-5xl text-xs text-[#22D3EE]">{copy.result.saved}</p> : null}
        {saveStatus === "err" ? <p className="mx-auto mt-2 w-full max-w-5xl text-xs text-[#EF4444]">{copy.result.saveError}</p> : null}
      </div>

      {swapState ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-4 md:items-center md:justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
            <h3 className="text-lg font-semibold text-white">Choose an alternative meal</h3>
            <p className="mt-1 text-sm text-[#A1A1AA]">Same calories and macros as your original</p>
            <div className="mt-4 space-y-3">
              {swapState.loading ? (
                <div className="rounded-xl border border-[#1E2028] p-4 text-sm text-[#A1A1AA]">Loading alternatives...</div>
              ) : (
                swapState.alternatives.map((meal) => (
                  <article key={`${meal.name}-${meal.time}`} className="rounded-xl border border-[#1E2028] p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">{meal.name}</h4>
                      <span className="text-xs text-[#A1A1AA]">{meal.calories} kcal</span>
                    </div>
                    <ul className="mt-2 list-disc ps-5 text-sm text-[#D4D4D8]">
                      {meal.foods.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-[#A1A1AA]">P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g</p>
                    <button type="button" onClick={() => chooseSwap(meal)} className="mt-3 rounded-full bg-[#22D3EE] px-3 py-1 text-xs font-semibold text-[#09090B]">
                      Choose this meal
                    </button>
                  </article>
                ))
              )}
            </div>
            <button type="button" onClick={() => setSwapState(null)} className="mt-4 rounded-full border border-[#1E2028] px-4 py-2 text-sm text-[#A1A1AA]">
              Keep original meal
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

