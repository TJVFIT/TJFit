"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type TabKey = "training" | "nutrition" | "macros";

const COPY: Record<
  Locale,
  {
    heroTitle: string;
    heroSub: string;
    heroCta: string;
    noCard: string;
    doesTitle: string;
    previewTitle: string;
    pricingTitle: string;
    faqTitle: string;
    finalTitle: string;
    finalCta: string;
  }
> = {
  en: {
    heroTitle: "Meet TJAI.",
    heroSub: "Answer the quiz for a free preview. Pay to generate your full 12-week transformation plan.",
    heroCta: "Start TJAI Preview",
    noCard: "Quiz preview is free. Full plan generation is paid at checkout.",
    doesTitle: "What TJAI does",
    previewTitle: "See what a TJAI plan looks like",
    pricingTitle: "Choose your level",
    faqTitle: "FAQ",
    finalTitle: "Your transformation starts with one question.",
    finalCta: "Start TJAI →"
  },
  tr: {
    heroTitle: "TJAI ile tanis.",
    heroSub: "Ucretsiz on izleme icin quizi cevapla. Tam 12 haftalik plan icin odeme yap.",
    heroCta: "TJAI On Izlemesi",
    noCard: "On izleme ucretsiz. Tam plan uretimi odemeli.",
    doesTitle: "TJAI ne yapar",
    previewTitle: "TJAI plani nasil gorunuyor",
    pricingTitle: "Seviyeni sec",
    faqTitle: "SSS",
    finalTitle: "Donusumun tek bir soruyla baslar.",
    finalCta: "TJAI'yi Baslat →"
  },
  ar: {
    heroTitle: "تعرّف على TJAI.",
    heroSub: "أجب عن الأسئلة لمعاينة مجانية. ادفع لفتح خطتك الكاملة لمدة 12 أسبوعاً.",
    heroCta: "معاينة TJAI",
    noCard: "المعاينة مجانية. الخطة الكاملة مدفوعة عند الدفع.",
    doesTitle: "ماذا يفعل TJAI",
    previewTitle: "شاهد شكل خطة TJAI",
    pricingTitle: "اختر مستواك",
    faqTitle: "الأسئلة الشائعة",
    finalTitle: "تحوّلك يبدأ بسؤال واحد.",
    finalCta: "ابدأ TJAI →"
  },
  es: {
    heroTitle: "Conoce TJAI.",
    heroSub: "Responde el cuestionario para una vista previa gratis. Paga para generar tu plan completo de 12 semanas.",
    heroCta: "Vista previa TJAI",
    noCard: "La vista previa del quiz es gratis. El plan completo se paga al finalizar la compra.",
    doesTitle: "Que hace TJAI",
    previewTitle: "Asi se ve un plan de TJAI",
    pricingTitle: "Elige tu nivel",
    faqTitle: "FAQ",
    finalTitle: "Tu transformacion empieza con una pregunta.",
    finalCta: "Empezar TJAI →"
  },
  fr: {
    heroTitle: "Decouvrez TJAI.",
    heroSub: "Repondez au questionnaire pour un aperçu gratuit. Payez pour generer votre plan complet sur 12 semaines.",
    heroCta: "Apercu TJAI",
    noCard: "L'apercu du quiz est gratuit. Le plan complet est payant au paiement.",
    doesTitle: "Ce que fait TJAI",
    previewTitle: "A quoi ressemble un plan TJAI",
    pricingTitle: "Choisissez votre niveau",
    faqTitle: "FAQ",
    finalTitle: "Votre transformation commence par une question.",
    finalCta: "Demarrer TJAI →"
  }
};

const FAQ = [
  "How accurate is TJAI?",
  "What languages does TJAI support?",
  "Is TJAI a replacement for a personal trainer?",
  "Can TJAI handle dietary restrictions?",
  "How is TJAI different from MyFitnessPal / other apps?"
];

