import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { getDiet, listDietSlugs } from "@/lib/diets";
import type { Locale } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";

export async function generateStaticParams() {
  return listDietSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const locale = requireLocaleParam(params.locale);
  const diet = getDiet(params.slug);
  if (!diet) return {};
  return {
    title: `${diet.goal[locale].slice(0, 50)} | TJFit`,
    description: diet.who_for[locale]
  };
}

const SECTION_LABELS: Record<Locale, Record<string, string | ((n: number) => string)>> = {
  en: {
    who_for: "Who this is for",
    who_not_for: "Who it's not for",
    results: "What to expect",
    why: "Why this works",
    scaling: "Scaling for your weight",
    macros: "Daily targets (70 kg baseline)",
    p: "Protein",
    c: "Carbs",
    f: "Fat",
    cal: "Calories",
    weeks: "Duration",
    weeksValue: (n: number) => `${n} weeks`,
    back: "← All diets"
  },
  tr: {
    who_for: "Kimler için",
    who_not_for: "Kimler için değil",
    results: "Beklentiler",
    why: "Neden işe yarar",
    scaling: "Kilona göre ölçekleme",
    macros: "Günlük hedefler (70 kg referans)",
    p: "Protein",
    c: "Karbonhidrat",
    f: "Yağ",
    cal: "Kalori",
    weeks: "Süre",
    weeksValue: (n: number) => `${n} hafta`,
    back: "← Tüm diyetler"
  },
  ar: {
    who_for: "لمن هذا",
    who_not_for: "لمن ليس مناسباً",
    results: "ما تتوقعه",
    why: "لماذا ينجح",
    scaling: "التحجيم حسب وزنك",
    macros: "الأهداف اليومية (مرجع 70 كغ)",
    p: "بروتين",
    c: "كربوهيدرات",
    f: "دهون",
    cal: "سعرات",
    weeks: "المدة",
    weeksValue: (n: number) => `${n} أسبوع`,
    back: "→ كل الأنظمة"
  },
  es: {
    who_for: "Para quién",
    who_not_for: "Para quién no",
    results: "Qué esperar",
    why: "Por qué funciona",
    scaling: "Escalado según tu peso",
    macros: "Objetivos diarios (70 kg base)",
    p: "Proteína",
    c: "Carbos",
    f: "Grasa",
    cal: "Calorías",
    weeks: "Duración",
    weeksValue: (n: number) => `${n} semanas`,
    back: "← Todas las dietas"
  },
  fr: {
    who_for: "Pour qui",
    who_not_for: "Pour qui ce n'est pas",
    results: "À quoi t'attendre",
    why: "Pourquoi ça marche",
    scaling: "Mise à l'échelle selon ton poids",
    macros: "Cibles quotidiennes (base 70 kg)",
    p: "Protéine",
    c: "Glucides",
    f: "Lipides",
    cal: "Calories",
    weeks: "Durée",
    weeksValue: (n: number) => `${n} semaines`,
    back: "← Tous les régimes"
  }
};

export default function DietDetailPage({
  params
}: {
  params: { locale: string; slug: string };
}) {
  const locale = requireLocaleParam(params.locale);
  const diet = getDiet(params.slug);
  if (!diet) notFound();

  const t = SECTION_LABELS[locale] ?? SECTION_LABELS.en;
  const cals = diet.daily_calories_baseline;
  const proteinG = Math.round((cals * diet.macro_split_target.protein_pct) / 100 / 4);
  const carbsG = Math.round((cals * diet.macro_split_target.carbs_pct) / 100 / 4);
  const fatG = Math.round((cals * diet.macro_split_target.fat_pct) / 100 / 9);

  return (
    <>
      <AmbientBackground variant="cyan" />
      <div className="relative z-[1] mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Link
          href={`/${locale}/diets`}
          className="text-xs font-medium text-accent transition-colors duration-150 hover:text-white"
        >
          {t.back as string}
        </Link>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent/80">
          {diet.category}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
          {diet.goal[locale]}
        </h1>

        <dl className="mt-8 grid grid-cols-1 gap-x-4 gap-y-3 border-t border-white/[0.06] pt-5 text-[12px] sm:grid-cols-3 sm:max-w-xl">
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              {t.weeks as string}
            </dt>
            <dd className="mt-1.5 text-[13px] font-medium text-white/90 [font-feature-settings:'tnum'] tabular-nums">
              {(t.weeksValue as (n: number) => string)(diet.duration_weeks)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              {t.cal as string}
            </dt>
            <dd className="mt-1.5 text-[13px] font-medium text-white/90 [font-feature-settings:'tnum'] tabular-nums">
              {cals}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              {t.p as string}
            </dt>
            <dd className="mt-1.5 text-[13px] font-medium text-white/90 [font-feature-settings:'tnum'] tabular-nums">
              {proteinG} g
            </dd>
          </div>
        </dl>

        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            {t.who_for as string}
          </h2>
          <p className="mt-3 text-sm leading-[1.8] text-muted">{diet.who_for[locale]}</p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            {t.who_not_for as string}
          </h2>
          <p className="mt-3 text-sm leading-[1.8] text-muted">{diet.who_not_for[locale]}</p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            {t.results as string}
          </h2>
          <p className="mt-3 text-sm leading-[1.8] text-muted">{diet.results_expected[locale]}</p>
        </section>

        <section className="mt-8 rounded-2xl border border-divider bg-surface p-6">
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            {t.macros as string}
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-faint">{t.cal as string}</p>
              <p className="mt-1 font-display text-xl text-white [font-feature-settings:'tnum'] tabular-nums">
                {cals}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-faint">{t.p as string}</p>
              <p className="mt-1 font-display text-xl text-white [font-feature-settings:'tnum'] tabular-nums">
                {proteinG}g
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-faint">{t.c as string}</p>
              <p className="mt-1 font-display text-xl text-white [font-feature-settings:'tnum'] tabular-nums">
                {carbsG}g
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-faint">{t.f as string}</p>
              <p className="mt-1 font-display text-xl text-white [font-feature-settings:'tnum'] tabular-nums">
                {fatG}g
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            {t.why as string}
          </h2>
          <p className="mt-3 text-sm leading-[1.8] text-muted">{diet.why_this_works[locale]}</p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">
            {t.scaling as string}
          </h2>
          <p className="mt-3 text-sm leading-[1.8] text-muted">{diet.scaling_guidance[locale]}</p>
        </section>
      </div>
    </>
  );
}
