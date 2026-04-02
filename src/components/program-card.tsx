"use client";

import Link from "next/link";
import { ArrowUpRight, Lock } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import type { Program } from "@/lib/content";
import { getProgramTier, getProgramVisual } from "@/lib/program-card-visual";
import { cn } from "@/lib/utils";

const shellClass =
  "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.06] via-[#111215]/90 to-[#0a0a0b] shadow-[0_20px_50px_-28px_rgba(0,0,0,0.85)] backdrop-blur-md transition-[box-shadow,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-[box-shadow,border-color] group-hover:-translate-y-1 group-hover:scale-[1.01] group-hover:border-cyan-400/22 group-hover:shadow-[0_28px_64px_-32px_rgba(0,0,0,0.9),0_0_0_1px_rgba(34,211,238,0.08),0_0_48px_-24px_rgba(34,211,238,0.14)] motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100";

const ctaPillClass = cn(
  "inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-cyan-400 to-sky-500 px-4 py-3 text-xs font-semibold text-[#05080a] sm:w-auto sm:justify-start sm:py-2.5",
  "shadow-[0_0_28px_-10px_rgba(34,211,238,0.5)] transition-[gap,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
  "group-hover:gap-2 group-hover:shadow-[0_0_36px_-8px_rgba(34,211,238,0.55)] group-active:scale-[0.98]"
);

function CtaPill({ label }: { label: string }) {
  return (
    <span className={ctaPillClass}>
      {label}
      <ArrowUpRight
        className="h-4 w-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden
      />
    </span>
  );
}

