"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { PremiumPageShell } from "@/components/premium";
import { ProgramCard, SectionHeading } from "@/components/ui";
import { programs, type Program } from "@/lib/content";
import { getDietCalorieSpec, getDietPhase, isCatalogDiet } from "@/lib/diet-catalog";
import { getDietsMarketplaceCopy } from "@/lib/diets-marketplace-copy";
import { Locale, isLocale } from "@/lib/i18n";
import { formatProgramPrice, getProgramBasePriceTry, getProgramUiCopy, localizeProgram } from "@/lib/program-localization";
import { cn } from "@/lib/utils";

type PhaseFilter = "all" | "cutting" | "bulking";

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
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");

  const allDiets = useMemo(
    () => programs.filter(isCatalogDiet).map((item) => localizeProgram(item, locale)),
    [locale]
  );

  const filtered = useMemo(
    () => allDiets.filter((p) => dietMatches(p, phaseFilter)),
    [allDiets, phaseFilter]
  );

  const filterActive = phaseFilter !== "all";

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
    <PremiumPageShell className="max-w-7xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow={pageCopy.eyebrow} title={pageCopy.title} copy={pageCopy.body} />
        <Link
          href={`/${params.locale}/programs`}
          className="shrink-0 text-sm font-medium text-cyan-300/90 transition hover:text-cyan-200"
        >
          {pageCopy.browseProgramsLink}
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{pageCopy.filterLabel}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">{pageCopy.filterType}:</span>
          {(
            [
              ["all", pageCopy.all],
              ["cutting", pageCopy.cutting],
              ["bulking", pageCopy.bulking]
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setPhaseFilter(k)}
              className={cn(
                "min-h-[40px] rounded-full border px-3 py-2 text-xs font-medium transition",
                phaseFilter === k ? "border-cyan-400/40 bg-cyan-500/10 text-white" : "border-white/10 text-zinc-400 hover:border-white/20"
              )}
            >
              {label}
            </button>
          ))}
          {filterActive ? (
            <button
              type="button"
              onClick={() => setPhaseFilter("all")}
              className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
            >
              {pageCopy.clearFilters}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
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
          );
        })}
      </div>

      {filterActive && filtered.length === 0 && allDiets.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-sm text-zinc-500">
          {pageCopy.noMatches}
        </div>
      ) : null}
    </PremiumPageShell>
  );
}
