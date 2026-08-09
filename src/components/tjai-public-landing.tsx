"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties } from "react";
import { Activity, ArrowRight, BarChart3, CalendarDays, ChevronDown, RefreshCw } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { TJAI_ONE_TIME_PRICE_USD, TJAI_SUBSCRIPTION_PRICES_USD } from "@/lib/tjai-pricing";
import { TJHeroStage } from "@/components/3d/hero-stage";
import { TJ_PALETTE } from "@/components/3d/palette";
import { useMagnetic, useMergedRef, useRipple } from "@/components/effects/use-magnetic";

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

function MagneticCta({
  href,
  className,
  style,
  children
}: {
  href: string;
  className: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  const magnetic = useMagnetic<HTMLAnchorElement>({ strength: 6, max: 8 });
  const ripple = useRipple<HTMLAnchorElement>();
  const ref = useMergedRef<HTMLAnchorElement>(magnetic, ripple);
  return (
    <Link
      ref={ref}
      href={href}
      className={`tj-cta-sheen ${className}`}
      style={
        {
          "--mag-x": "0px",
          "--mag-y": "0px",
          transform: "translate3d(var(--mag-x), var(--mag-y), 0)",
          transition:
            "transform 220ms cubic-bezier(0.2, 1, 0.3, 1), filter 200ms, box-shadow 220ms",
          ...style
        } as CSSProperties
      }
    >
      {children}
    </Link>
  );
}

function StreamShimmer({ className }: { className?: string }) {
  return (
    <div className={`${styles.previewLine} ${className ?? ""}`} style={{ animationDelay: "420ms" }} aria-hidden>
      <span className={styles.previewDot} />
      <span className="relative z-[1] h-2 w-2/5 rounded-full bg-white/[0.08]" />
    </div>
  );
}

function FaqItem({ id, question, answer }: { id: string; question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="tj-surface-card overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-purple-300/25 hover:shadow-[0_0_24px_rgba(168,85,247,0.08)]">
      <button
        type="button"
        id={`${id}-button`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-start text-sm font-semibold text-bright transition-colors duration-200 hover:text-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
      >
        {question}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-purple-300 transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        aria-hidden={!open}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="border-t border-white/[0.06] px-4 pb-4 pt-3 text-sm leading-relaxed text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

type TabKey = "training" | "nutrition" | "macros";

const TAB_KEYS: TabKey[] = ["training", "nutrition", "macros"];

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
    heroTitle: "TJAI ile tanış.",
    heroSub: "Ücretsiz ön izleme için uyarlanabilir değerlendirmeyi tamamla. Bir tam TJAI planının kilidini $10 ile aç.",
    heroCta: "TJAI Ön İzlemesi",
    noCard: "Ön izleme ücretsiz. Tam plan üretimi ödemeli.",
    doesTitle: "TJAI ne yapar",
    previewTitle: "TJAI planı nasıl görünüyor",
    pricingTitle: "Seviyeni seç",
    faqTitle: "SSS",
    finalTitle: "Dönüşümün tek bir soruyla başlar.",
    finalCta: "TJAI'yi Başlat"
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

const FAQ_ANSWERS: Record<Locale, string[]> = {
  en: [
    "TJAI builds every plan on established sports-science formulas — Mifflin-St Jeor BMR, TDEE activity multipliers, and evidence-based macro splits — then adapts the numbers as your progress data comes in.",
    "TJAI works in English, Turkish, Arabic, Spanish, and French — the full assessment, plan, and chat.",
    "No. TJAI delivers structured, adaptive programming, but it does not replace medical advice or the hands-on judgment of a qualified coach.",
    "Yes. The assessment covers allergies, restrictions, and food preferences, and your meal structure is built around them.",
    "Trackers log what you already did. TJAI generates the plan itself — training split, meals, and targets — and adjusts it when your progress stalls."
  ],
  tr: [
    "TJAI her planı kanıtlanmış spor bilimi formülleri üzerine kurar — Mifflin-St Jeor BMR, TDEE aktivite çarpanları ve kanıta dayalı makro dağılımları — ve ilerleme verilerin geldikçe sayıları uyarlar.",
    "TJAI İngilizce, Türkçe, Arapça, İspanyolca ve Fransızca çalışır — değerlendirme, plan ve sohbetin tamamı.",
    "Hayır. TJAI yapılandırılmış ve uyarlanabilir programlar sunar; ancak tıbbi tavsiyenin veya nitelikli bir koçun birebir değerlendirmesinin yerini tutmaz.",
    "Evet. Değerlendirme alerjileri, kısıtlamaları ve yemek tercihlerini kapsar; öğün düzenin buna göre kurulur.",
    "Takip uygulamaları yaptıklarını kaydeder. TJAI planın kendisini üretir — antrenman bölünmesi, öğünler ve hedefler — ve ilerlemen durduğunda planı günceller."
  ],
  ar: [
    "يبني TJAI كل خطة على معادلات علمية راسخة — معادلة Mifflin-St Jeor لمعدل الأيض الأساسي، ومضاعفات النشاط لحساب TDEE، وتوزيعات ماكرو قائمة على الأدلة — ثم يكيّف الأرقام مع بيانات تقدمك.",
    "يعمل TJAI بالإنجليزية والتركية والعربية والإسبانية والفرنسية — التقييم والخطة والمحادثة بالكامل.",
    "لا. يقدم TJAI برامج منظمة وقابلة للتكيف، لكنه لا يغني عن الاستشارة الطبية أو إشراف مدرب مؤهل.",
    "نعم. يغطي التقييم الحساسيات والقيود الغذائية وتفضيلات الطعام، وتُبنى وجباتك وفقاً لها.",
    "تطبيقات التتبع تسجل ما فعلته. أما TJAI فيولّد الخطة نفسها — تقسيم التدريب والوجبات والأهداف — ويعدّلها عندما يتباطأ تقدمك."
  ],
  es: [
    "TJAI construye cada plan sobre fórmulas consolidadas de la ciencia del deporte — BMR de Mifflin-St Jeor, multiplicadores de actividad para el TDEE y repartos de macros basados en evidencia — y ajusta los números según tus datos de progreso.",
    "TJAI funciona en inglés, turco, árabe, español y francés — la evaluación, el plan y el chat completos.",
    "No. TJAI ofrece programación estructurada y adaptativa, pero no sustituye el consejo médico ni el criterio de un entrenador cualificado.",
    "Sí. La evaluación cubre alergias, restricciones y preferencias alimentarias, y tu estructura de comidas se construye en torno a ellas.",
    "Las apps de registro anotan lo que ya hiciste. TJAI genera el plan en sí — división de entrenamiento, comidas y objetivos — y lo ajusta cuando tu progreso se estanca."
  ],
  fr: [
    "TJAI construit chaque plan sur des formules éprouvées de science du sport — BMR de Mifflin-St Jeor, multiplicateurs d'activité pour le TDEE et répartitions de macros fondées sur les preuves — puis ajuste les chiffres selon tes données de progression.",
    "TJAI fonctionne en anglais, turc, arabe, espagnol et français — l'évaluation, le plan et le chat au complet.",
    "Non. TJAI fournit une programmation structurée et adaptative, mais il ne remplace ni un avis médical ni le regard d'un coach qualifié.",
    "Oui. L'évaluation couvre les allergies, les restrictions et les préférences alimentaires, et la structure de tes repas est construite autour d'elles.",
    "Les applications de suivi enregistrent ce que tu as déjà fait. TJAI génère le plan lui-même — répartition d'entraînement, repas et objectifs — et l'ajuste quand ta progression stagne."
  ]
};

export function TjaiPublicLanding({ locale }: { locale: Locale }) {
  const copy = COPY[locale] ?? COPY.en;
  const faqAnswers = FAQ_ANSWERS[locale] ?? FAQ_ANSWERS.en;
  const [tab, setTab] = useState<TabKey>("training");
  const isRtl = locale === "ar";
  const tabIndex = TAB_KEYS.indexOf(tab);

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (event.key === "ArrowRight") next = (index + (isRtl ? -1 : 1) + TAB_KEYS.length) % TAB_KEYS.length;
    else if (event.key === "ArrowLeft") next = (index + (isRtl ? 1 : -1) + TAB_KEYS.length) % TAB_KEYS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TAB_KEYS.length - 1;
    if (next === -1) return;
    event.preventDefault();
    setTab(TAB_KEYS[next]);
    document.getElementById(`tjai-tab-${TAB_KEYS[next]}`)?.focus();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <section
        className="relative overflow-hidden rounded-[1.75rem] border p-6 sm:p-10 lg:p-12"
        style={{
          borderColor: TJ_PALETTE.hairline,
          background:
            `radial-gradient(ellipse 70% 60% at 70% 20%, rgba(168,85,247,0.14), transparent 62%), radial-gradient(ellipse 44% 40% at 12% 100%, rgba(246,243,237,0.05), transparent 68%), ${TJ_PALETTE.obsidian}`
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
            <MagneticCta
              href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`}
              className={`mt-7 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full px-8 text-sm font-bold hover:brightness-110 ${styles.ctaGlow}`}
              style={{
                background: `linear-gradient(180deg, ${TJ_PALETTE.accentHi}, ${TJ_PALETTE.accent})`,
                color: TJ_PALETTE.obsidian
              }}
            >
              {copy.heroCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </MagneticCta>
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
              <span className="rounded-full border border-purple-300/20 bg-purple-300/10 px-2.5 py-1 text-[10px] font-semibold text-purple-200">
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

      <section className="reveal-section tj-whirl mt-10">
        <h2 className="text-2xl font-bold text-white">{copy.doesTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {FEATURE_ROWS.map(({ Icon, title, body }) => (
            <article
              key={title}
              className="group rounded-2xl border border-divider bg-surface p-5 transition-[border-color,background-color,box-shadow,transform] duration-300 motion-safe:hover:-translate-y-1 hover:border-purple-300/35 hover:bg-surface-2 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5),0_0_28px_rgba(168,85,247,0.12)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-300/20 bg-purple-300/[0.06] text-purple-200 transition-[border-color,background-color,box-shadow] duration-300 group-hover:border-purple-300/45 group-hover:bg-purple-300/[0.12] group-hover:shadow-[0_0_18px_rgba(168,85,247,0.22)]">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <p className="mt-4 text-lg font-semibold text-white transition-colors duration-200 group-hover:text-purple-50">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="reveal-section tj-whirl tj-whirl-alt mt-10 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-2xl font-bold text-white">{copy.previewTitle}</h2>
        <div
          role="tablist"
          aria-label={copy.previewTitle}
          className="relative mt-4 grid w-full max-w-md grid-cols-3 rounded-xl border border-divider bg-[#0D1015] p-1"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-1 start-1 rounded-lg border border-purple-300/25 bg-purple-400/15 shadow-[0_0_18px_rgba(168,85,247,0.16)] transition-transform duration-300 ease-[cubic-bezier(0.2,1,0.3,1)] motion-reduce:transition-none"
            style={{
              width: "calc((100% - 0.5rem) / 3)",
              transform: `translateX(${(isRtl ? -1 : 1) * tabIndex * 100}%)`
            }}
          />
          {TAB_KEYS.map((key, index) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tjai-tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`tjai-panel-${key}`}
              tabIndex={tab === key ? 0 : -1}
              onClick={() => setTab(key)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={`relative z-[1] rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 ${
                tab === key ? "text-purple-200" : "text-muted hover:text-bright"
              }`}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        {tab === "training" ? (
          <div
            id="tjai-panel-training"
            role="tabpanel"
            aria-labelledby="tjai-tab-training"
            className="tj-surface-card mt-4 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-muted">
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-3 py-2 text-left">Day</th>
                    <th className="px-3 py-2 text-left">Workout</th>
                    <th className="px-3 py-2 text-left">Exercises</th>
                    <th className="px-3 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-bright">
                  <tr className={`${styles.sectionRise} border-b border-white/[0.04]`}><td className="px-3 py-2">Monday</td><td className="px-3 py-2">Push Day</td><td className="px-3 py-2">Bench, OHP, Dips</td><td className="px-3 py-2">45 min</td></tr>
                  <tr className={`${styles.sectionRise} border-b border-white/[0.04]`} style={{ animationDelay: "110ms" }}><td className="px-3 py-2">Tuesday</td><td className="px-3 py-2">Pull Day</td><td className="px-3 py-2">Deadlift, Rows, Curls</td><td className="px-3 py-2">45 min</td></tr>
                  <tr className={styles.sectionRise} style={{ animationDelay: "220ms" }}><td className="px-3 py-2">Wednesday</td><td className="px-3 py-2">Legs</td><td className="px-3 py-2">Squat, RDL, Split Squat</td><td className="px-3 py-2">50 min</td></tr>
                </tbody>
              </table>
            </div>
            <StreamShimmer className="mx-2 mb-2 mt-1" />
          </div>
        ) : null}
        {tab === "nutrition" ? (
          <div
            id="tjai-panel-nutrition"
            role="tabpanel"
            aria-labelledby="tjai-tab-nutrition"
            className="tj-surface-card mt-4 p-4 text-sm text-bright"
          >
            <p className={styles.sectionRise}>Meal 1 (8am): Oats + Protein + Banana — 520 kcal / P38 C65 F8</p>
            <p className={`${styles.sectionRise} mt-2`} style={{ animationDelay: "110ms" }}>Meal 2 (11am): Greek Yogurt + Berries — 220 kcal / P20 C25 F3</p>
            <p className={`${styles.sectionRise} mt-2`} style={{ animationDelay: "220ms" }}>Meal 3 (2pm): Chicken + Rice + Veg — 610 kcal / P48 C62 F14</p>
            <StreamShimmer className="mt-3 -mx-2" />
          </div>
        ) : null}
        {tab === "macros" ? (
          <div
            id="tjai-panel-macros"
            role="tabpanel"
            aria-labelledby="tjai-tab-macros"
            className="tj-surface-card mt-4 p-4 text-sm text-bright"
          >
            <p className={styles.sectionRise}>Protein 35% · Carbs 45% · Fat 20%</p>
            <p className={`${styles.sectionRise} mt-1 text-muted`} style={{ animationDelay: "110ms" }}>Daily total: 2,150 kcal</p>
            <StreamShimmer className="mt-3 -mx-2" />
          </div>
        ) : null}
        <Link
          href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`}
          className="group mt-4 inline-flex text-sm font-semibold text-purple-300 transition-colors hover:text-purple-200"
        >
          Unlock full plan at checkout <ArrowRight className="ms-1 h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </section>

      <section className="reveal-section tj-whirl mt-10">
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
                  ? "border-purple-400/35 bg-[linear-gradient(180deg,rgba(168,85,247,0.06),rgba(168,85,247,0.01))] shadow-[0_0_42px_rgba(168,85,247,0.12)] hover:shadow-[0_0_56px_rgba(168,85,247,0.18)]"
                  : "border-divider bg-surface hover:border-purple-300/25 hover:shadow-[0_0_28px_rgba(168,85,247,0.06)]"
              }`}
            >
              {best ? (
                <span
                  className={`absolute -top-3 start-5 inline-flex items-center gap-1.5 rounded-full border border-purple-300/35 bg-[#06080d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-200 ${styles.bestPulse}`}
                >
                  Best value
                </span>
              ) : null}
              <p className="text-lg font-semibold text-white">{title}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted">{body}</p>
              <Link
                href={href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-purple-300 transition-colors hover:text-purple-200"
              >
                Choose
                <ArrowRight className="ms-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="reveal-section tj-whirl tj-whirl-alt mt-10 rounded-2xl border border-divider bg-surface p-6">
        <h2 className="text-2xl font-bold text-white">{copy.faqTitle}</h2>
        <div className="mt-4 space-y-3">
          {FAQ.map((q, index) => (
            <FaqItem key={q} id={`tjai-faq-${index}`} question={q} answer={faqAnswers[index] ?? ""} />
          ))}
        </div>
      </section>

      <section className="reveal-section tj-whirl mt-10 rounded-3xl border border-divider bg-[linear-gradient(180deg,#111215_0%,#0D1015_100%)] p-8 text-center">
        <h2 className="text-3xl font-extrabold text-white">{copy.finalTitle}</h2>
        <MagneticCta
          href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/ai`)}`}
          className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#A855F7,#7C3AED)] px-10 text-base font-bold text-[#09090B] shadow-[0_0_16px_rgba(168,85,247,0.2)] hover:shadow-[0_0_24px_rgba(168,85,247,0.32)]"
        >
          {copy.finalCta}
          <ArrowRight className="ms-2 h-4 w-4" aria-hidden />
        </MagneticCta>
      </section>

    </main>
  );
}