function PremiumProgramCardInner({
  visual,
  categoryLabel,
  tier,
  title,
  duration,
  metaLine,
  description,
  difficulty,
  priceLine,
  ctaLabel,
  showDescription = true,
  footerCta,
  freeBadgeLabel,
  showPaidLock,
  premiumLockedHint,
  trainingGoalBadge,
  trainingLocationBadge
}: {
  visual: ReturnType<typeof getProgramVisual>;
  categoryLabel: string;
  tier: string;
  title: string;
  duration: string;
  metaLine?: string;
  description?: string;
  difficulty?: string;
  priceLine: string;
  ctaLabel: string;
  showDescription?: boolean;
  footerCta: "link" | "button";
  freeBadgeLabel?: string;
  showPaidLock?: boolean;
  premiumLockedHint?: string;
  trainingGoalBadge?: string;
  trainingLocationBadge?: string;
}) {
  const cta =
    footerCta === "button" ? (
      <button type="button" className={cn(ctaPillClass, "cursor-default")}>
        {ctaLabel}
        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
      </button>
    ) : (
      <CtaPill label={ctaLabel} />
    );

  return (
    <>
      <div className="relative aspect-[4/3] w-full min-h-[11.5rem] shrink-0 overflow-hidden sm:aspect-[16/10] sm:min-h-0 sm:max-h-[200px]">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", visual.gradient)} aria-hidden />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.12),transparent)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/65 to-black/25"
          aria-hidden
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4 pb-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="max-w-[min(100%,12rem)] truncate rounded-full border border-white/[0.12] bg-black/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-100/95 backdrop-blur-md sm:max-w-[58%] sm:text-[10px] sm:tracking-[0.16em]">
                {categoryLabel}
              </span>
              {freeBadgeLabel ? (
                <span className="shrink-0 rounded-full border border-cyan-400/35 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur-sm">
                  {freeBadgeLabel}
                </span>
              ) : null}
            </div>
            {trainingGoalBadge || trainingLocationBadge ? (
              <div className="flex max-w-full flex-wrap gap-1.5">
                {trainingGoalBadge ? (
                  <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-100/95">
                    {trainingGoalBadge}
                  </span>
                ) : null}
                {trainingLocationBadge ? (
                  <span className="rounded-full border border-white/12 bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-200/90">
                    {trainingLocationBadge}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showPaidLock ? (
              <span
                className="inline-flex items-center justify-center rounded-full border border-white/18 bg-black/50 p-1.5 text-white backdrop-blur-sm"
                title={premiumLockedHint}
              >
                <Lock className="h-3.5 w-3.5 opacity-90" aria-hidden />
              </span>
            ) : null}
            <span className="rounded-full border border-white/18 bg-white/[0.1] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm sm:text-[10px] sm:tracking-[0.14em]">
              {tier}
            </span>
            <div className="rounded-xl border border-white/[0.1] bg-black/40 p-1 backdrop-blur-md ring-1 ring-white/[0.04]">
              <Logo variant="icon" size="card" linked={false} className="opacity-[0.98]" alt="" />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 pt-8">
          <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">
            <span className="line-clamp-2 [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">{title}</span>
          </h3>
          <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400">{duration}</p>
          {metaLine ? (
            <p className="mt-1.5 text-xs font-medium tabular-nums text-cyan-200/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
              {metaLine}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 pb-5 pt-4 sm:px-5">
        {showDescription && description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-500">{description}</p>
        ) : (
          <div className="min-h-[3.25rem]" aria-hidden />
        )}

        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <div className="min-w-0">
              {difficulty ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600 sm:text-[10px] sm:tracking-[0.2em]">
                  {difficulty}
                </p>
              ) : null}
              <p
                className={cn(
                  "text-pretty text-base font-medium tabular-nums text-white",
                  difficulty ? "mt-1" : ""
                )}
              >
                {priceLine}
              </p>
            </div>
            <div className="w-full shrink-0 sm:w-auto sm:self-end">{cta}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ProgramCard({
  program,
  href,
  viewLabel = "View Program",
  priceLabel,
  tierLabel,
  categoryLabelOverride,
  metaLine,
  freeBadgeLabel,
  showPaidLock,
  premiumLockedHint,
  trainingGoalBadge,
  trainingLocationBadge
}: {
  program: Program;
  href?: string;
  viewLabel?: string;
  priceLabel?: string;
  tierLabel?: string;
  /** Replaces program.category in the pill (e.g. Cutting / Bulking on diets grid). */
  categoryLabelOverride?: string;
  /** Extra line under duration on the card hero (e.g. calorie hint). */
  metaLine?: string;
  freeBadgeLabel?: string;
  showPaidLock?: boolean;
  premiumLockedHint?: string;
  trainingGoalBadge?: string;
  trainingLocationBadge?: string;
}) {
  const visual = getProgramVisual(program);
  const tier = tierLabel ?? getProgramTier(program);
  const priceLine = priceLabel ?? String(program.price);

  const inner = (
    <PremiumProgramCardInner
      visual={visual}
      categoryLabel={categoryLabelOverride ?? program.category}
      tier={tier}
      title={program.title}
      duration={program.duration}
      metaLine={metaLine}
      description={program.description}
      difficulty={program.difficulty}
      priceLine={priceLine}
      ctaLabel={viewLabel}
      showDescription
      footerCta={href ? "link" : "button"}
      freeBadgeLabel={freeBadgeLabel}
      showPaidLock={showPaidLock}
      premiumLockedHint={premiumLockedHint}
      trainingGoalBadge={trainingGoalBadge}
      trainingLocationBadge={trainingLocationBadge}
    />
  );

  return (
    <div className={cn("h-full", visual.glow)}>
      {href ? (
        <Link
          href={href}
          className={cn(
            shellClass,
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b]"
          )}
        >
          {inner}
        </Link>
      ) : (
        <div className={shellClass}>{inner}</div>
      )}
    </div>
  );
}

export function HomeProgramPreviewCard({
  program,
  href,
  priceFormatted,
  fromLabel,
  tierLabel,
  reducedMotion,
  ctaLabel,
  onNavigate
}: {
  program: { slug: string; title: string; category: string; duration: string };
  href: string;
  priceFormatted: string;
  fromLabel: string;
  tierLabel?: string;
  reducedMotion?: boolean;
  /** Short CTA, e.g. "Open" / "İncele" */
  ctaLabel: string;
  onNavigate?: () => void;
}) {
  const visual = getProgramVisual(program);
  const tier = tierLabel ?? getProgramTier(program);
  const priceLine = `${fromLabel} ${priceFormatted}`;

  return (
    <div className={cn("h-full min-h-[320px] sm:min-h-[340px]", visual.glow)}>
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          shellClass,
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b]"
        )}
      >
        <PremiumProgramCardInner
          visual={visual}
          categoryLabel={program.category}
          tier={tier}
          title={program.title}
          duration={program.duration}
          description={undefined}
          difficulty={undefined}
          priceLine={priceLine}
          ctaLabel={ctaLabel}
          showDescription={false}
          footerCta="link"
        />
      </Link>
    </div>
  );
}
