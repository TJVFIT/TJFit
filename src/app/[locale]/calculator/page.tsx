"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";

import { AmbientOrbs } from "@/components/effects/ambient-orbs";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n";

type Goal = "lose" | "maintain" | "gain";
type Gender = "male" | "female";
type Activity = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

type CalcCopy = {
  title: string;
  subtitle: string;
  age: string;
  gender: string;
  male: string;
  female: string;
  height: string;
  weight: string;
  activity: string;
  act: { sedentary: string; light: string; moderate: string; veryActive: string; athlete: string };
  goal: string;
  goals: { lose: string; maintain: string; gain: string };
  calculate: string;
  resultsTag: string;
  calorieSub: string;
  kcalDay: string;
  protein: string;
  carbs: string;
  fat: string;
  water: string;
  lPerDay: string;
  ctaTitle: string;
  ctaSub: string;
  ctaBuild: string;
  ctaBrowse: string;
};

const COPY: Record<Locale, CalcCopy> = {
  en: {
    title: "Free TDEE Calculator",
    subtitle: "Calculate daily calories, macros, and hydration targets instantly.",
    age: "Age", gender: "Gender", male: "Male", female: "Female",
    height: "Height (cm)", weight: "Weight (kg)", activity: "Activity level",
    act: { sedentary: "Sedentary", light: "Lightly active", moderate: "Moderately active", veryActive: "Very active", athlete: "Athlete" },
    goal: "Goal", goals: { lose: "Lose fat", maintain: "Maintain", gain: "Gain muscle" },
    calculate: "Calculate My TDEE", resultsTag: "Your Results",
    calorieSub: "Your personalized daily calorie target", kcalDay: "kcal/day",
    protein: "Protein", carbs: "Carbs", fat: "Fat", water: "Water", lPerDay: "L/day",
    ctaTitle: "Ready to put these numbers into action?",
    ctaSub: "TJAI will build a full 12-week plan around your exact numbers.",
    ctaBuild: "Build My TJAI Plan →", ctaBrowse: "Browse Bundles →"
  },
  tr: {
    title: "Ücretsiz TDEE Hesaplayıcı",
    subtitle: "Günlük kalori, makro ve su hedeflerini anında hesapla.",
    age: "Yaş", gender: "Cinsiyet", male: "Erkek", female: "Kadın",
    height: "Boy (cm)", weight: "Kilo (kg)", activity: "Aktivite seviyesi",
    act: { sedentary: "Hareketsiz", light: "Hafif aktif", moderate: "Orta düzey aktif", veryActive: "Çok aktif", athlete: "Sporcu" },
    goal: "Hedef", goals: { lose: "Yağ yak", maintain: "Koru", gain: "Kas kazan" },
    calculate: "TDEE'mi Hesapla", resultsTag: "Sonuçların",
    calorieSub: "Kişiselleştirilmiş günlük kalori hedefin", kcalDay: "kcal/gün",
    protein: "Protein", carbs: "Karbonhidrat", fat: "Yağ", water: "Su", lPerDay: "L/gün",
    ctaTitle: "Bu sayıları harekete geçirmeye hazır mısın?",
    ctaSub: "TJAI tam sayılarına göre 12 haftalık eksiksiz bir plan oluşturur.",
    ctaBuild: "TJAI Planımı Oluştur →", ctaBrowse: "Paketlere Göz At →"
  },
  ar: {
    title: "حاسبة TDEE المجانية",
    subtitle: "احسب السعرات والماكروز وأهداف الترطيب اليومية فوراً.",
    age: "العمر", gender: "الجنس", male: "ذكر", female: "أنثى",
    height: "الطول (سم)", weight: "الوزن (كجم)", activity: "مستوى النشاط",
    act: { sedentary: "خامل", light: "نشاط خفيف", moderate: "نشاط متوسط", veryActive: "نشيط جداً", athlete: "رياضي" },
    goal: "الهدف", goals: { lose: "حرق الدهون", maintain: "الحفاظ على الوزن", gain: "بناء العضلات" },
    calculate: "احسب TDEE", resultsTag: "نتائجك",
    calorieSub: "هدف السعرات اليومي المخصص لك", kcalDay: "سعرة/يوم",
    protein: "بروتين", carbs: "كربوهيدرات", fat: "دهون", water: "ماء", lPerDay: "ل/يوم",
    ctaTitle: "جاهز لتطبيق هذه الأرقام؟",
    ctaSub: "سيبني TJAI خطة كاملة لمدة 12 أسبوعاً حول أرقامك بالضبط.",
    ctaBuild: "أنشئ خطة TJAI ←", ctaBrowse: "تصفّح الباقات ←"
  },
  es: {
    title: "Calculadora TDEE gratis",
    subtitle: "Calcula calorías, macros e hidratación diarias al instante.",
    age: "Edad", gender: "Género", male: "Hombre", female: "Mujer",
    height: "Altura (cm)", weight: "Peso (kg)", activity: "Nivel de actividad",
    act: { sedentary: "Sedentario", light: "Ligeramente activo", moderate: "Moderadamente activo", veryActive: "Muy activo", athlete: "Atleta" },
    goal: "Objetivo", goals: { lose: "Perder grasa", maintain: "Mantener", gain: "Ganar músculo" },
    calculate: "Calcular mi TDEE", resultsTag: "Tus resultados",
    calorieSub: "Tu objetivo diario de calorías personalizado", kcalDay: "kcal/día",
    protein: "Proteína", carbs: "Carbohidratos", fat: "Grasa", water: "Agua", lPerDay: "L/día",
    ctaTitle: "¿Listo para poner estos números en acción?",
    ctaSub: "TJAI creará un plan completo de 12 semanas con tus números exactos.",
    ctaBuild: "Crear mi plan TJAI →", ctaBrowse: "Ver paquetes →"
  },
  fr: {
    title: "Calculateur TDEE gratuit",
    subtitle: "Calcule tes calories, macros et hydratation quotidiennes instantanément.",
    age: "Âge", gender: "Genre", male: "Homme", female: "Femme",
    height: "Taille (cm)", weight: "Poids (kg)", activity: "Niveau d'activité",
    act: { sedentary: "Sédentaire", light: "Légèrement actif", moderate: "Modérément actif", veryActive: "Très actif", athlete: "Athlète" },
    goal: "Objectif", goals: { lose: "Perdre du gras", maintain: "Maintenir", gain: "Prendre du muscle" },
    calculate: "Calculer mon TDEE", resultsTag: "Tes résultats",
    calorieSub: "Ton objectif calorique quotidien personnalisé", kcalDay: "kcal/jour",
    protein: "Protéines", carbs: "Glucides", fat: "Lipides", water: "Eau", lPerDay: "L/jour",
    ctaTitle: "Prêt à mettre ces chiffres en action ?",
    ctaSub: "TJAI créera un plan complet de 12 semaines autour de tes chiffres exacts.",
    ctaBuild: "Créer mon plan TJAI →", ctaBrowse: "Voir les packs →"
  }
};

