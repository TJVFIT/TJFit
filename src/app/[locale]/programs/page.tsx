import type { Metadata } from "next";
import Link from "next/link";

import { ProgramCard } from "@/components/program-card";
import { programs } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import {
  formatProgramPrice,
  getProgramBasePriceTry,
  getProgramUiCopy,
  localizeProgram
} from "@/lib/program-localization";
import { requireLocaleParam } from "@/lib/require-locale";

export const metadata: Metadata = {
  title: "Programs — TJFit",
  description:
    "Premium training and nutrition programs from the TJFit operating system. Browse by goal, equipment, and length."
};

const NUTRITION_SLUGS = new Set([
  "clean-bulk-diet-plan",
  "high-calorie-muscle-diet",
  "lean-bulk-nutrition-plan",
  "mass-gain-meal-plan",
  "hardcore-bulk-diet",
  "fat-loss-diet-plan",
  "cutting-shred-meal-plan",
  "low-calorie-lean-diet",
  "keto-cut-plan",
  "high-protein-cutting-diet",
  "keto-shred-diet-12w",
  "gut-health-fat-loss-diet-12w",
  "student-fat-loss-diet-12w",
  "lean-bulk-diet-12w",
  "clean-cutting-diet-12w",
  "hard-cut-athlete-diet-12w",
  "high-calorie-mass-diet-12w",
  "muscle-gain-athlete-diet-12w",
  "student-bulk-diet-12w",
  "clean-weight-gain-diet-12w",
  "clean-cut-starter",
  "lean-bulk-starter"
]);

type CatalogCopy = {
  eyebrow: string;
  title: string;
  sub: string;
  filterTraining: string;
  filterNutrition: string;
  ariaCategories: string;
  helpHeader: string;
  helpBody: string;
  helpCta: string;
};

const CATALOG_COPY: Record<Locale, CatalogCopy> = {
  en: {
    eyebrow: "Catalog",
    title: "Programs built like products.",
    sub: "Each program is a complete training system: progressive phases, weekly structure, recovery, and execution playbooks.",
    filterTraining: "Training",
    filterNutrition: "Nutrition",
    ariaCategories: "Program categories",
    helpHeader: "Not sure which fits?",
    helpBody: "TJAI picks a program in two minutes from your goal, equipment, and history.",
    helpCta: "Open TJAI"
  },
  tr: {
    eyebrow: "Katalog",
    title: "Ürün gibi inşa edilmiş programlar.",
    sub: "Her program eksiksiz bir antrenman sistemidir: ilerleyici fazlar, haftalık yapı, toparlanma ve uygulama rehberi.",
    filterTraining: "Antrenman",
    filterNutrition: "Beslenme",
    ariaCategories: "Program kategorileri",
    helpHeader: "Hangisi uygun emin değil misin?",
    helpBody: "TJAI; hedefin, ekipmanın ve geçmişinden iki dakikada program seçer.",
    helpCta: "TJAI'yı aç"
  },
  ar: {
    eyebrow: "الكتالوج",
    title: "برامج مبنية كمنتج كامل.",
    sub: "كل برنامج هو نظام تدريبي كامل: مراحل تدرّجية، هيكل أسبوعي، تعافٍ، ودليل تنفيذ.",
    filterTraining: "تدريب",
    filterNutrition: "تغذية",
    ariaCategories: "فئات البرامج",
    helpHeader: "غير متأكد أي برنامج يناسبك؟",
    helpBody: "يختار TJAI برنامجاً في دقيقتين بناءً على هدفك ومعداتك وتاريخك.",
    helpCta: "افتح TJAI"
  },
  es: {
    eyebrow: "Catálogo",
    title: "Programas construidos como productos.",
    sub: "Cada programa es un sistema completo: fases progresivas, estructura semanal, recuperación y guías de ejecución.",
    filterTraining: "Entrenamiento",
    filterNutrition: "Nutrición",
    ariaCategories: "Categorías de programa",
    helpHeader: "¿No sabes cuál te conviene?",
    helpBody: "TJAI elige un programa en dos minutos según tu objetivo, equipo e historial.",
    helpCta: "Abrir TJAI"
  },
  fr: {
    eyebrow: "Catalogue",
    title: "Des programmes pensés comme des produits.",
    sub: "Chaque programme est un système complet : phases progressives, structure hebdomadaire, récupération et guides d'exécution.",
    filterTraining: "Entraînement",
    filterNutrition: "Nutrition",
    ariaCategories: "Catégories de programme",
    helpHeader: "Pas sûr du bon choix ?",
    helpBody: "TJAI choisit un programme en deux minutes selon ton objectif, ton équipement et ton historique.",
    helpCta: "Ouvrir TJAI"
  }
};

