"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Lock } from "lucide-react";

import { useCardInCenter } from "@/hooks/useCardInCenter";
import type { Program } from "@/lib/content";
import { getProgramTier, getProgramVisual } from "@/lib/program-card-visual";
import { cn } from "@/lib/utils";

const shellClass = cn(
  "tj-program-card group relative flex h-full min-h-0 flex-col overflow-hidden",
  "rounded-xl border border-white/[0.06] bg-[#0E0F12]",
  "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_18px_40px_-30px_rgba(0,0,0,0.9)]",
  "transition-[border-color,box-shadow,transform] duration-200 ease-out",
  "motion-safe:hover:-translate-y-[2px]",
  "hover:border-white/[0.12] hover:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_30px_60px_-32px_rgba(0,0,0,1)]"
);

// Pointer spotlight via CSS vars on a ref — no React rerenders.
function useCssSpotlight() {
  const elRef = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = elRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
    el.style.setProperty("--spot", "1");
  };
  const onLeave = () => {
    const el = elRef.current;
    if (!el) return;
    el.style.setProperty("--spot", "0");
  };
  return { elRef, onMove, onLeave };
}

function difficultyLabel(difficulty?: string): { dots: number; label: string } {
  const v = (difficulty ?? "").toLowerCase();
  if (v.includes("expert")) return { dots: 5, label: difficulty ?? "Expert" };
  if (v.includes("advanced")) return { dots: 4, label: difficulty ?? "Advanced" };
  if (v.includes("intermediate")) return { dots: 3, label: difficulty ?? "Intermediate" };
  if (v.includes("beginner")) return { dots: 2, label: difficulty ?? "Beginner" };
  return { dots: 3, label: difficulty ?? "All levels" };
}

