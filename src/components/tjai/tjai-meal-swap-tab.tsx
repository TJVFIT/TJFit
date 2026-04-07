"use client";

import { useEffect, useMemo, useState } from "react";

import { getTJAIAccess } from "@/lib/tjai-access";
import type { TJAIPlan, TJAIMeal } from "@/lib/tjai-types";

type MealOption = {
  key: string;
  weekIndex: number;
  dayIndex: number;
  mealIndex: number;
  label: string;
  meal: TJAIMeal;
};

export function TJAIMealSwapTab({ locale }: { locale: string }) {
  const isArabic = locale === "ar";
  const t = isArabic
    ? {
        locked: "تبديل الوجبات مقفل",
        lockedSub: "تبديل الوجبات متاح لأعضاء Pro و Apex.",
        upgrade: "ترقية",
        selectMeal: "اختر وجبة لتبديلها",
        pickMeal: "اختر وجبة...",
        whySwap: "لماذا تريد التبديل؟ (اختياري)",
        noIngredients: "لا أملك المكونات",
        dislike: "لا أحب هذا الطعام",
        dietary: "تفضيل غذائي",
        variety: "أريد التنويع",
        finding: "جارٍ البحث...",
        findAlt: "ابحث عن بديل",
        swapsRemaining: "عمليات تبديل متبقية اليوم",
        useMeal: "استخدم هذه الوجبة",
        mealWord: "وجبة"
      }
    : {
        locked: "Meal Swap is locked",
        lockedSub: "Meal Swap is available for Pro and Apex members.",
        upgrade: "Upgrade",
        selectMeal: "Select a meal to swap",
        pickMeal: "Pick a meal...",
        whySwap: "Why are you swapping? (optional)",
        noIngredients: "Don&apos;t have the ingredients",
        dislike: "Don&apos;t like this food",
        dietary: "Dietary preference",
        variety: "Just want variety",
        finding: "Finding...",
        findAlt: "Find Alternative",
        swapsRemaining: "swaps remaining today",
        useMeal: "Use This Meal",
        mealWord: "Meal"
      };
  const [tier, setTier] = useState<"core" | "pro" | "apex">("core");
  const [planId, setPlanId] = useState<string>("");
  const [plan, setPlan] = useState<TJAIPlan | null>(null);
  const [selected, setSelected] = useState<MealOption | null>(null);
  const [alternatives, setAlternatives] = useState<TJAIMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [swapsRemaining, setSwapsRemaining] = useState(3);

  useEffect(() => {
    void fetch("/api/tjai/access", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.tier === "core" || data?.tier === "pro" || data?.tier === "apex") setTier(data.tier);
      });

    void fetch("/api/tjai/save", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const latest = data?.plans?.[0];
        if (!latest) return;
        setPlanId(String(latest.id));
        setPlan((latest.plan_json ?? null) as TJAIPlan | null);
      });

    const key = `tjai-swaps-${new Date().toISOString().slice(0, 10)}`;
    const used = Number(localStorage.getItem(key) ?? 0);
    setSwapsRemaining(Math.max(0, 3 - used));
  }, []);

  const access = getTJAIAccess(tier);
  const options = useMemo(() => {
    const list: MealOption[] = [];
    if (!plan) return list;
    plan.diet.weeks.forEach((week, weekIndex) => {
      week.days.forEach((day, dayIndex) => {
        day.meals.forEach((meal, mealIndex) => {
          list.push({
            key: `${weekIndex}-${dayIndex}-${mealIndex}`,
            weekIndex,
            dayIndex,
            mealIndex,
            label: `${day.label}, ${t.mealWord} ${mealIndex + 1}: ${meal.name}`,
            meal
          });
        });
      });
    });
    return list;
  }, [plan, t.mealWord]);

  const doSwap = async () => {
    if (!selected || swapsRemaining <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tjai/swap-meal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalMeal: selected.meal,
          planContext: { reason, notes, locale }
        })
      });
      const data = await res.json().catch(() => ({}));
      setAlternatives((data.alternatives ?? []) as TJAIMeal[]);
      const key = `tjai-swaps-${new Date().toISOString().slice(0, 10)}`;
      const used = Number(localStorage.getItem(key) ?? 0) + 1;
      localStorage.setItem(key, String(used));
      setSwapsRemaining(Math.max(0, 3 - used));
    } finally {
      setLoading(false);
    }
  };

  const applyAlternative = async (meal: TJAIMeal) => {
    if (!selected || !planId) return;
    await fetch("/api/tjai/replace-meal", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        weekIndex: selected.weekIndex,
        dayIndex: selected.dayIndex,
        mealIndex: selected.mealIndex,
        meal
      })
    });
  };

  if (!access.canUseMealSwap) {
    return (
      <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
        <h3 className="text-lg font-semibold text-white">{t.locked}</h3>
        <p className="mt-2 text-sm text-zinc-400">{t.lockedSub}</p>
        <a href={`/${locale}/membership?tier=pro`} className="mt-4 inline-flex rounded-full bg-[#22D3EE] px-4 py-2 text-sm font-semibold text-[#09090B]">
          {t.upgrade}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
      <h3 className="text-lg font-semibold text-white">{t.selectMeal}</h3>
      <select
        value={selected?.key ?? ""}
        onChange={(e) => setSelected(options.find((o) => o.key === e.target.value) ?? null)}
        className="w-full rounded-xl border border-[#1E2028] bg-[#0E0F12] px-3 py-2 text-sm text-white"
      >
        <option value="">{t.pickMeal}</option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>

      <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-[#1E2028] bg-[#0E0F12] px-3 py-2 text-sm text-white">
        <option value="">{t.whySwap}</option>
        <option value="ingredients">{t.noIngredients}</option>
        <option value="taste">{t.dislike}</option>
        <option value="diet">{t.dietary}</option>
        <option value="variety">{t.variety}</option>
      </select>

      <div className="flex flex-wrap gap-2">
        {["Halal", "Vegetarian", "Dairy-free", "Gluten-free", "No nuts"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setNotes((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]))}
            className={`rounded-full border px-3 py-1 text-xs ${notes.includes(item) ? "border-[#22D3EE] text-[#22D3EE]" : "border-[#1E2028] text-zinc-400"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <button type="button" onClick={() => void doSwap()} disabled={!selected || loading || swapsRemaining <= 0} className="rounded-full bg-[#22D3EE] px-4 py-2 text-sm font-semibold text-[#09090B] disabled:opacity-50">
        {loading ? t.finding : t.findAlt}
      </button>
      <p className="text-xs text-zinc-500">{swapsRemaining} {t.swapsRemaining}</p>

      <div className="grid gap-3 md:grid-cols-3">
        {alternatives.map((meal) => (
          <article key={`${meal.name}-${meal.time}`} className="rounded-xl border border-[#1E2028] bg-[#0E0F12] p-3">
            <p className="font-semibold text-white">{meal.name}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {meal.calories} kcal · P {meal.protein} C {meal.carbs} F {meal.fat}
            </p>
            <button type="button" onClick={() => void applyAlternative(meal)} className="mt-3 rounded-full border border-[#1E2028] px-3 py-1 text-xs text-zinc-200">
              {t.useMeal}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
