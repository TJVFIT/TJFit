import type { Metadata } from "next";
import Link from "next/link";

import { ProgramsCatalogClient } from "@/components/programs/programs-catalog-client";
import { programs } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { formatProgramPrice, getProgramBasePriceTry, getProgramUiCopy, localizeProgram } from "@/lib/program-localization";
import { normalizeCatalogProgram } from "@/lib/program-catalog";
import { requireLocaleParam } from "@/lib/require-locale";

export const metadata: Metadata = {
  title: "Programs - TJFit",
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
  filterGoal: string;
  filterLocation: string;
  filterAll: string;
  filterClear: string;
  goalFat: string;
  goalMuscle: string;
  goalRecomp: string;
  locationHome: string;
  locationGym: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
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
    filterGoal: "Goal",
    filterLocation: "Location",
    filterAll: "All",
    filterClear: "Clear",
    goalFat: "Fat loss",
    goalMuscle: "Muscle",
    goalRecomp: "Recomp",
    locationHome: "Home",
    locationGym: "Gym",
    emptyTitle: "No programs match those filters.",
    emptyBody: "Clear the filters to see the full TJFit catalog, including home, gym, training, and nutrition systems.",
    emptyCta: "Reset filters",
    ariaCategories: "Program categories",
    helpHeader: "Not sure which fits?",
    helpBody: "TJAI picks a program in two minutes from your goal, equipment, and history.",
    helpCta: "Open TJAI"
  },
  tr: {
    eyebrow: "Katalog",
    title: "Urun gibi insa edilmis programlar.",
    sub: "Her program eksiksiz bir antrenman sistemidir: ilerleyici fazlar, haftalik yapi, toparlanma ve uygulama rehberi.",
    filterTraining: "Antrenman",
    filterNutrition: "Beslenme",
    filterGoal: "Hedef",
    filterLocation: "Konum",
    filterAll: "Tumu",
    filterClear: "Temizle",
    goalFat: "Yag yakimi",
    goalMuscle: "Kas",
    goalRecomp: "Recomp",
    locationHome: "Ev",
    locationGym: "Salon",
    emptyTitle: "Bu filtrelerle program bulunamadi.",
    emptyBody: "Ev, salon, antrenman ve beslenme sistemlerinin tamamini gormek icin filtreleri temizle.",
    emptyCta: "Filtreleri sifirla",
    ariaCategories: "Program kategorileri",
    helpHeader: "Hangisi uygun emin degil misin?",
    helpBody: "TJAI; hedefin, ekipmanin ve gecmisinden iki dakikada program secer.",
    helpCta: "TJAI'yi ac"
  },
  ar: {
    eyebrow: "Catalog",
    title: "Programs built like products.",
    sub: "Each program is a complete training system with phases, weekly structure, recovery, and execution playbooks.",
    filterTraining: "Training",
    filterNutrition: "Nutrition",
    filterGoal: "Goal",
    filterLocation: "Location",
    filterAll: "All",
    filterClear: "Clear",
    goalFat: "Fat loss",
    goalMuscle: "Muscle",
    goalRecomp: "Recomp",
    locationHome: "Home",
    locationGym: "Gym",
    emptyTitle: "No programs match those filters.",
    emptyBody: "Clear the filters to see the full TJFit catalog, including home, gym, training, and nutrition systems.",
    emptyCta: "Reset filters",
    ariaCategories: "Program categories",
    helpHeader: "Not sure which fits?",
    helpBody: "TJAI picks a program in two minutes from your goal, equipment, and history.",
    helpCta: "Open TJAI"
  },
  es: {
    eyebrow: "Catalogo",
    title: "Programas construidos como productos.",
    sub: "Cada programa es un sistema completo: fases progresivas, estructura semanal, recuperacion y guias de ejecucion.",
    filterTraining: "Entrenamiento",
    filterNutrition: "Nutricion",
    filterGoal: "Objetivo",
    filterLocation: "Lugar",
    filterAll: "Todo",
    filterClear: "Limpiar",
    goalFat: "Perdida de grasa",
    goalMuscle: "Musculo",
    goalRecomp: "Recomp",
    locationHome: "Casa",
    locationGym: "Gimnasio",
    emptyTitle: "No hay programas con esos filtros.",
    emptyBody: "Limpia los filtros para ver todo el catalogo TJFit: casa, gimnasio, entrenamiento y nutricion.",
    emptyCta: "Restablecer filtros",
    ariaCategories: "Categorias de programa",
    helpHeader: "No sabes cual te conviene?",
    helpBody: "TJAI elige un programa en dos minutos segun tu objetivo, equipo e historial.",
    helpCta: "Abrir TJAI"
  },
  fr: {
    eyebrow: "Catalogue",
    title: "Des programmes penses comme des produits.",
    sub: "Chaque programme est un systeme complet : phases progressives, structure hebdomadaire, recuperation et guides d'execution.",
    filterTraining: "Entrainement",
    filterNutrition: "Nutrition",
    filterGoal: "Objectif",
    filterLocation: "Lieu",
    filterAll: "Tout",
    filterClear: "Effacer",
    goalFat: "Perte de graisse",
    goalMuscle: "Muscle",
    goalRecomp: "Recomp",
    locationHome: "Maison",
    locationGym: "Salle",
    emptyTitle: "Aucun programme avec ces filtres.",
    emptyBody: "Efface les filtres pour voir tout le catalogue TJFit: maison, salle, entrainement et nutrition.",
    emptyCta: "Reinitialiser",
    ariaCategories: "Categories de programme",
    helpHeader: "Pas sur du bon choix ?",
    helpBody: "TJAI choisit un programme en deux minutes selon ton objectif, ton equipement et ton historique.",
    helpCta: "Ouvrir TJAI"
  }
};