export default function ProgramsCatalogPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = CATALOG_COPY[locale] ?? CATALOG_COPY.en;
  const ui = getProgramUiCopy(locale);

  const localized = programs.map((p) => ({ raw: p, l: localizeProgram(p, locale) }));
  const trainingItems = localized.filter(({ raw }) => !NUTRITION_SLUGS.has(raw.slug));
  const nutritionItems = localized.filter(({ raw }) => NUTRITION_SLUGS.has(raw.slug));

  return (
    <main className="relative min-h-[100dvh] bg-[#08080A] text-white">
      <div className="mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pt-32 lg:px-12">
        {/* Editorial header */}
        <header className="grid gap-8 border-b border-white/[0.06] pb-12 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16 lg:pb-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              {copy.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-[clamp(36px,6.4vw,68px)] font-semibold leading-[1.04] tracking-[-0.02em] text-white">
              {copy.title}
            </h1>
          </div>
          <p className="max-w-xl text-[15px] leading-[1.65] text-white/60 sm:text-base">{copy.sub}</p>
        </header>

        {/* Filter chips — anchor links to in-page sections */}
        <nav
          aria-label={copy.ariaCategories}
          className="mt-10 flex flex-wrap items-center gap-2 text-[12px] font-medium tracking-tight"
        >
          <a
            href="#training"
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-white/85 transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {copy.filterTraining} <span className="ms-1 text-white/40">{trainingItems.length}</span>
          </a>
          {nutritionItems.length > 0 ? (
            <a
              href="#nutrition"
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-white/85 transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {copy.filterNutrition} <span className="ms-1 text-white/40">{nutritionItems.length}</span>
            </a>
          ) : null}
        </nav>

        <CatalogSection
          id="training"
          eyebrow={copy.filterTraining}
          items={trainingItems}
          locale={locale}
          viewLabel={ui.viewProgram}
          freeBadgeLabel={ui.freeBadge}
          freePriceLabel={ui.freePriceLabel}
        />
        {nutritionItems.length > 0 ? (
          <CatalogSection
            id="nutrition"
            eyebrow={copy.filterNutrition}
            items={nutritionItems}
            locale={locale}
            viewLabel={ui.viewDiet}
            freeBadgeLabel={ui.freeBadge}
            freePriceLabel={ui.freePriceLabel}
          />
        ) : null}

        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-10 sm:flex-row sm:items-center">
          <div className="max-w-md">
            <p className="text-sm font-medium text-white">{copy.helpHeader}</p>
            <p className="mt-1 text-sm text-white/55">{copy.helpBody}</p>
          </div>
          <Link
            href={`/${locale}/tjai`}
            className="inline-flex items-center gap-2 rounded-md border border-white/[0.12] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-accent/60 hover:bg-accent/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          >
            {copy.helpCta}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function CatalogSection({
  id,
  eyebrow,
  items,
  locale,
  viewLabel,
  freeBadgeLabel,
  freePriceLabel
}: {
  id: string;
  eyebrow: string;
  items: Array<{ raw: typeof programs[number]; l: typeof programs[number] }>;
  locale: Locale;
  viewLabel: string;
  freeBadgeLabel: string;
  freePriceLabel: string;
}) {
  return (
    <section id={id} className="mt-16 scroll-mt-24">
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-3">
        <h2 className="font-display text-[22px] font-semibold tracking-tight text-white sm:text-[26px]">
          {eyebrow}
        </h2>
        <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-white/35">
          {String(items.length).padStart(2, "0")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ raw, l }) => {
          const tryPrice = getProgramBasePriceTry(raw);
          const isFree = raw.is_free || tryPrice === 0;
          const priceLabel = isFree ? freePriceLabel : formatProgramPrice(tryPrice, locale);
          return (
            <ProgramCard
              key={raw.slug}
              program={l}
              href={`/${locale}/programs/${raw.slug}`}
              viewLabel={viewLabel}
              priceLabel={priceLabel}
              freeBadgeLabel={isFree ? freeBadgeLabel : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}
