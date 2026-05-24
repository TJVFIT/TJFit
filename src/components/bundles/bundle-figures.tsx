/**
 * Hand-crafted cyan silhouette figures for the bundle pages.
 * Each glyph is a single inline SVG drawn from scratch (no stock art),
 * sized to a 64×64 viewBox so two figures sit cleanly side-by-side in the
 * hero. Every stroke is `currentColor` so we can tint with Tailwind text
 * utilities — `text-cyan-300/70` keeps them on-brand without baking color.
 */

import type { SVGProps } from "react";

type FigureProps = SVGProps<SVGSVGElement> & { title?: string };

const baseProps = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  xmlns: "http://www.w3.org/2000/svg"
};

/* Barbell across shoulders — squat / strength bundles */
export function FigureBarbell({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      {/* Bar */}
      <line x1="6" y1="20" x2="58" y2="20" />
      <rect x="4" y="16" width="3" height="8" rx="0.5" />
      <rect x="57" y="16" width="3" height="8" rx="0.5" />
      <circle cx="13" cy="20" r="5" />
      <circle cx="51" cy="20" r="5" />
      {/* Lifter */}
      <circle cx="32" cy="10" r="3" />
      <path d="M28 20 L24 30 L26 44 L22 56" />
      <path d="M36 20 L40 30 L38 44 L42 56" />
      <path d="M24 30 L40 30" />
    </svg>
  );
}

/* Dumbbell — fat-loss / definition / home */
export function FigureDumbbell({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <line x1="20" y1="32" x2="44" y2="32" />
      <rect x="8" y="22" width="6" height="20" rx="1.5" />
      <rect x="14" y="26" width="4" height="12" rx="1" />
      <rect x="50" y="22" width="6" height="20" rx="1.5" />
      <rect x="46" y="26" width="4" height="12" rx="1" />
    </svg>
  );
}

/* Running figure — conditioning / athletic */
export function FigureRunner({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <circle cx="38" cy="10" r="3" />
      <path d="M38 13 L34 24 L42 30" />
      <path d="M34 24 L24 22" />
      <path d="M42 30 L48 26" />
      <path d="M34 24 L28 38 L22 50" />
      <path d="M34 24 L40 40 L48 50" />
      {/* Motion lines */}
      <path d="M10 18 L18 18" strokeOpacity=".5" />
      <path d="M6 24 L16 24" strokeOpacity=".4" />
      <path d="M10 30 L20 30" strokeOpacity=".5" />
    </svg>
  );
}

/* Pull-up bar / hanging figure — calisthenics */
export function FigurePullUp({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <line x1="6" y1="10" x2="58" y2="10" />
      <line x1="10" y1="10" x2="10" y2="4" />
      <line x1="54" y1="10" x2="54" y2="4" />
      {/* Hands on bar */}
      <path d="M26 10 Q24 14 26 16" />
      <path d="M38 10 Q40 14 38 16" />
      <circle cx="32" cy="22" r="3" />
      <path d="M26 16 L32 25 L38 16" />
      <path d="M32 25 L32 42" />
      <path d="M32 42 L28 56" />
      <path d="M32 42 L36 56" />
    </svg>
  );
}

/* Kettlebell — recomp / powerbuilding accents */
export function FigureKettlebell({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <path d="M24 18 Q24 12 32 12 Q40 12 40 18" />
      <path d="M20 22 Q20 18 24 18 L40 18 Q44 18 44 22" />
      <path d="M20 22 Q14 30 16 44 Q18 54 32 54 Q46 54 48 44 Q50 30 44 22" />
      <line x1="26" y1="34" x2="38" y2="34" strokeOpacity=".4" />
    </svg>
  );
}

/* Plate / disc — strength accent */
export function FigurePlate({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <circle cx="32" cy="32" r="22" />
      <circle cx="32" cy="32" r="14" strokeOpacity=".6" />
      <circle cx="32" cy="32" r="3" />
      <line x1="32" y1="10" x2="32" y2="18" />
      <line x1="32" y1="46" x2="32" y2="54" />
      <line x1="10" y1="32" x2="18" y2="32" />
      <line x1="46" y1="32" x2="54" y2="32" />
    </svg>
  );
}

