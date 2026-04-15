"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, Lock } from "lucide-react";

import { useCardInCenter } from "@/hooks/useCardInCenter";
import { Logo } from "@/components/ui/Logo";
import type { Program } from "@/lib/content";
import { getProgramTier, getProgramVisual } from "@/lib/program-card-visual";
import { cn } from "@/lib/utils";

const shellClass =
  "group tj-card-premium-hover tj-card-aura relative flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#1E2028] bg-[#111215] shadow-[0_1px_3px_rgba(0,0,0,0.4),0_0_0_1px_#1E2028] motion-reduce:transition-none transition-[border-color,box-shadow,transform] duration-200";

function useCardSpotlight() {
  const [pos, setPos] = useState({ x: 50, y: 50, visible: false });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      visible: true
    });
  };
  const onLeave = () => setPos((p) => ({ ...p, visible: false }));
  return { pos, onMove, onLeave };
}

const ctaPillClass = cn(
  "inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[rgba(34,211,238,0.2)] bg-transparent px-4 py-3 text-xs font-semibold text-[#22D3EE] sm:w-auto sm:justify-start sm:py-2.5",
  "transition-[gap,box-shadow,background-color,border-color] duration-200 ease-out",
  "group-hover:gap-2 group-hover:border-[rgba(34,211,238,0.35)] group-hover:bg-[rgba(34,211,238,0.10)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]"
);

function CtaPill({ label }: { label: string }) {
  return (
    <span className={ctaPillClass}>
      {label}
      <ArrowRight
        className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
        aria-hidden
      />
    </span>
  );
}

function difficultyDots(difficulty?: string) {
  const value = (difficulty ?? "").toLowerCase();
  let filled = 3;
  if (value.includes("beginner")) filled = 2;
  if (value.includes("intermediate")) filled = 3;
  if (value.includes("advanced")) filled = 4;
  if (value.includes("expert")) filled = 5;
  return (
    <div className="flex items-center gap-1" aria-label={difficulty ?? "Difficulty"}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <span key={idx} className={cn("h-1.5 w-1.5 rounded-full", idx < filled ? "bg-[#22D3EE]" : "bg-[#1E2028]")} />
      ))}
    </div>
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
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
      </button>
    ) : (
      <CtaPill label={ctaLabel} />
    );

  return (
    <>
      <div className="relative aspect-[4/3] w-full min-h-[11.5rem] shrink-0 overflow-hidden sm:aspect-[16/10] sm:min-h-0 sm:max-h-[200px]">
        <div className="absolute inset-0 origin-center transition-transform duration-[400ms] ease-out motion-reduce:transition-none [@media(hover:hover)]:group-hover:scale-[1.04]">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-95", visual.gradient)} aria-hidden />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.12),transparent)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(9,9,11,0.9)_0%,transparent_55%)]"
            aria-hidden
          />
        </div>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4 pb-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="max-w-[min(100%,12rem)] truncate rounded border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#22D3EE] backdrop-blur-md sm:max-w-[58%] sm:text-[10px]">
                {categoryLabel}
              </span>
              {freeBadgeLabel ? (
                <span className="shrink-0 rounded border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#A78BFA] backdrop-blur-sm">
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
            <p className="mt-1.5 text-xs font-medium tabular-nums text-[#A1A1AA] [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
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
              {difficulty ? <div className="pt-0.5">{difficultyDots(difficulty)}</div> : null}
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
  trainingLocationBadge,
  flipOnHover = false
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
  flipOnHover?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useCardInCenter(cardRef);
  const visual = getProgramVisual(program);
  const tier = tierLabel ?? getProgramTier(program);
  const priceLine = priceLabel ?? String(program.price);
  const { pos, onMove, onLeave } = useCardSpotlight();

  const spotlightOverlay = (
    <div
      className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
      style={{
        opacity: pos.visible ? 1 : 0,
        background: `radial-gradient(200px circle at ${pos.x}% ${pos.y}%, rgba(34,211,238,0.07), transparent 70%)`
      }}
      aria-hidden
    />
  );

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
    <div
      ref={cardRef}
      className={cn("h-full", visual.glow)}
      style={{ "--card-accent": visual.accentColor } as React.CSSProperties}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {href ? (
        flipOnHover ? (
          <div className="tj-flip-card">
            <div className="tj-flip-inner">
              <Link
                href={href}
                className={cn(
                  shellClass,
                  "tj-flip-front focus:outline-none focus-visible:border-cyan-400/40 focus-visible:shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                )}
              >
                {spotlightOverlay}
                {inner}
              </Link>
              <div className="tj-flip-back flex flex-col rounded-[14px] border border-[#1E2028] bg-[#0A0B0F] p-5 text-center">
                <h3 className="text-lg font-semibold text-white">{program.title}</h3>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#A1A1AA]">
                  <div className="rounded-lg border border-[#1E2028] bg-[#111215] p-2">{program.duration}</div>
                  <div className="rounded-lg border border-[#1E2028] bg-[#111215] p-2">{trainingLocationBadge ?? "Home / Gym"}</div>
                  <div className="rounded-lg border border-[#1E2028] bg-[#111215] p-2">{trainingGoalBadge ?? program.category}</div>
                  <div className="flex items-center justify-center rounded-lg border border-[#1E2028] bg-[#111215] p-2">
                    {difficultyDots(program.difficulty)}
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-[#22D3EE]">{program.category}</p>
                <div className="mt-auto space-y-2 pt-5">
                  <Link href={href} className="btn-primary-shimmer inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] px-4 py-2.5 text-sm font-bold text-[#09090B]">
                    View Program →
                  </Link>
                  <button type="button" className="w-full rounded-full border border-[#1E2028] px-4 py-2 text-xs text-[#A1A1AA]">
                    Add to Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link
            href={href}
            className={cn(
              shellClass,
              "focus:outline-none focus-visible:border-cyan-400/40 focus-visible:shadow-[0_0_20px_rgba(34,211,238,0.08)]"
            )}
          >
            {inner}
          </Link>
        )
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
  const cardRef = useRef<HTMLDivElement>(null);
  useCardInCenter(cardRef);
  const visual = getProgramVisual(program);
  const tier = tierLabel ?? getProgramTier(program);
  const priceLine = `${fromLabel} ${priceFormatted}`;

  return (
    <div ref={cardRef} className={cn("h-full min-h-[320px] sm:min-h-[340px]", visual.glow)}>
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          shellClass,
          "focus:outline-none focus-visible:border-cyan-400/40 focus-visible:shadow-[0_0_20px_rgba(34,211,238,0.08)]"
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
