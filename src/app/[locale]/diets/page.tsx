"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BlurReveal } from "@/components/blur-reveal";
import { CinematicListingHeader } from "@/components/cinematic-listing-header";
import { FilterPill, ListingFilterBar } from "@/components/listing-filter-bar";
import { PremiumPageShell } from "@/components/premium";
import { StaggerRevealGrid } from "@/components/stagger-reveal-grid";
import { ScrollTicker } from "@/components/ui/ScrollTicker";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { ProgramCard } from "@/components/ui";
import { programs, type Program } from "@/lib/content";
import { getDietCalorieSpec, getDietPhase, isCatalogDiet } from "@/lib/diet-catalog";
import { getDietsMarketplaceCopy } from "@/lib/diets-marketplace-copy";
import { Locale, isLocale } from "@/lib/i18n";
import { formatProgramPrice, getProgramBasePriceTry, getProgramUiCopy, localizeProgram } from "@/lib/program-localization";

type PhaseFilter = "all" | "cutting" | "bulking";
type FreeFilter = "all" | "free";

function dietMatches(program: Program, phase: PhaseFilter) {
  if (phase === "all") return true;
  return getDietPhase(program) === phase;
}

export default function DietsPage({ params }: { params: { locale: string } }) {
  const rawLocale = params?.locale ?? "";
  const localeValid = isLocale(rawLocale);
  const locale = (localeValid ? rawLocale : "en") as Locale;
  const copy = getProgramUiCopy(locale);
  const pageCopy = getDietsMarketplaceCopy(locale);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [freeFilter, setFreeFilter] = useState<FreeFilter>("all");
  const freeFilterCopy: Record<Locale, { all: string; free: string }> = {
    en: { all: "All", free: "Free" },
    tr: { all: "Tum", free: "Ucretsiz" },
    ar: { all: "الكل", free: "مجاني" },
    es: { all: "Todo", free: "Gratis" },
    fr: { all: "Tous", free: "Gratuit" }
  };

  const allDiets = useMemo(
    () => programs.filter(isCatalogDiet).map((item) => localizeProgram(item, locale)),
    [locale]
  );

  const filtered = useMemo(
    () =>
      allDiets
        .filter((p) => dietMatches(p, phaseFilter))
        .filter((p) => (freeFilter === "free" ? Boolean(p.is_free) : true)),
    [allDiets, phaseFilter, freeFilter]
  );

  const filterActive = phaseFilter !== "all" || freeFilter !== "all";

  useEffect(() => {
    const phase = searchParams.get("phase");
    const free = searchParams.get("free") === "1" || searchParams.get("filter") === "free";
    setPhaseFilter(phase === "cutting" || phase === "bulking" ? phase : "all");
    setFreeFilter(free ? "free" : "all");
  }, [searchParams]);

  const syncPhaseToUrl = (nextPhase: PhaseFilter, nextFree: FreeFilter) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (nextPhase === "all") qs.delete("phase");
    else qs.set("phase", nextPhase);
    if (nextFree === "all") {
      qs.delete("free");
      qs.delete("filter");
    } else {
      qs.set("free", "1");
      qs.set("filter", "free");
    }
    const query = qs.toString();
    router.replace(query ? `/${locale}/diets?${query}` : `/${locale}/diets`);
  };

  if (!localeValid) {
    notFound();
  }

  const tierLabels =
    locale === "tr"
      ? { elite: "Elite", popular: "Populer", fresh: "Ucretsiz", signature: "Ozel" }
      : locale === "ar"
        ? { elite: "نخبة", popular: "الاكثر طلبا", fresh: "مجاني", signature: "مميز" }
        : locale === "es"
          ? { elite: "Elite", popular: "Popular", fresh: "Gratis", signature: "Signature" }
          : locale === "fr"
            ? { elite: "Elite", popular: "Populaire", fresh: "Gratuit", signature: "Signature" }
            : { elite: "Elite", popular: "Popular", fresh: "Free", signature: "Signature" };

  return (
    <>
      <AmbientBackground />
      <div className="relative z-[1]">
        <BlurReveal>
          <CinematicListingHeader
            eyebrow={pageCopy.cinematicEyebrow}
            headlineBefore={pageCopy.cinematicHeadlineBefore}
            headlineGradient={pageCopy.cinematicHeadlineGradient}
            sub={pageCopy.cinematicSub}
          >
          <Link
            href={`/${params.locale}/programs`}
            className="text-sm font-medium text-[#22D3EE] transition-colors duration-150 hover:text-white"
          >
            {pageCopy.browseProgramsLink}
          </Link>
          </CinematicListingHeader>
        </BlurReveal>

        <PremiumPageShell className="max-w-[1200px] px-6">
          <ScrollTicker
            speed={50}
            direction="right"
            items={[
              "CUTTING",
              "BULKING",
              "DAILY MEALS",
              "MACRO TRACKING",
              "LEAN BULK",
              "CLEAN CUT",
              "KETO",
              "ATHLETE FUEL",
              "WEEKLY PROGRESSION"
            ]}
            className="mb-10 text-[#1E2028]"
          />

          <BlurReveal delay={100}>
            <ListingFilterBar label={pageCopy.filterLabel}>
            <div className="flex flex-wrap items-center gap-1 px-1">
              <span className="me-1 text-xs text-[#52525B]">{pageCopy.filterType}:</span>
              {(
                [
                  ["all", pageCopy.all],
                  ["cutting", pageCopy.cutting],
                  ["bulking", pageCopy.bulking]
                ] as const
              ).map(([k, label]) => (
                <FilterPill
                  key={k}
                  active={phaseFilter === k}
                  onClick={() => {
                    setPhaseFilter(k);
                    syncPhaseToUrl(k, freeFilter);
                  }}
                >
                  {label}
                </FilterPill>
              ))}
              {(
                [
                  ["all", freeFilterCopy[locale].all],
                  ["free", freeFilterCopy[locale].free]
                ] as const
              ).map(([k, label]) => (
                <FilterPill
                  key={`free-${k}`}
                  active={freeFilter === k}
                  onClick={() => {
                    const next = k as FreeFilter;
                    setFreeFilter(next);
                    syncPhaseToUrl(phaseFilter, next);
                  }}
                >
                  {label}
                </FilterPill>
              ))}
              {filterActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setPhaseFilter("all");
                    setFreeFilter("all");
                    syncPhaseToUrl("all", "all");
                  }}
                  className="ms-1 min-h-[44px] px-2 text-[13px] font-medium text-[#22D3EE] transition-colors duration-150 hover:text-white sm:min-h-0"
                >
                  {pageCopy.clearFilters}
                </button>
              ) : null}
            </div>
            </ListingFilterBar>
          </BlurReveal>

      <StaggerRevealGrid className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((program) => {
          const phase = getDietPhase(program);
          const spec = getDietCalorieSpec(program);
          const metaLine = spec
            ? spec.mode === "target"
              ? pageCopy.formatTargetKcal(spec.kcal)
              : pageCopy.formatRangeKcal(spec.min, spec.max)
            : pageCopy.macroFocused;
          const typeTag = phase === "cutting" ? pageCopy.typeTagCutting : pageCopy.typeTagBulking;

          return (
            <BlurReveal key={program.slug} delay={60}>
              <ProgramCard
              key={program.slug}
              program={program}
              href={`/${params.locale}/programs/${program.slug}`}
              viewLabel={program.is_free ? copy.viewDiet : copy.getFullAccess}
              categoryLabelOverride={typeTag}
              metaLine={metaLine}
              freeBadgeLabel={program.is_free ? copy.freeBadge : undefined}
              showPaidLock={!program.is_free}
              premiumLockedHint={copy.premiumLockedHint}
              priceLabel={
                program.is_free ? copy.freePriceLabel : formatProgramPrice(getProgramBasePriceTry(program), locale)
              }
              tierLabel={
                program.is_free
                  ? tierLabels.fresh
                  : program.difficulty.toLowerCase().includes("advanced")
                    ? tierLabels.elite
                    : tierLabels.signature
              }
              />
            </BlurReveal>
          );
        })}
      </StaggerRevealGrid>

      {filterActive && filtered.length === 0 && allDiets.length > 0 ? (
        <div className="tj-empty-state mt-10">
          <div className="mx-auto max-w-[300px]">
            <p className="text-[32px] text-[var(--color-text-muted)]" aria-hidden>
              ⌕
            </p>
            <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-secondary)]">{pageCopy.emptyFilterTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{pageCopy.emptyFilterSub}</p>
            <button
              type="button"
              onClick={() => {
                setPhaseFilter("all");
                setFreeFilter("all");
                syncPhaseToUrl("all", "all");
              }}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)]"
            >
              {pageCopy.clearFilters}
            </button>
          </div>
        </div>
      ) : null}

      <p className="mt-10 text-center text-xs text-[var(--color-text-muted)]">{copy.trustDietsGrid}</p>

      {/* TJAI upsell */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-teal-400/20 bg-[linear-gradient(135deg,rgba(20,184,166,0.06)_0%,rgba(34,211,238,0.06)_100%)] p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">
              {locale === "tr" ? "TJAI BESLENME" : locale === "ar" ? "TJAI للتغذية" : locale === "es" ? "NUTRICIÓN TJAI" : locale === "fr" ? "NUTRITION TJAI" : "TJAI NUTRITION"}
            </p>
            <h3 className="mt-2 text-lg font-bold text-white">
              {locale === "tr" ? "Kişiselleştirilmiş beslenme planı al" : locale === "ar" ? "احصل على خطة تغذية مخصصة" : locale === "es" ? "Obtén tu plan nutricional personalizado" : locale === "fr" ? "Obtenez votre plan nutritionnel personnalisé" : "Get a meal plan built around your exact macros"}
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              {locale === "tr" ? "TJAI hedeflerine, kısıtlamalarına ve bütçene göre beslenme planı hazırlar." : locale === "ar" ? "يبني TJAI خطة وجبات بناءً على أهدافك وقيودك وميزانيتك." : locale === "es" ? "TJAI crea tu plan basándose en tus metas, restricciones y presupuesto." : locale === "fr" ? "TJAI crée votre plan selon vos objectifs, restrictions et budget." : "TJAI builds your meal plan around your goals, restrictions, and budget."}
            </p>
          </div>
          <Link
            href={`/${locale}/ai`}
            className="shrink-0 rounded-full bg-teal-400 px-6 py-3 text-sm font-bold text-[#09090B] transition hover:scale-105 hover:bg-white"
          >
            {locale === "tr" ? "TJAI'yı Dene →" : locale === "ar" ? "جرّب TJAI ←" : locale === "es" ? "Probar TJAI →" : locale === "fr" ? "Essayer TJAI →" : "Build My Meal Plan →"}
          </Link>
        </div>
      </div>

      <div className="mt-12 border-t border-[var(--color-border)] pt-12 text-center">
        <Link
          href={`/${params.locale}/programs/${programs.find((p) => p.is_free && p.category.toLowerCase() === "nutrition")?.slug ?? "clean-cut-starter"}`}
          className="inline-flex min-h-[48px] items-center justify-center text-sm font-semibold text-[#22D3EE] transition-colors duration-150 hover:text-white"
        >
          {pageCopy.footerCta}
        </Link>
      </div>
        </PremiumPageShell>
      </div>
    </>
  );
}
