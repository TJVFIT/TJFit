"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, ArrowRight, BarChart3, CalendarDays, RefreshCw } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { TJAI_ONE_TIME_PRICE_USD, TJAI_SUBSCRIPTION_PRICES_USD } from "@/lib/tjai-pricing";
import { TJHeroStage } from "@/components/3d/hero-stage";
import { TJ_PALETTE } from "@/components/3d/palette";

import styles from "./tjai-landing.module.css";

function HeroTitle({ text, locale }: { text: string; locale: Locale }) {
  const isArabic = locale === "ar";
  const parts: string[] = isArabic
    ? (text.match(/\S+|\s+/g) ?? [text])
    : Array.from(text);
  const stagger = isArabic ? 90 : 38;
  return (
    <h1
      className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-[0.98] sm:text-6xl"
      style={{ color: TJ_PALETTE.textPrimary, letterSpacing: "-0.03em" }}
      aria-label={text}
    >
      <span aria-hidden="true">
        {parts.map((part, i) => {
          if (/^\s+$/.test(part)) {
            return <span key={i}>{" "}</span>;
          }
          return (
            <span
              key={i}
              className={styles.letter}
              style={{ animationDelay: `${i * stagger}ms` }}
            >
              {part}
            </span>
          );
        })}
      </span>
    </h1>
  );
}

type TabKey = "training" | "nutrition" | "macros";

const FEATURE_ROWS = [
  {
    Icon: Activity,
    title: "Personalized science",
    body: "Mifflin-St Jeor BMR, TDEE math, and evidence-based macro targets."
  },
  {
    Icon: CalendarDays,
    title: "12-week plan",
    body: "Weekly training schedule plus daily meals, sets, reps, rest, and structure."
  },
  {
    Icon: BarChart3,
    title: "Science-based numbers",
    body: "BMR, TDEE, and macro targets calculated for your body and goal pace."
  },
  {
    Icon: RefreshCw,
    title: "Adaptive updates",
    body: "If progress stalls, TJAI can adjust training load and nutrition targets."
  }
];

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
    finalCta: "Start TJAI"
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
    finalCta: "TJAI'yi Baslat"
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
    finalCta: "ابدأ TJAI"
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
    finalCta: "Empezar TJAI"
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
    finalCta: "Demarrer TJAI"
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
        className="relative overflow-hidden rounded-[1.75rem] border p-6 sm:p-10 lg:p-12"
        style={{
          borderColor: TJ_PALETTE.hairline,
          background:
            `radial-gradient(ellipse 70% 60% at 70% 20%, rgba(34,211,238,0.14), transparent 62%), radial-gradient(ellipse 44% 40% at 12% 100%, rgba(246,243,237,0.05), transparent 68%), ${TJ_PALETTE.obsidian}`
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
          style={{ maskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, black 30%, transparent 85%)" }}
          aria-hidden
        >
          <TJHeroStage variant="neural" speed={0.85} intensity={0.95} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#09090B] to-transparent" aria-hidden />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center">
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-[0.28em]" style={{ color: TJ_PALETTE.accent }}>
              AI FITNESS COACH
            </p>
            <HeroTitle text={copy.heroTitle} locale={locale} />
            <p className="mt-5 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: TJ_PALETTE.textMuted }}>
              {copy.heroSub}
            </p>
            <Link
              href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`}
              className={`mt-7 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full px-8 text-sm font-bold transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-110 ${styles.ctaGlow}`}
              style={{
                background: `linear-gradient(180deg, ${TJ_PALETTE.accentHi}, ${TJ_PALETTE.accent})`,
                color: TJ_PALETTE.obsidian
              }}
            >
              {copy.heroCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="mt-3 text-xs" style={{ color: TJ_PALETTE.textSubtle }}>
              {copy.noCard}
            </p>
          </div>
          <div
            className="rounded-2xl border p-4 text-start text-sm lg:ms-auto lg:w-full lg:max-w-xl"
            style={{
              borderColor: TJ_PALETTE.hairline,
              background: "linear-gradient(145deg, rgba(13,15,18,0.82), rgba(17,18,21,0.48))",
              color: TJ_PALETTE.textMuted,
              backdropFilter: "blur(14px)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.06)"
            }}
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717A]">Live preview</span>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-200">
                adaptive
              </span>
            </div>
            <ul className="space-y-1">
              {[
                { text: "Analyzing your profile…", delay: 0 },
                { text: "Calculating BMR, TDEE, and macros…", delay: 220 },
                { text: "Building your 12-week training split…", delay: 440 }
              ].map((line) => (
                <li
                  key={line.text}
                  className={`${styles.previewLine} text-[13px] text-white/85`}
                  style={{ animationDelay: `${line.delay}ms` }}
                >
                  <span className={styles.previewDot} aria-hidden />
                  <span className="relative z-[1]">{line.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {["BMR", "TDEE", "Macros"].map((item, i) => (
                <span
                  key={item}
                  className={`${styles.sectionRise} rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-2 text-[11px] text-zinc-300`}
                  style={{ animationDelay: `${700 + i * 100}ms` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-white">{copy.doesTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {FEATURE_ROWS.map(({ Icon, title, body }) => (
            <article
              key={title}
              className="group rounded-2xl border border-divider bg-surface p-5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-1 hover:border-cyan-300/25 hover:bg-surface-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-cyan-200">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <p className="mt-4 text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
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
          Unlock full plan at checkout <ArrowRight className="ms-1 h-4 w-4" aria-hidden />
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-white">{copy.pricingTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Core (Free)",
              body: "Adaptive preview + metrics snapshot\nPreview the system before buying",
              href: `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`,
              best: false
            },
            {
              title: `Pro ($${TJAI_SUBSCRIPTION_PRICES_USD.pro.monthly}/mo)`,
              body: "Unlimited TJAI chat\nDiscount code + early access\nDaily meal email (early access)",
              href: `/${locale}/membership?tier=pro`,
              best: false
            },
            {
              title: `Apex ($${TJAI_SUBSCRIPTION_PRICES_USD.apex.monthly}/mo)`,
              body: "Everything in Pro\nFull regeneration\nAdvanced meal swaps + deeper adaptation",
              href: `/${locale}/membership?tier=apex`,
              best: false
            },
            {
              title: `One-time TJAI ($${TJAI_ONE_TIME_PRICE_USD})`,
              body: "Generate one adaptive plan\nDownload PDF\nNo subscription required",
              href: `/${locale}/membership?tjai_onetime=1`,
              best: true
            }
          ].map(({ title, body, href, best }) => (
            <article
              key={title}
              className={`relative rounded-2xl border p-5 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-1 ${
                best
                  ? "border-cyan-400/35 bg-[linear-gradient(180deg,rgba(34,211,238,0.06),rgba(34,211,238,0.01))] shadow-[0_0_42px_rgba(34,211,238,0.12)] hover:shadow-[0_0_56px_rgba(34,211,238,0.18)]"
                  : "border-divider bg-surface hover:border-cyan-300/25 hover:shadow-[0_0_28px_rgba(34,211,238,0.06)]"
              }`}
            >
              {best ? (
                <span
                  className={`absolute -top-3 start-5 inline-flex items-center gap-1.5 rounded-full border border-cyan-300/35 bg-[#06080d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200 ${styles.bestPulse}`}
                >
                  Best value
                </span>
              ) : null}
              <p className="text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">{body}</p>
              <Link
                href={href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Choose
                <ArrowRight className="ms-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
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
          <ArrowRight className="ms-2 h-4 w-4" aria-hidden />
        </Link>
      </section>

    </main>
  );
}
