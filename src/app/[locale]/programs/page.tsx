"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { BlurReveal } from "@/components/blur-reveal";
import { CinematicListingHeader } from "@/components/cinematic-listing-header";
import { FilterPill, ListingFilterBar } from "@/components/listing-filter-bar";
import { PremiumPageShell } from "@/components/premium";
import { StaggerRevealGrid } from "@/components/stagger-reveal-grid";
import { ScrollTicker } from "@/components/ui/ScrollTicker";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { ProgramCard } from "@/components/ui";
import { programs, Program } from "@/lib/content";
import { Locale, isLocale } from "@/lib/i18n";
import { formatProgramPrice, getProgramBasePriceTry, getProgramUiCopy, localizeProgram } from "@/lib/program-localization";
import { useAuth } from "@/components/auth-provider";
import { getProgramManagementCopy } from "@/lib/program-management-copy";
import { getProgramsMarketplaceCopy } from "@/lib/programs-marketplace-copy";

type CustomProgramCard = Program & { isCustomUpload?: boolean };

type GoalFilter = "all" | "fat" | "muscle";
type LocFilter = "all" | "home" | "gym";

function programMeta(p: Program | CustomProgramCard) {
  const slug = p.slug.toLowerCase();
  const cat = p.category.toLowerCase();
  const goal: "fat" | "muscle" | "other" = cat.includes("fat")
    ? "fat"
    : cat.includes("muscle") || cat.includes("strength")
      ? "muscle"
      : "other";
  const location: "home" | "gym" | "any" = slug.startsWith("home") ? "home" : slug.startsWith("gym") ? "gym" : "any";
  return { goal, location };
}