/* Apple — diet / fat-loss */
export function FigureApple({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <path d="M32 18 Q22 18 18 28 Q14 40 22 50 Q28 56 32 54 Q36 56 42 50 Q50 40 46 28 Q42 18 32 18 Z" />
      <path d="M32 18 L32 12" />
      <path d="M32 12 Q36 8 40 10" />
    </svg>
  );
}

/* Flame — peak / cutting / metabolic */
export function FigureFlame({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <path d="M32 8 Q24 18 26 28 Q22 24 20 28 Q14 38 20 48 Q26 56 32 56 Q38 56 44 48 Q50 38 44 28 Q42 24 38 28 Q40 18 32 8 Z" />
      <path d="M28 38 Q32 42 36 38 Q34 46 32 50 Q30 46 28 38 Z" strokeOpacity=".6" />
    </svg>
  );
}

/* Lotus / mobility — senior / mobility-led */
export function FigureLotus({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <circle cx="32" cy="18" r="3" />
      <path d="M32 21 L32 36" />
      {/* Crossed legs */}
      <path d="M32 36 Q22 40 18 50 L26 50" />
      <path d="M32 36 Q42 40 46 50 L38 50" />
      {/* Arms in lotus */}
      <path d="M28 28 Q22 32 22 38" />
      <path d="M36 28 Q42 32 42 38" />
      {/* Ground */}
      <line x1="14" y1="54" x2="50" y2="54" strokeOpacity=".35" />
    </svg>
  );
}

/* Female silhouette — women's sculpt */
export function FigureSculpt({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <circle cx="32" cy="10" r="3" />
      <path d="M32 13 L32 22" />
      <path d="M24 26 Q28 22 32 22 Q36 22 40 26" />
      <path d="M24 26 L20 36" />
      <path d="M40 26 L44 36" />
      <path d="M26 26 Q22 36 24 44 Q28 50 32 50 Q36 50 40 44 Q42 36 38 26" />
      <path d="M28 50 L26 60" />
      <path d="M36 50 L38 60" />
    </svg>
  );
}

/* Seedling — beginner / foundations */
export function FigureSeedling({ title, ...p }: FigureProps) {
  return (
    <svg {...baseProps} {...p} aria-hidden={!title}>
      {title ? <title>{title}</title> : null}
      <path d="M32 56 L32 30" />
      <path d="M32 38 Q22 36 18 28 Q26 26 32 32" />
      <path d="M32 34 Q42 32 46 24 Q38 22 32 28" />
      <path d="M22 56 L42 56" />
      <path d="M20 52 Q32 50 44 52" strokeOpacity=".4" />
    </svg>
  );
}

/* ─── Per-bundle pairing ───────────────────────────────────────────── */

import type { ComponentType } from "react";

const FIGURES_BY_SLUG: Record<string, [ComponentType<FigureProps>, ComponentType<FigureProps>]> = {
  "fat-loss": [FigureDumbbell, FigureApple],
  "lean-bulk": [FigureBarbell, FigurePlate],
  "home-starter": [FigureDumbbell, FigureLotus],
  definition: [FigureDumbbell, FigureFlame],
  recomp: [FigureKettlebell, FigureBarbell],
  powerbuilding: [FigureBarbell, FigurePlate],
  calisthenics: [FigurePullUp, FigureRunner],
  "athlete-conditioning": [FigureRunner, FigureFlame],
  "beginner-foundations": [FigureSeedling, FigureDumbbell],
  "womens-sculpt": [FigureSculpt, FigureKettlebell],
  "senior-strength": [FigureLotus, FigureDumbbell],
  "cutting-peak": [FigureFlame, FigureDumbbell]
};

export function BundleFigurePair({
  slug,
  className,
  size = 56
}: {
  slug: string;
  className?: string;
  size?: number;
}) {
  const pair = FIGURES_BY_SLUG[slug] ?? [FigureDumbbell, FigureBarbell];
  const [A, B] = pair;
  return (
    <div className={className} aria-hidden>
      <A width={size} height={size} className="text-cyan-300/70" />
      <B width={size} height={size} className="text-cyan-300/45" />
    </div>
  );
}