function calculateBmr(age: number, gender: Gender, height: number, weight: number) {
  return gender === "male" ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
}

export default function CalculatorPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = use(params).locale;
  const copy = COPY[locale as Locale] ?? COPY.en;
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
    // Age is a free number input (min/max are only hints), so clamp it to a
    // plausible range before the math — otherwise an empty/huge value can drive
    // BMR negative and show negative calories.
    const safeAge = Math.min(90, Math.max(14, Number.isFinite(age) && age > 0 ? age : 28));
    const bmr = calculateBmr(safeAge, gender, height, weight);
    const tdee = Math.round(bmr * activity);
    const calories = goal === "lose" ? tdee - 500 : goal === "gain" ? tdee + 300 : tdee;
    const protein = Math.round(weight * 2.0);
    const fat = Math.round(weight * 1.0);
    const remaining = Math.max(0, calories - protein * 4 - fat * 9);
    const carbs = Math.round(remaining / 4);
    const waterMl = Math.round(weight * 35);
    return { bmr: Math.round(bmr), tdee, calories, protein, fat, carbs, waterMl };
  }, [age, gender, height, weight, activity, goal]);

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <AmbientOrbs variant="compact" />

      <h1 className="relative text-3xl font-extrabold sm:text-4xl">
        <span className="tj-title-shimmer">{copy.title}</span>
      </h1>
      <p className="relative mt-3 text-sm text-muted">{copy.subtitle}</p>

      <section className="relative mt-8 rounded-2xl border border-divider bg-surface p-6 transition-[border-color,box-shadow] duration-300 hover:border-purple-300/25 hover:shadow-[0_0_36px_rgba(168,85,247,0.10)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-muted">
            {copy.age}
            <input type="number" min={14} max={90} value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-2 w-full rounded-lg border border-divider bg-background px-3 py-2 text-white" />
          </label>
          <label className="text-sm text-muted">
            {copy.gender}
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="mt-2 w-full rounded-lg border border-divider bg-background px-3 py-2 text-white">
              <option value="male">{copy.male}</option>
              <option value="female">{copy.female}</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            {copy.height}: {height}
            <input type="range" min={140} max={220} value={height} onChange={(e) => setHeight(Number(e.target.value))} className="tjai-slider mt-2 w-full" />
          </label>
          <label className="text-sm text-muted">
            {copy.weight}: {weight}
            <input type="range" min={40} max={180} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="tjai-slider mt-2 w-full" />
          </label>
          <label className="text-sm text-muted">
            {copy.activity}
            <select value={activity} onChange={(e) => setActivity(Number(e.target.value) as Activity)} className="mt-2 w-full rounded-lg border border-divider bg-background px-3 py-2 text-white">
              <option value={1.2}>{copy.act.sedentary}</option>
              <option value={1.375}>{copy.act.light}</option>
              <option value={1.55}>{copy.act.moderate}</option>
              <option value={1.725}>{copy.act.veryActive}</option>
              <option value={1.9}>{copy.act.athlete}</option>
            </select>
          </label>
          <label className="text-sm text-muted">
            {copy.goal}
            <select value={goal} onChange={(e) => setGoal(e.target.value as Goal)} className="mt-2 w-full rounded-lg border border-divider bg-background px-3 py-2 text-white">
              <option value="lose">{copy.goals.lose}</option>
              <option value="maintain">{copy.goals.maintain}</option>
              <option value="gain">{copy.goals.gain}</option>
            </select>
          </label>
        </div>
        <Button className="mt-6 w-full sm:w-auto" onClick={() => setSubmitted(true)}>
          {copy.calculate}
        </Button>
      </section>

      {submitted ? (
        <section ref={resultRef} className="mt-8 rounded-2xl border border-accent/30 bg-surface p-6 shadow-[0_0_32px_rgba(168,85,247,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">✓ {copy.resultsTag}</p>
          <p className="mt-2 text-5xl font-extrabold text-accent">{result.calories} <span className="text-2xl font-semibold text-muted">{copy.kcalDay}</span></p>
          <p className="text-sm text-muted">{copy.calorieSub}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="group/macro rounded-lg border border-divider bg-surface-2 p-3 text-center transition-[border-color,box-shadow] duration-200 hover:border-purple-300/35 hover:shadow-[0_0_18px_rgba(168,85,247,0.14)]">
              <p className="text-xs text-faint">{copy.protein}</p>
              <p className="mt-1 text-lg font-bold text-white transition-colors duration-200 group-hover/macro:text-purple-50">{result.protein}g</p>
            </div>
            <div className="group/macro rounded-lg border border-divider bg-surface-2 p-3 text-center transition-[border-color,box-shadow] duration-200 hover:border-purple-300/35 hover:shadow-[0_0_18px_rgba(168,85,247,0.14)]">
              <p className="text-xs text-faint">{copy.carbs}</p>
              <p className="mt-1 text-lg font-bold text-white transition-colors duration-200 group-hover/macro:text-purple-50">{result.carbs}g</p>
            </div>
            <div className="group/macro rounded-lg border border-divider bg-surface-2 p-3 text-center transition-[border-color,box-shadow] duration-200 hover:border-purple-300/35 hover:shadow-[0_0_18px_rgba(168,85,247,0.14)]">
              <p className="text-xs text-faint">{copy.fat}</p>
              <p className="mt-1 text-lg font-bold text-white transition-colors duration-200 group-hover/macro:text-purple-50">{result.fat}g</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <span>BMR: <span className="text-white">{result.bmr} kcal</span></span>
            <span>TDEE: <span className="text-white">{result.tdee} kcal</span></span>
            <span>{copy.water}: <span className="text-white">{(result.waterMl / 1000).toFixed(1)}{copy.lPerDay}</span></span>
          </div>
          <div className="mt-6 rounded-xl border border-purple-400/25 bg-purple-400/10 p-4">
            <p className="text-sm font-semibold text-white">{copy.ctaTitle}</p>
            <p className="mt-1 text-xs text-muted">{copy.ctaSub}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button href={`/${locale}/ai`} className="text-sm">
                {copy.ctaBuild}
              </Button>
              <Button href={`/${locale}/bundles`} className="text-sm" variant="secondary">
                {copy.ctaBrowse}
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