function programMatchesFilters(p: Program | CustomProgramCard, goal: GoalFilter, loc: LocFilter) {
  const m = programMeta(p);
  if (goal === "fat") {
    if (m.goal !== "fat") return false;
    if (loc === "home") return m.location === "home" || m.location === "any";
    if (loc === "gym") return m.location === "gym" || m.location === "any";
    return true;
  }
  if (goal === "muscle") {
    if (m.goal !== "muscle") return false;
    if (loc === "home") return m.location === "home" || m.location === "any";
    if (loc === "gym") return m.location === "gym" || m.location === "any";
    return true;
  }

  if (loc === "all") return true;
  if (loc === "home") return m.location === "home" || m.location === "any";
  if (loc === "gym") return m.location === "gym" || m.location === "any";
  return true;
}

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
  const [uploadedPrograms, setUploadedPrograms] = useState<CustomProgramCard[]>([]);
  const [customCatalogReady, setCustomCatalogReady] = useState(true);
  const [goalFilter, setGoalFilter] = useState<GoalFilter>("all");
  const [locFilter, setLocFilter] = useState<LocFilter>("all");

  const canUpload = role === "admin" || role === "coach";

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
        const data = await res.json();
        const mapped = (data.programs ?? []).map((item: any) => ({
          slug: item.slug,
          title: item.title,
          category: item.category,
          difficulty: item.difficulty ?? "Beginner to Advanced",
          duration: item.duration ?? "12 weeks",
          price: item.price_try ?? 400,
          description: item.description,
          coachSlug: "tjfit-team",
          requiredEquipment: [],
          previewImages: [programManagementCopy.uploadedProgramPreview],
          assets: [{ type: "pdf-guide" as const, label: programManagementCopy.uploadedPdfAsset }],
          coachCommissionRate: 0,
          isCustomUpload: true
        })) as CustomProgramCard[];
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
  }, [locale, programManagementCopy.uploadedPdfAsset, programManagementCopy.uploadedProgramPreview]);

  useEffect(() => {
    const goal = searchParams.get("goal");
    const location = searchParams.get("location");
    setGoalFilter(goal === "fat" || goal === "muscle" ? goal : "all");
    setLocFilter(location === "home" || location === "gym" ? location : "all");
  }, [searchParams]);

  const syncFiltersToUrl = (nextGoal: GoalFilter, nextLoc: LocFilter) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (nextGoal === "all") qs.delete("goal");
    else qs.set("goal", nextGoal);
    if (nextLoc === "all") qs.delete("location");
    else qs.set("location", nextLoc);
    const query = qs.toString();
    router.replace(query ? `/${locale}/programs?${query}` : `/${locale}/programs`);
  };

  const allPrograms = useMemo(() => {
    const training = programs
      .filter((item) => item.category.toLowerCase() !== "nutrition")
      .map((item) => localizeProgram(item, locale));
    return [...uploadedPrograms, ...training];
  }, [uploadedPrograms, locale]);

  const filteredPrograms = useMemo(
    () => allPrograms.filter((p) => programMatchesFilters(p, goalFilter, locFilter)),
    [allPrograms, goalFilter, locFilter]
  );

  const filterActive = goalFilter !== "all" || locFilter !== "all";

  if (!localeValid) {
    notFound();
  }

  const tierLabels =
    locale === "tr"
      ? { elite: "Elite", popular: "Populer", fresh: "Yeni", signature: "Ozel" }
      : locale === "ar"
        ? { elite: "نخبة", popular: "الاكثر طلبا", fresh: "جديد", signature: "مميز" }
        : locale === "es"
          ? { elite: "Elite", popular: "Popular", fresh: "Nuevo", signature: "Signature" }
          : locale === "fr"
            ? { elite: "Elite", popular: "Populaire", fresh: "Nouveau", signature: "Signature" }
            : { elite: "Elite", popular: "Popular", fresh: "New", signature: "Signature" };
  return (
    <>
      <AmbientBackground />
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

        <PremiumPageShell className="relative z-[1] max-w-[1200px] px-6">
          <ScrollTicker
            speed={50}
            items={[
              "FAT LOSS",
              "MUSCLE GAIN",
              "HOME WORKOUTS",
              "GYM TRAINING",
              "12 WEEKS",
              "PROGRESSIVE OVERLOAD",
              "STRUCTURED SYSTEMS"
            ]}
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
                  ["muscle", filterCopy.goalMuscle]
                ] as const
              ).map(([k, label]) => (
                <FilterPill
                  key={k}
                  active={goalFilter === k}
                  onClick={() => {
                    setGoalFilter(k);
                    syncFiltersToUrl(k, locFilter);
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
                  ["gym", filterCopy.locGym]
                ] as const
              ).map(([k, label]) => (
                <FilterPill
                  key={k}
                  active={locFilter === k}
                  onClick={() => {
                    setLocFilter(k);
                    syncFiltersToUrl(goalFilter, k);
                  }}
                >
                  {label}
                </FilterPill>
              ))}
              {filterActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setGoalFilter("all");
                    setLocFilter("all");
                    syncFiltersToUrl("all", "all");
                  }}
                  className="ms-1 min-h-[44px] px-2 text-[13px] font-medium text-[#22D3EE] transition-colors duration-150 hover:text-white sm:min-h-0"
                >
                  {filterCopy.clearFilters}
                </button>
              ) : null}
            </div>
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
          const m = programMeta(program);
          const goalBadge = m.goal === "fat" ? filterCopy.goalFat : m.goal === "muscle" ? filterCopy.goalMuscle : undefined;
          const locationBadge =
            m.location === "home" ? filterCopy.locHome : m.location === "gym" ? filterCopy.locGym : undefined;
          const isFree = !("isCustomUpload" in program && program.isCustomUpload) && Boolean(program.is_free);
          const isPaidLocked = "isCustomUpload" in program && program.isCustomUpload ? true : !program.is_free;

          return (
            <BlurReveal key={program.slug} delay={60}>
              <ProgramCard
              key={program.slug}
              program={program}
              href={`/${params.locale}/programs/${program.slug}`}
              viewLabel={isFree ? copy.viewProgram : copy.getFullAccess}
              trainingGoalBadge={goalBadge}
              trainingLocationBadge={locationBadge}
              freeBadgeLabel={
                "isCustomUpload" in program && program.isCustomUpload ? undefined : program.is_free ? copy.freeBadge : undefined
              }
              showPaidLock={isPaidLocked}
              premiumLockedHint={copy.premiumLockedHint}
              priceLabel={
                "isCustomUpload" in program && program.isCustomUpload
                  ? formatProgramPrice(program.price, locale)
                  : program.is_free
                    ? copy.freePriceLabel
                    : formatProgramPrice(getProgramBasePriceTry(program), locale)
              }
              tierLabel={
                program.slug.includes("advanced") || program.slug.includes("hardcore")
                  ? tierLabels.elite
                  : program.slug.includes("pro") || program.slug.includes("shred")
                    ? tierLabels.popular
                    : program.slug.includes("starter") || program.slug.includes("beginner")
                      ? tierLabels.fresh
                      : tierLabels.signature
              }
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
                syncFiltersToUrl("all", "all");
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
    </>
  );
}