export function TjaiPublicLanding({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const [tab, setTab] = useState<TabKey>("training");

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-[#1E2028] bg-[#111215] p-8 text-center sm:p-12">
        <p className="text-xs uppercase tracking-[0.18em] text-[#22D3EE]">AI FITNESS COACH</p>
        <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-6xl">{copy.heroTitle}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#A1A1AA] sm:text-base">{copy.heroSub}</p>
        <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-white/10 bg-[#0D1015] p-4 text-start text-sm text-zinc-300">
          <p className="typing-line">Analyzing your profile...</p>
          <p className="typing-line delay">Calculating BMR, TDEE, and macros...</p>
          <p className="typing-line delay-2">Building your 12-week training split...</p>
        </div>
        <Link
          href={`/${locale}/ai`}
          className="mt-7 inline-flex min-h-[50px] items-center justify-center rounded-full bg-[#22D3EE] px-8 text-sm font-bold text-[#09090B]"
        >
          {copy.heroCta}
        </Link>
        <p className="mt-2 text-xs text-[#52525B]">{copy.noCard}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-white">{copy.doesTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            ["🧠 Personalized Science", "Mifflin-St Jeor BMR, TDEE math, and evidence-based macro targets."],
            ["📅 12-Week Plan", "Weekly training schedule + daily meals, sets, reps, rest, and structure."],
            ["📊 Science-Based Numbers", "BMR, TDEE, and evidence-based macros. Calculated for YOUR body using Mifflin-St Jeor formula."],
            ["🔄 Adaptive", "If progress stalls, TJAI updates training load and nutrition targets."]
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
              <p className="text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm text-[#A1A1AA]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
        <h2 className="text-2xl font-bold text-white">{copy.previewTitle}</h2>
        <div className="mt-4 inline-flex gap-2 rounded-xl border border-[#1E2028] bg-[#0D1015] p-1">
          {(["training", "nutrition", "macros"] as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-2 text-sm ${tab === key ? "bg-cyan-400/15 text-cyan-300" : "text-[#A1A1AA]"}`}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        {tab === "training" ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#1E2028]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#0D1015] text-[#A1A1AA]">
                <tr>
                  <th className="px-3 py-2 text-left">Day</th>
                  <th className="px-3 py-2 text-left">Workout</th>
                  <th className="px-3 py-2 text-left">Exercises</th>
                  <th className="px-3 py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody className="text-zinc-200">
                <tr><td className="px-3 py-2">Monday</td><td className="px-3 py-2">Push Day</td><td className="px-3 py-2">Bench, OHP, Dips</td><td className="px-3 py-2">45 min</td></tr>
                <tr><td className="px-3 py-2">Tuesday</td><td className="px-3 py-2">Pull Day</td><td className="px-3 py-2">Deadlift, Rows, Curls</td><td className="px-3 py-2">45 min</td></tr>
                <tr><td className="px-3 py-2">Wednesday</td><td className="px-3 py-2">Legs</td><td className="px-3 py-2">Squat, RDL, Split Squat</td><td className="px-3 py-2">50 min</td></tr>
              </tbody>
            </table>
          </div>
        ) : null}
        {tab === "nutrition" ? (
          <div className="mt-4 rounded-xl border border-[#1E2028] bg-[#0D1015] p-4 text-sm text-zinc-200">
            <p>Meal 1 (8am): Oats + Protein + Banana — 520 kcal / P38 C65 F8</p>
            <p className="mt-2">Meal 2 (11am): Greek Yogurt + Berries — 220 kcal / P20 C25 F3</p>
            <p className="mt-2">Meal 3 (2pm): Chicken + Rice + Veg — 610 kcal / P48 C62 F14</p>
          </div>
        ) : null}
        {tab === "macros" ? (
          <div className="mt-4 rounded-xl border border-[#1E2028] bg-[#0D1015] p-4 text-sm text-zinc-200">
            <p>Protein 35% · Carbs 45% · Fat 20%</p>
            <p className="mt-1 text-[#A1A1AA]">Daily total: 2,150 kcal</p>
          </div>
        ) : null}
        <Link href={`/${locale}/ai`} className="mt-4 inline-flex text-sm font-semibold text-cyan-300">
          Unlock full plan at checkout →
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-white">{copy.pricingTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Core (Free)", "Trial quiz + metrics preview\nSee BMR/TDEE/macros\nNo full plan generation", `/${locale}/ai`],
            ["Pro ($10/mo)", "Monthly 4-week AI program by email\nProgram discounts", `/${locale}/membership?tier=pro`],
            ["Apex ($20/mo)", "Full TJAI generation\nUnlimited AI chat\nMeal swaps + custom plans", `/${locale}/membership?tier=apex`],
            ["One-time TJAI ($25)", "Generate one plan\nDownload PDF\nNo subscription", `/${locale}/membership?tjai_onetime=1`]
          ].map(([title, body, href]) => (
            <article key={title} className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5">
              <p className="text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-[#A1A1AA]">{body}</p>
              <Link href={href} className="mt-4 inline-flex text-sm font-semibold text-cyan-300">
                Choose →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[#1E2028] bg-[#111215] p-6">
        <h2 className="text-2xl font-bold text-white">{copy.faqTitle}</h2>
        <div className="mt-4 space-y-3">
          {FAQ.map((q) => (
            <div key={q} className="rounded-xl border border-[#1E2028] bg-[#0D1015] p-3 text-sm text-zinc-200">
              {q}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-[#1E2028] bg-[linear-gradient(180deg,#111215_0%,#0D1015_100%)] p-8 text-center">
        <h2 className="text-3xl font-extrabold text-white">{copy.finalTitle}</h2>
        <Link
          href={`/${locale}/ai`}
          className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#22D3EE] px-10 text-base font-bold text-[#09090B]"
        >
          {copy.finalCta}
        </Link>
      </section>

      <style jsx>{`
        .typing-line {
          width: fit-content;
          border-right: 1px solid rgba(34, 211, 238, 0.45);
          white-space: nowrap;
          overflow: hidden;
          animation: tjtyping 3.4s steps(40, end) infinite;
        }
        .typing-line.delay {
          animation-delay: 0.6s;
        }
        .typing-line.delay-2 {
          animation-delay: 1.2s;
        }
        @keyframes tjtyping {
          0% {
            max-width: 0;
            opacity: 0.6;
          }
          20% {
            max-width: 100%;
            opacity: 1;
          }
          70% {
            max-width: 100%;
            opacity: 1;
          }
          100% {
            max-width: 0;
            opacity: 0.6;
          }
        }
      `}</style>
    </main>
  );
}
