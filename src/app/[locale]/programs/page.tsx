"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { BlurReveal } from "@/components/blur-reveal";
import { TJHeroStage } from "@/components/3d/hero-stage";
import { TJ_PALETTE } from "@/components/3d/palette";
import { CinematicListingHeader } from "@/components/cinematic-listing-header";
import { FilterPill, ListingFilterBar } from "@/components/listing-filter-bar";
import { PremiumPageShell } from "@/components/premium";
import { StaggerRevealGrid } from "@/components/stagger-reveal-grid";
import { ScrollTicker } from "@/components/ui/ScrollTicker";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { ProgramCard } from "@/components/ui";
import { programs } from "@/lib/content";
import type { PublicCustomProgramRow } from "@/lib/custom-programs";
import { Locale, isLocale } from "@/lib/i18n";
import {
  type CatalogGoalFilter,
  type CatalogLevelFilter,
  type CatalogLocationFilter,
  type CatalogProgram,
  type CatalogSortKey,
  matchesCatalogFilters,
  normalizeCatalogProgram,
  normalizePublicCustomProgramRow,
  sortCatalogPrograms
} from "@/lib/program-catalog";
import { formatProgramPrice, getProgramUiCopy, localizeProgram } from "@/lib/program-localization";
import { useAuth } from "@/components/auth-provider";
import { getProgramManagementCopy } from "@/lib/program-management-copy";
import { getProgramsMarketplaceCopy } from "@/lib/programs-marketplace-copy";

type FreeFilter = "all" | "free";

type CustomProgramsResponse = {
  programs?: PublicCustomProgramRow[];
};