function CardCta({ label, asButton }: { label: string; asButton?: boolean }) {
  const base = cn(
    "inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-tight text-white",
    "transition-colors duration-150"
  );
  return asButton ? (
    <span className={base} aria-hidden>
      {label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
    </span>
  ) : (
    <span className={base}>
      {label}
      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
    </span>
  );
}

type CardInnerProps = {
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
  asButton?: boolean;
  freeBadgeLabel?: string;
  showPaidLock?: boolean;
  premiumLockedHint?: string;
  trainingGoalBadge?: string;
  trainingLocationBadge?: string;
};

function CardInner({
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
  asButton,
  freeBadgeLabel,
  showPaidLock,
  premiumLockedHint,
  trainingGoalBadge,
  trainingLocationBadge
}: CardInnerProps) {
  const diff = difficultyLabel(difficulty);

  // Spec strip: only show what's actually present.
  const specs: Array<{ key: string; value: string }> = [];
  specs.push({ key: "Length", value: duration });
  if (trainingLocationBadge) specs.push({ key: "Setup", value: trainingLocationBadge });
  if (trainingGoalBadge) specs.push({ key: "Goal", value: trainingGoalBadge });
  specs.push({ key: "Level", value: diff.label });

  return (
    <>
      {/* Visual band */}
      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", visual.gradient)} aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,255,255,0.10),transparent_70%)]" aria-hidden />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(14,15,18,0.92)_100%)]" aria-hidden />

        {/* Top row: category + status */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85">
            <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
            {categoryLabel}
          </span>
          <div className="flex items-center gap-1.5">
            {freeBadgeLabel ? (
              <span className="rounded-sm border border-white/15 bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
                {freeBadgeLabel}
              </span>
            ) : null}
            {showPaidLock ? (
              <span
                className="inline-flex items-center justify-center rounded-sm border border-white/15 bg-black/40 p-1 text-white/85 backdrop-blur-sm"
                title={premiumLockedHint}
                aria-label={premiumLockedHint ?? "Locked"}
              >
                <Lock className="h-3 w-3" aria-hidden />
              </span>
            ) : null}
            <span className="rounded-sm border border-white/15 bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
              {tier}
            </span>
          </div>
        </div>

        {/* Title block on bottom of visual */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <h3 className="font-display text-[19px] font-semibold leading-[1.18] tracking-tight text-white sm:text-[20px]">
            <span className="line-clamp-2 [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]">{title}</span>
          </h3>
          {metaLine ? (
            <p className="mt-1 text-[11px] font-medium tabular-nums tracking-tight text-white/65">
              {metaLine}
            </p>
          ) : null}
        </div>
      </div>

      {/* Body: optional description + spec rows + footer */}
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3.5">
        {showDescription && description ? (
          <p className="line-clamp-2 text-[13px] leading-[1.55] text-white/65">{description}</p>
        ) : null}

        <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] sm:grid-cols-2">
          {specs.map((spec) => (
            <div key={spec.key} className="flex min-w-0 items-baseline justify-between gap-2 border-t border-white/[0.05] pt-2">
              <dt className="shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] text-white/40">{spec.key}</dt>
              <dd className="truncate text-right font-medium tabular-nums text-white/85">{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold tabular-nums text-white">{priceLine}</span>
          </div>
          <CardCta label={ctaLabel} asButton={asButton} />
        </div>
      </div>

      {/* Pointer spotlight overlay (CSS-driven, no rerender) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[var(--spot,0)] transition-opacity duration-300"
        style={{
          background: "radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(34,211,238,0.07), transparent 70%)"
        }}
        aria-hidden
      />
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
  categoryLabelOverride?: string;
  metaLine?: string;
  freeBadgeLabel?: string;
  showPaidLock?: boolean;
  premiumLockedHint?: string;
  trainingGoalBadge?: string;
  trainingLocationBadge?: string;
  /** Deprecated — flip-on-hover removed in the premium redesign. */
  flipOnHover?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useCardInCenter(cardRef);
  const visual = getProgramVisual(program);
  const tier = tierLabel ?? getProgramTier(program);
  const priceLine = priceLabel ?? String(program.price);
  const { elRef, onMove, onLeave } = useCssSpotlight();

  const inner = (
    <CardInner
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
      asButton={!href}
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
      className="h-full"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {href ? (
        <Link
          href={href}
          ref={elRef as unknown as React.Ref<HTMLAnchorElement>}
          className={cn(shellClass, "focus:outline-none focus-visible:border-accent/45")}
        >
          {inner}
        </Link>
      ) : (
        <div ref={elRef} className={shellClass}>
          {inner}
        </div>
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
  metaLine,
  ctaLabel,
  onNavigate,
  trainingGoalBadge,
  trainingLocationBadge,
  freeBadgeLabel
}: {
  program: { slug: string; title: string; category: string; duration: string; description?: string; difficulty?: string };
  href: string;
  priceFormatted: string;
  fromLabel: string;
  tierLabel?: string;
  metaLine?: string;
  reducedMotion?: boolean;
  ctaLabel: string;
  onNavigate?: () => void;
  trainingGoalBadge?: string;
  trainingLocationBadge?: string;
  freeBadgeLabel?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  useCardInCenter(cardRef);
  const visual = getProgramVisual(program);
  const tier = tierLabel ?? getProgramTier(program);
  const priceLine = fromLabel ? `${fromLabel} ${priceFormatted}` : priceFormatted;
  const { elRef, onMove, onLeave } = useCssSpotlight();

  return (
    <div ref={cardRef} className="h-full" onMouseMove={onMove} onMouseLeave={onLeave}>
      <Link
        href={href}
        onClick={onNavigate}
        ref={elRef as unknown as React.Ref<HTMLAnchorElement>}
        className={cn(shellClass, "focus:outline-none focus-visible:border-accent/45")}
      >
        <CardInner
          visual={visual}
          categoryLabel={program.category}
          tier={tier}
          title={program.title}
          duration={program.duration}
          metaLine={metaLine}
          description={program.description}
          difficulty={program.difficulty}
          priceLine={priceLine}
          ctaLabel={ctaLabel}
          showDescription={Boolean(program.description)}
          freeBadgeLabel={freeBadgeLabel}
          trainingGoalBadge={trainingGoalBadge}
          trainingLocationBadge={trainingLocationBadge}
        />
      </Link>
    </div>
  );
}
