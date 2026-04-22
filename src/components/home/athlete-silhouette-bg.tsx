"use client";

/**
 * Breath-slow cyan athlete silhouette — the living background for the hero.
 *
 * Pure SVG + CSS. No three.js weight, no runtime cost beyond a single filter.
 * The figure is anatomically simplified: skull, neck, traps, chest, torso, hips,
 * thighs, shins, upper arms (static), forearms (animated), fists + dumbbells.
 *
 * Animation: forearms hinge at the elbow on a symmetric 3.2s bicep-curl loop,
 * synced via a shared CSS keyframe so both arms drive through the concentric at
 * the same time — that's what reads as a "real" rep cadence from across the room.
 */

type Props = {
  className?: string;
  /** 0–1; default 0.35 for desktop, 0.55 for mobile via parent override */
  intensity?: number;
  reduceMotion?: boolean;
};

const CYAN = "#22D3EE";
const CYAN_HI = "#67E8F9";

export function AthleteSilhouetteBg({ className, intensity = 0.35, reduceMotion = false }: Props) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: intensity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <svg
        viewBox="0 0 400 520"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{
          maxWidth: 520,
          maxHeight: "90%",
          filter: `drop-shadow(0 0 24px ${CYAN}) drop-shadow(0 0 60px rgba(34,211,238,0.25))`
        }}
      >
        <defs>
          <linearGradient id="silhouette-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={CYAN_HI} stopOpacity="0.95" />
            <stop offset="45%" stopColor={CYAN} stopOpacity="0.85" />
            <stop offset="100%" stopColor={CYAN} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="silhouette-iron" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <radialGradient id="silhouette-aura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CYAN} stopOpacity="0.35" />
            <stop offset="70%" stopColor={CYAN} stopOpacity="0.05" />
            <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft aura pool behind the athlete */}
        <ellipse cx="200" cy="260" rx="190" ry="240" fill="url(#silhouette-aura)" />

        {/* Torso group — static skeleton */}
        <g fill="url(#silhouette-body)" stroke={CYAN} strokeWidth="0.5">
          {/* Skull */}
          <ellipse cx="200" cy="70" rx="26" ry="30" />
          {/* Neck */}
          <path d="M188 100 L212 100 L214 118 L186 118 Z" />
          {/* Traps + shoulder yoke */}
          <path d="M150 120 Q200 108 250 120 L266 150 Q200 140 134 150 Z" />
          {/* Chest + lat spread */}
          <path d="M138 152 Q200 168 262 152 L272 230 Q200 248 128 230 Z" />
          {/* Waist */}
          <path d="M142 232 Q200 244 258 232 L254 296 Q200 308 146 296 Z" />
          {/* Hips + glutes */}
          <path d="M144 298 Q200 314 256 298 L266 350 Q200 366 134 350 Z" />
          {/* Left thigh */}
          <path d="M146 352 L172 352 L180 452 L158 452 Z" />
          {/* Right thigh */}
          <path d="M228 352 L254 352 L242 452 L220 452 Z" />
          {/* Left shin */}
          <path d="M160 454 L180 454 L178 506 L162 506 Z" />
          {/* Right shin */}
          <path d="M220 454 L240 454 L238 506 L222 506 Z" />

          {/* Upper arms — hinge reference (static) */}
          {/* Left */}
          <path d="M130 148 L112 158 L98 240 L118 248 Z" />
          {/* Right */}
          <path d="M270 148 L288 158 L302 240 L282 248 Z" />
        </g>

        {/* LEFT forearm + fist + dumbbell — hinges at elbow (108, 244) */}
        <g style={{ transformOrigin: "108px 244px", transformBox: "fill-box", animation: reduceMotion ? undefined : "tj-curl-left 3.2s ease-in-out infinite" }}>
          <g fill="url(#silhouette-body)" stroke={CYAN} strokeWidth="0.5">
            <path d="M98 240 L118 248 L132 316 L112 320 Z" />
          </g>
          {/* Fist */}
          <circle cx="122" cy="322" r="10" fill="url(#silhouette-body)" />
          {/* Dumbbell — bar + two plates */}
          <g transform="translate(122,322)">
            <rect x="-4" y="-26" width="8" height="52" rx="2" fill="url(#silhouette-iron)" />
            <rect x="-14" y="-30" width="28" height="12" rx="2" fill="url(#silhouette-iron)" />
            <rect x="-14" y="18" width="28" height="12" rx="2" fill="url(#silhouette-iron)" />
          </g>
        </g>

        {/* RIGHT forearm + fist + dumbbell — mirror hinge at (292, 244) */}
        <g style={{ transformOrigin: "292px 244px", transformBox: "fill-box", animation: reduceMotion ? undefined : "tj-curl-right 3.2s ease-in-out infinite" }}>
          <g fill="url(#silhouette-body)" stroke={CYAN} strokeWidth="0.5">
            <path d="M282 248 L302 240 L288 320 L268 316 Z" />
          </g>
          <circle cx="278" cy="322" r="10" fill="url(#silhouette-body)" />
          <g transform="translate(278,322)">
            <rect x="-4" y="-26" width="8" height="52" rx="2" fill="url(#silhouette-iron)" />
            <rect x="-14" y="-30" width="28" height="12" rx="2" fill="url(#silhouette-iron)" />
            <rect x="-14" y="18" width="28" height="12" rx="2" fill="url(#silhouette-iron)" />
          </g>
        </g>
      </svg>

      <style>{`
        @keyframes tj-curl-left {
          0%   { transform: rotate(6deg); }
          45%  { transform: rotate(-128deg); }
          55%  { transform: rotate(-128deg); }
          100% { transform: rotate(6deg); }
        }
        @keyframes tj-curl-right {
          0%   { transform: rotate(-6deg); }
          45%  { transform: rotate(128deg); }
          55%  { transform: rotate(128deg); }
          100% { transform: rotate(-6deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-tj-silhouette] * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