export default function ProgramsCatalogPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = CATALOG_COPY[locale] ?? CATALOG_COPY.en;
  const ui = getProgramUiCopy(locale);

  const catalogItems = programs.map((raw) => {
    const localized = localizeProgram(raw, locale);
    const normalized = normalizeCatalogProgram(raw, locale);
    const tryPrice = getProgramBasePriceTry(raw);
    const isFree = raw.is_free || tryPrice === 0;

    return {
      program: {
        ...normalized,
        title: localized.title,
        category: localized.category,
        difficulty: localized.difficulty,
        duration: localized.duration,
        description: localized.description
      },
      href: `/${locale}/programs/${raw.slug}`,
      viewLabel: NUTRITION_SLUGS.has(raw.slug) ? ui.viewDiet : ui.viewProgram,
      priceLabel: isFree ? ui.freePriceLabel : formatProgramPrice(tryPrice, locale),
      freeBadgeLabel: isFree ? ui.freeBadge : undefined
    };
  });

  const trainingCount = programs.filter((raw) => !NUTRITION_SLUGS.has(raw.slug)).length;
  const nutritionCount = programs.length - trainingCount;

  return (
    <main className="relative min-h-[100dvh] bg-[#08080A] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(34,211,238,0.10),transparent_60%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pt-32 lg:px-12">
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

        <nav
          aria-label={copy.ariaCategories}
          className="mt-10 flex flex-wrap items-center gap-2 text-[12px] font-medium tracking-tight"
        >
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3.5 py-1.5 text-cyan-100">
            {copy.filterTraining} <span className="ms-1 text-cyan-100/55">{trainingCount}</span>
          </span>
          {nutritionCount > 0 ? (
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-white/70">
              {copy.filterNutrition} <span className="ms-1 text-white/40">{nutritionCount}</span>
            </span>
          ) : null}
        </nav>

        <ProgramsCatalogClient
          items={catalogItems}
          goalLabel={copy.filterGoal}
          locationLabel={copy.filterLocation}
          allLabel={copy.filterAll}
          clearLabel={copy.filterClear}
          emptyTitle={copy.emptyTitle}
          emptyBody={copy.emptyBody}
          emptyCta={copy.emptyCta}
          goalOptions={[
            { value: "fat", label: copy.goalFat },
            { value: "muscle", label: copy.goalMuscle },
            { value: "recomp", label: copy.goalRecomp }
          ]}
          locationOptions={[
            { value: "home", label: copy.locationHome },
            { value: "gym", label: copy.locationGym }
          ]}
        />

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
            <span aria-hidden>-&gt;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
