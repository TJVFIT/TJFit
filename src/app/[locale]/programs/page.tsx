"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PremiumPageShell } from "@/components/premium";
import { ProgramCard, SectionHeading } from "@/components/ui";
import { programs, Program } from "@/lib/content";
import { Locale, isLocale } from "@/lib/i18n";
import { formatProgramPrice, getProgramBasePriceTry, getProgramUiCopy, localizeProgram } from "@/lib/program-localization";
import { useAuth } from "@/components/auth-provider";
import { getProgramManagementCopy } from "@/lib/program-management-copy";
import { getProgramsMarketplaceCopy } from "@/lib/programs-marketplace-copy";
import { cn } from "@/lib/utils";

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
  const { role } = useAuth();
  const [uploadedPrograms, setUploadedPrograms] = useState<CustomProgramCard[]>([]);
  const [customCatalogReady, setCustomCatalogReady] = useState(false);
  const [goalFilter, setGoalFilter] = useState<GoalFilter>("all");
  const [locFilter, setLocFilter] = useState<LocFilter>("all");

  const canUpload = role === "admin" || role === "coach";

  useEffect(() => {
    let cancelled = false;
    const loadCustomPrograms = async () => {
      try {
        const res = await fetch(`/api/programs/custom?locale=${locale}`, { credentials: "include" });
        if (!res.ok) return;
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
      } finally {
        if (!cancelled) setCustomCatalogReady(true);
      }
    };
    loadCustomPrograms();
    return () => {
      cancelled = true;
    };
  }, [locale, programManagementCopy.uploadedPdfAsset, programManagementCopy.uploadedProgramPreview]);

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
  const heading =
    locale === "tr"
      ? {
          eyebrow: "Program Pazari",
          title: "Hizli sonuc ve duzenli ilerleme icin dijital programlar.",
          body: "Yag yakimi, kondisyon ve kas gelisimi hedefleri icin yapilandirilmis programlari kesfedin."
        }
      : locale === "ar"
        ? {
            eyebrow: "سوق البرامج",
            title: "برامج رقمية لنتائج سريعة والتزام مستمر.",
            body: "تصفح برامج منظمة لحرق الدهون وتحسين اللياقة وبناء العضلات."
          }
        : locale === "es"
          ? {
              eyebrow: "Marketplace de Programas",
              title: "Programas digitales para resultados rapidos y constancia.",
              body: "Explora planes estructurados para perdida de grasa, condicion y ganancia muscular."
            }
          : locale === "fr"
            ? {
                eyebrow: "Marketplace de Programmes",
                title: "Programmes digitaux pour des resultats rapides et reguliers.",
                body: "Decouvrez des plans structures pour perte de graisse, condition physique et prise de muscle."
              }
            : {
                eyebrow: "Programs Marketplace",
                title: "Digital programs built for fast results and consistency.",
                body: "Browse structured training plans for fat loss, conditioning, and lean muscle goals. New programs are added weekly."
              };

  return (
    <PremiumPageShell className="max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeading eyebrow={heading.eyebrow} title={heading.title} copy={heading.body} />
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            href={`/${params.locale}/diets`}
            className="text-sm font-medium text-cyan-300/90 transition hover:text-cyan-200"
          >
            {filterCopy.browseDietsLink}
          </Link>
          {canUpload ? (
            <Link
              href={`/${params.locale}/programs/upload`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
              title={programManagementCopy.uploadCtaTitle}
            >
              <Plus className="h-4 w-4" />
              {programManagementCopy.upload}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{filterCopy.filterLabel}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">{filterCopy.filterGoal}:</span>
          {(
            [
              ["all", filterCopy.all],
              ["fat", filterCopy.goalFat],
              ["muscle", filterCopy.goalMuscle]
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setGoalFilter(k)}
              className={cn(
                "min-h-[44px] rounded-full border px-3 py-2 text-xs font-medium transition duration-200",
                goalFilter === k ? "border-cyan-400/40 bg-cyan-500/10 text-white" : "border-white/10 text-zinc-400 hover:border-white/20"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">{filterCopy.filterLocation}:</span>
          {(
            [
              ["all", filterCopy.all],
              ["home", filterCopy.locHome],
              ["gym", filterCopy.locGym]
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setLocFilter(k)}
              className={cn(
                "min-h-[44px] rounded-full border px-3 py-2 text-xs font-medium transition duration-200",
                locFilter === k ? "border-cyan-400/40 bg-cyan-500/10 text-white" : "border-white/10 text-zinc-400 hover:border-white/20"
              )}
            >
              {label}
            </button>
          ))}
          {filterActive ? (
            <button
              type="button"
              onClick={() => {
                setGoalFilter("all");
                setLocFilter("all");
              }}
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
            >
              {filterCopy.clearFilters}
            </button>
          ) : null}
        </div>
      </div>

      {!customCatalogReady ? (
        <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading programs">
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
      <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
        {filteredPrograms.map((program) => {
          const m = programMeta(program);
          const goalBadge = m.goal === "fat" ? filterCopy.goalFat : m.goal === "muscle" ? filterCopy.goalMuscle : undefined;
          const locationBadge =
            m.location === "home" ? filterCopy.locHome : m.location === "gym" ? filterCopy.locGym : undefined;
          const isFree = !("isCustomUpload" in program && program.isCustomUpload) && Boolean(program.is_free);
          const isPaidLocked = "isCustomUpload" in program && program.isCustomUpload ? true : !program.is_free;

          return (
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
            />
          );
        })}
      </div>
      )}
      {customCatalogReady && filterActive && filteredPrograms.length === 0 && allPrograms.length > 0 ? (
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

      {customCatalogReady ? (
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
  );
}