export default function ProgramsPage({ params }: { params: { locale: string } }) {
  const rawLocale = params?.locale ?? "";
  const localeValid = isLocale(rawLocale);
  const locale = (localeValid ? rawLocale : "en") as Locale;
  const copy = getProgramUiCopy(locale);
  const filterCopy = getProgramsMarketplaceCopy(locale);
  const programManagementCopy = getProgramManagementCopy(locale);
  const loadingProgramsAria: Record<Locale, string> = {
    en: "Loading programs",
    tr: "Programlar yukleniyor",
    ar: "جار تحميل البرامج",
    es: "Cargando programas",
    fr: "Chargement des programmes"
  };
  const { role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadedPrograms, setUploadedPrograms] = useState<CatalogProgram[]>([]);
  const [customCatalogReady, setCustomCatalogReady] = useState(true);
  const [goalFilter, setGoalFilter] = useState<CatalogGoalFilter>("all");
  const [locFilter, setLocFilter] = useState<CatalogLocationFilter>("all");
  const [levelFilter, setLevelFilter] = useState<CatalogLevelFilter>("all");
  const [freeFilter, setFreeFilter] = useState<FreeFilter>("all");
  const [sortKey, setSortKey] = useState<CatalogSortKey>("featured");

  const canUpload = role === "admin" || role === "coach";

  // Parallax scroll for background image
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallaxY, setParallaxY] = useState(0);
  useEffect(() => {
    const fn = () => {
      if (window.innerWidth < 768) return;
      setParallaxY(window.scrollY * 0.12);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  const freeFilterCopy: Record<Locale, { label: string; all: string; free: string }> = {
    en: { label: "Access", all: "All", free: "Free" },
    tr: { label: "Erisim", all: "Tum", free: "Ucretsiz" },
    ar: { label: "الوصول", all: "الكل", free: "مجاني" },
    es: { label: "Acceso", all: "Todo", free: "Gratis" },
    fr: { label: "Acces", all: "Tous", free: "Gratuit" }
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    const loadCustomPrograms = async () => {
      setCustomCatalogReady(false);
      try {
        const res = await fetch(`/api/programs/custom?locale=${locale}`, { credentials: "include", signal: controller.signal });
        if (!res.ok) {
          console.error("Programs fetch error:", { status: res.status, statusText: res.statusText });
          return;
        }
        const data = (await res.json()) as CustomProgramsResponse;
        const mapped = (data.programs ?? []).map((item) => normalizePublicCustomProgramRow(item, locale));
        if (!cancelled) setUploadedPrograms(mapped);
      } catch (error) {
        if (!cancelled) {
          console.error("Programs fetch error:", error);
        }
      } finally {
        window.clearTimeout(timeout);
        if (!cancelled) setCustomCatalogReady(true);
      }
    };
    loadCustomPrograms();
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [locale]);

  useEffect(() => {
    const goal = searchParams.get("goal");
    const location = searchParams.get("location");
    const level = searchParams.get("level");
    const sort = searchParams.get("sort");
    const free = searchParams.get("free") === "1" || searchParams.get("filter") === "free";
    setGoalFilter(goal === "fat" || goal === "muscle" || goal === "recomp" || goal === "performance" ? goal : "all");
    setLocFilter(location === "home" || location === "gym" || location === "hybrid" ? location : "all");
    setLevelFilter(level === "beginner" || level === "intermediate" || level === "advanced" ? level : "all");
    setFreeFilter(free ? "free" : "all");
    setSortKey(sort === "price_low" || sort === "price_high" ? sort : "featured");
  }, [searchParams]);

  const syncFiltersToUrl = (
    nextGoal: CatalogGoalFilter,
    nextLoc: CatalogLocationFilter,
    nextLevel: CatalogLevelFilter,
    nextFree: FreeFilter,
    nextSort: CatalogSortKey
  ) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (nextGoal === "all") qs.delete("goal");
    else qs.set("goal", nextGoal);
    if (nextLoc === "all") qs.delete("location");
    else qs.set("location", nextLoc);
    if (nextLevel === "all") qs.delete("level");
    else qs.set("level", nextLevel);
    if (nextFree === "all") {
      qs.delete("free");
      qs.delete("filter");
    } else {
      qs.set("free", "1");
      qs.set("filter", "free");
    }
    if (nextSort === "featured") qs.delete("sort");
    else qs.set("sort", nextSort);
    const query = qs.toString();
    router.replace(query ? `/${locale}/programs?${query}` : `/${locale}/programs`);
  };

  const allPrograms = useMemo(() => {
    const training = programs
      .filter((item) => item.category.toLowerCase() !== "nutrition")
      .map((item) => normalizeCatalogProgram(localizeProgram(item, locale), locale));
    return [...uploadedPrograms, ...training];
  }, [uploadedPrograms, locale]);

  const filteredPrograms = useMemo(() => {
    const filtered = allPrograms.filter((program) =>
      matchesCatalogFilters(program, {
        goal: goalFilter,
        location: locFilter,
        level: levelFilter,
        freeOnly: freeFilter === "free"
      })
    );
    return sortCatalogPrograms(filtered, sortKey);
  }, [allPrograms, goalFilter, locFilter, levelFilter, freeFilter, sortKey]);

  const filterActive = goalFilter !== "all" || locFilter !== "all" || levelFilter !== "all" || freeFilter !== "all";

  if (!localeValid) notFound();

  return (
    <div ref={containerRef} className="relative min-h-screen" style={{ background: TJ_PALETTE.obsidian }}>
      {/* 3D stage band — stylized dumbbell centerpiece for the programs surface */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[72vh] overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            transform: `translateY(${parallaxY * 0.6}px)`,
            maskImage: "linear-gradient(180deg, black 0%, black 55%, transparent 95%)"
          }}
        >
          <TJHeroStage variant="dumbbell" speed={0.8} intensity={0.9} />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 90% 70% at 70% 25%, rgba(212,165,116,0.14), transparent 60%), linear-gradient(180deg, transparent 0%, ${TJ_PALETTE.obsidian} 85%)`
          }}
        />
      </div>

      {/* Editorial watermark */}
      <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-8 overflow-hidden" aria-hidden>
        <p
          className="animate-float-slow select-none whitespace-nowrap font-display text-[8vw] font-black uppercase tracking-[0.28em]"
          style={{ opacity: 0.03, color: TJ_PALETTE.textPrimary }}
        >
          TRAIN LIKE YOU MEAN IT
        </p>
        <p
          className="select-none whitespace-nowrap font-display text-[5vw] font-black uppercase tracking-[0.3em]"
          style={{ opacity: 0.025, color: TJ_PALETTE.champagne, animationDelay: "1s" }}
        >
          STRUCTURE · DISCIPLINE · RESULTS
        </p>
      </div>

      <div className="relative z-[1]">
        <BlurReveal>
          <CinematicListingHeader
            eyebrow={filterCopy.cinematicEyebrow}
            headlineBefore={filterCopy.cinematicHeadlineBefore}
            headlineGradient={filterCopy.cinematicHeadlineGradient}
            sub={filterCopy.cinematicSub}
          >
          <Link
            href={`/${params.locale}/diets`}
            className="text-sm font-medium text-[#22D3EE] transition-colors duration-150 hover:text-white"
          >
            {filterCopy.browseDietsLink}
          </Link>
          {canUpload ? (
            <Link
              href={`/${params.locale}/programs/upload`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#1E2028] px-4 py-2 text-sm text-white transition-[border-color,background-color] duration-150 hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)]"
              title={programManagementCopy.uploadCtaTitle}
            >
              <Plus className="h-4 w-4" />
              {programManagementCopy.upload}
            </Link>
          ) : null}
          </CinematicListingHeader>
        </BlurReveal>

        <PremiumPageShell className="relative z-[1] max-w-[1200px] px-6" ghostWord="PROGRAMS">
          <ScrollTicker
            speed={50}
            items={filterCopy.tickerPrimary}
            className="mb-3 text-[#1E2028]"
          />
          <ScrollTicker
            speed={56}
            direction="right"
            items={filterCopy.tickerSecondary}
            className="mb-10 text-[#1E2028]"
          />

          <BlurReveal delay={100}>
            <ListingFilterBar label={filterCopy.filterLabel}>
            <div className="flex flex-wrap items-center gap-1 px-1">
              <span className="me-1 text-xs text-[#52525B]">{filterCopy.filterGoal}:</span>
              {(
                [
                  ["all", filterCopy.all],
                  ["fat", filterCopy.goalFat],
                  ["muscle", filterCopy.goalMuscle],
                  ["recomp", filterCopy.goalRecomp],
                  ["performance", filterCopy.goalPerformance]
                ] as const
              ).map(([k, label]) => (
                <FilterPill
                  key={k}
                  active={goalFilter === k}
                  onClick={() => {
                    setGoalFilter(k);
                    syncFiltersToUrl(k, locFilter, levelFilter, freeFilter, sortKey);
                  }}
                >
                  {label}
                </FilterPill>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1 px-1">
              <span className="me-1 text-xs text-[#52525B]">{filterCopy.filterLocation}:</span>
              {(
                [
                  ["all", filterCopy.all],
                  ["home", filterCopy.locHome],
                  ["gym", filterCopy.locGym],
                  ["hybrid", filterCopy.locHybrid]
                ] as const
              ).map(([k, label]) => (
                <FilterPill
                  key={k}
                  active={locFilter === k}
                  onClick={() => {
                    setLocFilter(k);
                    syncFiltersToUrl(goalFilter, k, levelFilter, freeFilter, sortKey);
                  }}
                >
                  {label}
                </FilterPill>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1 px-1">
              <span className="me-1 text-xs text-[#52525B]">{filterCopy.filterLevel}:</span>
              {(
                [
                  ["all", filterCopy.all],
                  ["beginner", filterCopy.levelBeginner],
                  ["intermediate", filterCopy.levelIntermediate],
                  ["advanced", filterCopy.levelAdvanced]
                ] as const
              ).map(([k, label]) => (
                <FilterPill
                  key={k}
                  active={levelFilter === k}
                  onClick={() => {
                    setLevelFilter(k);
                    syncFiltersToUrl(goalFilter, locFilter, k, freeFilter, sortKey);
                  }}
                >
                  {label}
                </FilterPill>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1 px-1">
              <span className="me-1 text-xs text-[#52525B]">{freeFilterCopy[locale].label}:</span>
              {(
                [
                  ["all", freeFilterCopy[locale].all],
                  ["free", freeFilterCopy[locale].free]
                ] as const
              ).map(([k, label]) => (
                <FilterPill
                  key={k}
                  active={freeFilter === k}
                  onClick={() => {
                    const next = k as FreeFilter;
                    setFreeFilter(next);
                    syncFiltersToUrl(goalFilter, locFilter, levelFilter, next, sortKey);
                  }}
                >
                  {label}
                </FilterPill>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 px-1">
              <span className="me-1 text-xs text-[#52525B]">{filterCopy.sortLabel}:</span>
              <select
                value={sortKey}
                onChange={(event) => {
                  const next = event.target.value as CatalogSortKey;
                  setSortKey(next);
                  syncFiltersToUrl(goalFilter, locFilter, levelFilter, freeFilter, next);
                }}
                className="min-h-[44px] rounded-lg border border-[#1E2028] bg-[#0D1015] px-3 py-2 text-sm text-white outline-none transition-colors duration-150 hover:border-[rgba(255,255,255,0.12)] sm:min-h-0"
              >
                <option value="featured">{filterCopy.sortFeatured}</option>
                <option value="price_low">{filterCopy.sortPriceLow}</option>
                <option value="price_high">{filterCopy.sortPriceHigh}</option>
              </select>
            </div>
            
              {filterActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setGoalFilter("all");
                    setLocFilter("all");
                    setLevelFilter("all");
                    setFreeFilter("all");
                    syncFiltersToUrl("all", "all", "all", "all", sortKey);
                  }}
                  className="ms-1 min-h-[44px] px-2 text-[13px] font-medium text-[#22D3EE] transition-colors duration-150 hover:text-white sm:min-h-0"
                >
                  {filterCopy.clearFilters}
                </button>
              ) : null}
            </ListingFilterBar>
          </BlurReveal>

      {!customCatalogReady && allPrograms.length === 0 ? (
        <div
          className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
          aria-label={loadingProgramsAria[locale]}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="flex min-h-[320px] flex-col rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <div className="tj-skeleton aspect-video w-full rounded-[10px]" />
              <div className="tj-skeleton mt-4 h-4 w-2/3" />
              <div className="tj-skeleton mt-3 h-3 w-full" />
              <div className="tj-skeleton mt-2 h-3 w-5/6" />
              <div className="tj-skeleton mt-auto h-11 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : (
      <StaggerRevealGrid className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPrograms.map((program) => {
          const isFree = !program.isCustomUpload && Boolean(program.is_free);
          const isPaidLocked = program.isCustomUpload ? true : !program.is_free;

          return (
            <BlurReveal key={program.slug} delay={60}>
              <ProgramCard
              key={program.slug}
              program={program}
              href={`/${params.locale}/programs/${program.slug}`}
              viewLabel={isFree ? copy.viewProgram : copy.getFullAccess}
              metaLine={program.display.metaLine}
              trainingGoalBadge={program.display.goalBadge}
              trainingLocationBadge={program.display.locationBadge}
              freeBadgeLabel={program.isCustomUpload ? undefined : program.is_free ? copy.freeBadge : undefined}
              showPaidLock={isPaidLocked}
              premiumLockedHint={copy.premiumLockedHint}
              priceLabel={program.is_free ? copy.freePriceLabel : formatProgramPrice(program.price, locale)}
              tierLabel={program.display.tierLabel}
              flipOnHover
              />
            </BlurReveal>
          );
        })}
      </StaggerRevealGrid>
      )}
      {filterActive && filteredPrograms.length === 0 && allPrograms.length > 0 ? (
        <div className="tj-empty-state mt-10">
          <div className="mx-auto max-w-[300px]">
            <p className="text-[32px] text-[var(--color-text-muted)]" aria-hidden>
              ⌕
            </p>
            <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-secondary)]">{filterCopy.emptyFilterTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{filterCopy.emptyFilterSub}</p>
            <button
              type="button"
              onClick={() => {
                setGoalFilter("all");
                setLocFilter("all");
                setLevelFilter("all");
                setFreeFilter("all");
                syncFiltersToUrl("all", "all", "all", "all", sortKey);
              }}
              className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-[10px] border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)]"
            >
              {filterCopy.clearFilters}
            </button>
          </div>
        </div>
      ) : null}
      {customCatalogReady && allPrograms.length === 0 ? (
        <div className="tj-empty-state mt-10">
          <p className="text-sm text-[var(--color-text-muted)]">{programManagementCopy.noProgramsPublished}</p>
        </div>
      ) : null}

      {allPrograms.length > 0 ? (
        <>
          <p className="mt-10 text-center text-xs text-[var(--color-text-muted)]">{copy.trustProgramsGrid}</p>

          {/* Bundle upsell banner */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.06)_0%,rgba(167,139,250,0.06)_100%)] p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22D3EE]">
                  {locale === "tr" ? "ÖZEL TEKLİF" : locale === "ar" ? "عرض خاص" : locale === "es" ? "OFERTA ESPECIAL" : locale === "fr" ? "OFFRE SPÉCIALE" : "BUNDLE DEAL"}
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  {locale === "tr"
                    ? "TJAI ile sana özel 12 haftalık plan — önizleme ücretsiz, tam plan ücretli"
                    : locale === "ar"
                      ? "خطة 12 أسبوعاً مبنية لك مع TJAI — معاينة مجانية، الخطة الكاملة مدفوعة"
                      : locale === "es"
                        ? "Plan 12 semanas hecho para ti con TJAI — vista previa gratis, plan completo de pago"
                        : locale === "fr"
                          ? "Plan 12 semaines sur mesure avec TJAI — aperçu gratuit, plan complet payant"
                          : "A 12-week plan built around you with TJAI — free preview, full plan paid"}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {locale === "tr"
                    ? "25 soruyu cevapla, önizleme ve metrikleri gör. Tam kişisel antrenman + beslenme planını ücret karşılığı aç."
                    : locale === "ar"
                      ? "أجب عن 25 سؤالاً لمعاينة ملخصك. الدفع يفتح خطتك الكاملة للتدريب والتغذية."
                      : locale === "es"
                        ? "Responde 25 preguntas para tu vista previa. Paga para generar tu plan completo de entreno + nutrición."
                        : locale === "fr"
                          ? "Répondez aux 25 questions pour l’aperçu. Payez pour générer votre plan complet entraînement + nutrition."
                          : "Answer 25 questions for your preview. Pay to unlock your full personalized training + nutrition plan."}
                </p>
              </div>
              <Link
                href={`/${locale}/ai`}
                className="shrink-0 rounded-full bg-[#22D3EE] px-6 py-3 text-sm font-bold text-[#09090B] transition hover:scale-105 hover:bg-white"
              >
                {locale === "tr"
                  ? "TJAI Önizlemesi →"
                  : locale === "ar"
                    ? "معاينة TJAI ←"
                    : locale === "es"
                      ? "Vista previa TJAI →"
                      : locale === "fr"
                        ? "Aperçu TJAI →"
                        : "Start TJAI Preview →"}
              </Link>
            </div>
          </div>

          <div className="mt-12 border-t border-[var(--color-border)] pt-12 text-center">
            <Link
              href={`/${params.locale}/programs/${programs.find((p) => p.is_free && p.category.toLowerCase() !== "nutrition")?.slug ?? "home-fat-loss-starter"}`}
              className="inline-flex min-h-[48px] items-center justify-center text-sm font-semibold text-[#22D3EE] transition-colors duration-150 hover:text-white"
            >
              {filterCopy.footerCta}
            </Link>
          </div>
        </>
      ) : null}
        </PremiumPageShell>
      </div>

      {/* Floating TJAI CTA */}
      <div className="floating-tjai-cta">
        <Link
          href={`/${locale}/ai`}
          className="group flex items-center gap-2.5 rounded-full bg-[#22D3EE] px-5 py-3 text-sm font-bold text-[#09090B] shadow-[0_4px_24px_rgba(34,211,238,0.35)] transition-all duration-200 hover:scale-105 hover:shadow-[0_6px_32px_rgba(34,211,238,0.5)]"
        >
          <Sparkles className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
          {locale === "tr" ? "TJAI ile Plan Al" : locale === "ar" ? "احصل على خطة مع TJAI" : locale === "es" ? "Obtén un plan con TJAI" : locale === "fr" ? "Obtenir un plan TJAI" : "Build My Plan with TJAI"}
        </Link>
      </div>
    </div>
  );
}
