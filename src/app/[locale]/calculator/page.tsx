"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

type Goal = "lose" | "maintain" | "gain";
type Gender = "male" | "female";
type Activity = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

function calculateBmr(age: number, gender: Gender, height: number, weight: number) {
  return gender === "male" ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
}

export default function CalculatorPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<Gender>("male");
  const [height, setHeight] = useState(178);
  const [weight, setWeight] = useState(78);
  const [activity, setActivity] = useState<Activity>(1.55);
  const [goal, setGoal] = useState<Goal>("lose");
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (submitted && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [submitted]);

  const result = useMemo(() => {
    const bmr = calculateBmr(age, gender, height, weight);
    const tdee = Math.round(bmr * activity);
    const calories = goal === "lose" ? tdee - 500 : goal === "gain" ? tdee + 300 : tdee;
    const protein = Math.round(weight * 2.0);
    const fat = Math.round(weight * 1.0);
    const remaining = Math.max(0, calories - protein * 4 - fat * 9);
    const carbs = Math.round(remaining / 4);
    const waterMl = Math.round(weight * 35);
    return { tdee, calories, protein, fat, carbs, waterMl };
  }, [age, gender, height, weight, activity, goal]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Free TDEE Calculator</h1>
      <p className="mt-3 text-sm text-[#A1A1AA]">Calculate daily calories, macros, and hydration targets instantly.</p>

      <section className="mt-8 rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-[#A1A1AA]">
            Age
            <input type="number" min={14} max={90} value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-2 w-full rounded-lg border border-[#1E2028] bg-[#09090B] px-3 py-2 text-white" />
          </label>
          <label className="text-sm text-[#A1A1AA]">
            Gender
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="mt-2 w-full rounded-lg border border-[#1E2028] bg-[#09090B] px-3 py-2 text-white">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="text-sm text-[#A1A1AA]">
            Height (cm): {height}
            <input type="range" min={140} max={220} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="tjai-slider mt-2 w-full" />
          </label>
          <label className="text-sm text-[#A1A1AA]">
            Weight (kg): {weight}
            <input type="range" min={40} max={180} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="tjai-slider mt-2 w-full" />
          </label>
          <label className="text-sm text-[#A1A1AA]">
            Activity level
            <select value={activity} onChange={(e) => setActivity(Number(e.target.value) as Activity)} className="mt-2 w-full rounded-lg border border-[#1E2028] bg-[#09090B] px-3 py-2 text-white">
              <option value={1.2}>Sedentary</option>
              <option value={1.375}>Lightly active</option>
              <option value={1.55}>Moderately active</option>
              <option value={1.725}>Very active</option>
              <option value={1.9}>Athlete</option>
            </select>
          </label>
          <label className="text-sm text-[#A1A1AA]">
            Goal
            <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className="mt-2 w-full rounded-lg border border-[#1E2028] bg-[#09090B] px-3 py-2 text-white">
              <option value="lose">Lose fat</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain muscle</option>
            </select>
          </label>
        </div>
        <Button className="mt-6 w-full sm:w-auto" onClick={() => setSubmitted(true)}>
          Calculate My TDEE
        </Button>
      </section>

      {submitted ? (
        <section ref={resultRef} className="mt-8 rounded-2xl border border-[#22D3EE]/30 bg-[#111215] p-6 shadow-[0_0_32px_rgba(34,211,238,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22D3EE]">✓ Your Results</p>
          <p className="mt-2 text-5xl font-extrabold text-[#22D3EE]">{result.calories} <span className="text-2xl font-semibold text-zinc-400">kcal/day</span></p>
          <p className="text-sm text-[#A1A1AA]">Your personalized daily calorie target</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-[#1E2028] bg-[#0D0F14] p-3 text-center">
              <p className="text-xs text-zinc-500">Protein</p>
              <p className="mt-1 text-lg font-bold text-white">{result.protein}g</p>
            </div>
            <div className="rounded-lg border border-[#1E2028] bg-[#0D0F14] p-3 text-center">
              <p className="text-xs text-zinc-500">Carbs</p>
              <p className="mt-1 text-lg font-bold text-white">{result.carbs}g</p>
            </div>
            <div className="rounded-lg border border-[#1E2028] bg-[#0D0F14] p-3 text-center">
              <p className="text-xs text-zinc-500">Fat</p>
              <p className="mt-1 text-lg font-bold text-white">{result.fat}g</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-400">
            <span>BMR: <span className="text-white">{calculateBmr(age, gender, height, weight).toFixed(0)} kcal</span></span>
            <span>TDEE: <span className="text-white">{result.tdee} kcal</span></span>
            <span>Water: <span className="text-white">{(result.waterMl / 1000).toFixed(1)}L/day</span></span>
          </div>
          <div className="mt-6 rounded-xl border border-cyan-400/25 bg-cyan-400/10 p-4">
            <p className="text-sm font-semibold text-white">Ready to put these numbers into action?</p>
            <p className="mt-1 text-xs text-zinc-400">TJAI will build a full 12-week plan around your exact numbers.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button href={`/${locale}/ai`} className="text-sm">
                Build My TJAI Plan →
              </Button>
              <Button href={`/${locale}/programs`} className="text-sm" variant="secondary">
                Browse Programs →
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

