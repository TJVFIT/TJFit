"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { TJAI_ONE_TIME_PRICE_USD, TJAI_SUBSCRIPTION_PRICES_USD } from "@/lib/tjai-pricing";
import { TJHeroStage } from "@/components/3d/hero-stage";
import { TJ_PALETTE } from "@/components/3d/palette";

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
    heroSub: "Take the adaptive assessment for a free preview. Unlock one full personalized TJAI plan for $10.",
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
    heroSub: "Ucretsiz on izleme icin uyarlanabilir degerlendirmeyi tamamla. Bir tam TJAI planinin kilidini $10 ile ac.",
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
    heroSub: "أكمل التقييم التكيفي لمعاينة مجانية. افتح خطة TJAI الكاملة مقابل 10$.",
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
    heroSub: "Completa la evaluacion adaptativa para una vista previa gratis. Desbloquea un plan TJAI completo por $10.",
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
    heroSub: "Completez l'evaluation adaptative pour un apercu gratuit. Debloquez un plan TJAI complet pour $10.",
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
      <section
        className="relative overflow-hidden rounded-3xl border p-8 text-center sm:p-12"
        style={{
          borderColor: TJ_PALETTE.hairline,
          background: `radial-gradient(ellipse 90% 80% at 50% 0%, rgba(34,211,238,0.12), transparent 60%), ${TJ_PALETTE.obsidian}`
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
          style={{ maskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, black 30%, transparent 85%)" }}
          aria-hidden
        >
          <TJHeroStage variant="neural" speed={0.85} intensity={0.95} />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-[0.28em]" style={{ color: TJ_PALETTE.accent }}>
            AI FITNESS COACH
          </p>
          <h1
            className="mt-4 font-display text-4xl font-extrabold sm:text-6xl"
            style={{ color: TJ_PALETTE.textPrimary, letterSpacing: "-0.02em" }}
          >
            {copy.heroTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base" style={{ color: TJ_PALETTE.textMuted }}>
            {copy.heroSub}
          </p>
          <div
            className="mx-auto mt-6 max-w-xl rounded-2xl border p-4 text-start text-sm"
            style={{
              borderColor: TJ_PALETTE.hairline,
              background: "rgba(8,8,10,0.6)",
              color: TJ_PALETTE.textMuted,
              backdropFilter: "blur(8px)"
            }}
          >
            <p className="typing-line">Analyzing your profile...</p>
            <p className="typing-line delay">Calculating BMR, TDEE, and macros...</p>
            <p className="typing-line delay-2">Building your 12-week training split...</p>
          </div>
          <Link
            href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`}
            className="mt-7 inline-flex min-h-[50px] items-center justify-center rounded-full px-8 text-sm font-bold transition-[filter,transform] duration-200 hover:brightness-110"
            style={{
              background: `linear-gradient(180deg, ${TJ_PALETTE.accentHi}, ${TJ_PALETTE.accent})`,
              color: TJ_PALETTE.obsidian,
              boxShadow: "0 12px 40px rgba(34,211,238,0.28)"
            }}
          >
            {copy.heroCta}
          </Link>
          <p className="mt-2 text-xs" style={{ color: TJ_PALETTE.textSubtle }}>
            {copy.noCard}
          </p>
        </div>
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
            <article key={title} className="rounded-2xl border border-divider bg-surface p-5">
              <p className="text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-2xl font-bold text-white">{copy.previewTitle}</h2>
        <div className="mt-4 inline-flex gap-2 rounded-xl border border-divider bg-[#0D1015] p-1">
          {(["training", "nutrition", "macros"] as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-2 text-sm ${tab === key ? "bg-cyan-400/15 text-cyan-300" : "text-muted"}`}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        {tab === "training" ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-divider">
            <table className="min-w-full text-sm">
              <thead className="bg-[#0D1015] text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Day</th>
                  <th className="px-3 py-2 text-left">Workout</th>
                  <th className="px-3 py-2 text-left">Exercises</th>
                  <th className="px-3 py-2 text-left">Duration</th>
                </tr>
              </thead>
              <tbody className="text-bright">
                <tr><td className="px-3 py-2">Monday</td><td className="px-3 py-2">Push Day</td><td className="px-3 py-2">Bench, OHP, Dips</td><td className="px-3 py-2">45 min</td></tr>
                <tr><td className="px-3 py-2">Tuesday</td><td className="px-3 py-2">Pull Day</td><td className="px-3 py-2">Deadlift, Rows, Curls</td><td className="px-3 py-2">45 min</td></tr>
                <tr><td className="px-3 py-2">Wednesday</td><td className="px-3 py-2">Legs</td><td className="px-3 py-2">Squat, RDL, Split Squat</td><td className="px-3 py-2">50 min</td></tr>
              </tbody>
            </table>
          </div>
        ) : null}
        {tab === "nutrition" ? (
          <div className="mt-4 rounded-xl border border-divider bg-[#0D1015] p-4 text-sm text-bright">
            <p>Meal 1 (8am): Oats + Protein + Banana — 520 kcal / P38 C65 F8</p>
            <p className="mt-2">Meal 2 (11am): Greek Yogurt + Berries — 220 kcal / P20 C25 F3</p>
            <p className="mt-2">Meal 3 (2pm): Chicken + Rice + Veg — 610 kcal / P48 C62 F14</p>
          </div>
        ) : null}
        {tab === "macros" ? (
          <div className="mt-4 rounded-xl border border-divider bg-[#0D1015] p-4 text-sm text-bright">
            <p>Protein 35% · Carbs 45% · Fat 20%</p>
            <p className="mt-1 text-muted">Daily total: 2,150 kcal</p>
          </div>
        ) : null}
        <Link href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`} className="mt-4 inline-flex text-sm font-semibold text-cyan-300">
          Unlock full plan at checkout →
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-white">{copy.pricingTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Core (Free)", "Adaptive preview + metrics snapshot\nPreview the system before buying", `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`],
            [`Pro ($${TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly}/mo)`, "Unlimited TJAI chat\nDiscount code + early access\nDaily meal email (early access)", `/${locale}/membership?tier=pro`],
            [`Apex ($${TJAI_SUBSCRIPTION_PRICES_USD.apex.monthly}/mo)`, "Everything in Pro\nFull regeneration\nAdvanced meal swaps + deeper adaptation", `/${locale}/membership?tier=apex`],
            [`One-time TJAI ($${TJAI_ONE_TIME_PRICE_USD})`, "Generate one adaptive plan\nDownload PDF\nNo subscription required", `/${locale}/membership?tjai_onetime=1`]
          ].map(([title, body, href]) => (
            <article key={title} className="rounded-2xl border border-divider bg-surface p-5">
              <p className="text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">{body}</p>
              <Link href={href} className="mt-4 inline-flex text-sm font-semibold text-cyan-300">
                Choose →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-2xl font-bold text-white">{copy.faqTitle}</h2>
        <div className="mt-4 space-y-3">
          {FAQ.map((q) => (
            <div key={q} className="rounded-xl border border-divider bg-[#0D1015] p-3 text-sm text-bright">
              {q}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-divider bg-[linear-gradient(180deg,#111215_0%,#0D1015_100%)] p-8 text-center">
        <h2 className="text-3xl font-extrabold text-white">{copy.finalTitle}</h2>
        <Link
          href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`}
          className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-full bg-accent px-10 text-base font-bold text-[#09090B]"
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
