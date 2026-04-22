"use client";

/**
 * Premium champagne athlete silhouette — the living hero background.
 *
 * Design intent: classical V-taper bodybuilder at peak double-bicep contraction,
 * rendered as a single premium vector with champagne gradient, rim-light highlight,
 * and a slow breath-curl animation. No cyan, no rectangles — matches obsidian +
 * champagne brand tier.
 *
 * Animation: forearms hinge at elbows on a 3.6s symmetric curl loop,
 * synced so both biceps drive through the concentric together.
 */

type Props = {
  className?: string;
  /** 0–1 */
  intensity?: number;
  reduceMotion?: boolean;
};

// Brand cyan palette — matches TJFit's cyan/blue/black system.
const CHAMPAGNE = "#22D3EE";
const CHAMPAGNE_HI = "#A5F3FC";
const CHAMPAGNE_LO = "#0E7490";
const ROSE_GOLD = "#67E8F9";

export function AthleteSilhouetteBg({ className, intensity = 0.55, reduceMotion = false }: Props) {
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
        viewBox="0 0 400 640"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{
          maxWidth: 560,
          maxHeight: "94%",
          filter: `drop-shadow(0 0 32px rgba(34,211,238,0.45)) drop-shadow(0 0 80px rgba(34,211,238,0.18))`
        }}
      >
        <defs>
          {/* Champagne body gradient — classical chiaroscuro: lit top, deeper bottom */}
          <linearGradient id="tj-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={CHAMPAGNE_HI} stopOpacity="1" />
            <stop offset="42%" stopColor={CHAMPAGNE} stopOpacity="0.95" />
            <stop offset="100%" stopColor={CHAMPAGNE_LO} stopOpacity="0.82" />
          </linearGradient>

          {/* Rim-light — suggests 3D form, catches side of bicep/shoulder */}
          <linearGradient id="tj-rim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff3df" stopOpacity="0.25" />
            <stop offset="30%" stopColor="#fff3df" stopOpacity="0" />
            <stop offset="70%" stopColor="#fff3df" stopOpacity="0" />
            <stop offset="100%" stopColor="#fff3df" stopOpacity="0.25" />
          </linearGradient>

          {/* Iron — dumbbell chrome */}
          <linearGradient id="tj-iron" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={CHAMPAGNE_HI} />
            <stop offset="100%" stopColor={ROSE_GOLD} />
          </linearGradient>

          {/* Aura — soft champagne pool behind figure */}
          <radialGradient id="tj-aura" cx="50%" cy="48%" r="55%">
            <stop offset="0%" stopColor={CHAMPAGNE} stopOpacity="0.22" />
            <stop offset="55%" stopColor={CHAMPAGNE} stopOpacity="0.05" />
            <stop offset="100%" stopColor={CHAMPAGNE} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Aura wash */}
        <ellipse cx="200" cy="320" rx="200" ry="290" fill="url(#tj-aura)" />

        {/*
          Body silhouette — single continuous path.
          Front view, classical V-taper, upper arms hanging at sides ending at elbows.
          Forearms are drawn separately below so they can hinge.
          Path starts at crown (200,24), runs clockwise.
        */}
        <path
          d="
            M 200 24
            C 172 24 155 46 155 80
            C 155 102 166 118 184 124
            L 184 132
            C 168 136 152 144 138 154
            C 120 168 108 186 100 208
            L 92 240
            L 86 280
            L 84 310
            L 106 310
            L 112 288
            L 118 260
            L 124 238
            L 130 220
            L 138 204
            C 146 216 154 232 158 250
            L 162 290
            L 164 320
            L 166 348
            C 166 364 168 378 172 390
            L 184 410
            L 182 440
            L 180 490
            L 178 548
            L 176 598
            L 182 618
            L 198 618
            L 198 540
            L 202 540
            L 202 618
            L 218 618
            L 224 598
            L 222 548
            L 220 490
            L 218 440
            L 216 410
            L 228 390
            C 232 378 234 364 234 348
            L 236 320
            L 238 290
            L 242 250
            C 246 232 254 216 262 204
            L 270 220
            L 276 238
            L 282 260
            L 288 288
            L 294 310
            L 316 310
            L 314 280
            L 308 240
            L 300 208
            C 292 186 280 168 262 154
            C 248 144 232 136 216 132
            L 216 124
            C 234 118 245 102 245 80
            C 245 46 228 24 200 24
            Z
          "
          fill="url(#tj-body-grad)"
          stroke={CHAMPAGNE}
          strokeWidth="0.6"
          strokeOpacity="0.6"
        />

        {/* Rim-light pass — same path, blended over to suggest 3D lighting */}
        <path
          d="
            M 200 24
            C 172 24 155 46 155 80
            C 155 102 166 118 184 124
            L 184 132
            C 168 136 152 144 138 154
            C 120 168 108 186 100 208
            L 92 240
            L 86 280
            L 84 310
            L 106 310
            L 112 288
            L 118 260
            L 124 238
            L 130 220
            L 138 204
            C 146 216 154 232 158 250
            L 162 290
            L 164 320
            L 166 348
            C 166 364 168 378 172 390
            L 184 410
            L 182 440
            L 180 490
            L 178 548
            L 176 598
            L 182 618
            L 198 618
            L 198 540
            L 202 540
            L 202 618
            L 218 618
            L 224 598
            L 222 548
            L 220 490
            L 218 440
            L 216 410
            L 228 390
            C 232 378 234 364 234 348
            L 236 320
            L 238 290
            L 242 250
            C 246 232 254 216 262 204
            L 270 220
            L 276 238
            L 282 260
            L 288 288
            L 294 310
            L 316 310
            L 314 280
            L 308 240
            L 300 208
            C 292 186 280 168 262 154
            C 248 144 232 136 216 132
            L 216 124
            C 234 118 245 102 245 80
            C 245 46 228 24 200 24
            Z
          "
          fill="url(#tj-rim)"
          style={{ mixBlendMode: "screen" }}
        />

        {/* Subtle center line — suggests abdominal ridge, adds depth */}
        <line
          x1="200"
          y1="180"
          x2="200"
          y2="380"
          stroke={CHAMPAGNE_LO}
          strokeWidth="1.2"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />

        {/* Pec suggestion — soft arc across chest */}
        <path
          d="M 160 178 Q 200 192 240 178"
          fill="none"
          stroke={CHAMPAGNE_LO}
          strokeWidth="1.2"
          strokeOpacity="0.32"
          strokeLinecap="round"
        />

        {/*
          LEFT forearm + fist + dumbbell — hinges at elbow (95, 310).
          Upper arm of the body path ends around there. Forearm at rest points
          straight down (rotate 0deg), curls up to rotate -130deg.
        */}
        <g
          style={{
            transformOrigin: "95px 310px",
            transformBox: "fill-box",
            animation: reduceMotion ? undefined : "tj-curl-sym 3.6s ease-in-out infinite"
          }}
        >
          {/* Forearm — tapered, subtle bicep bulge reads as "loaded" */}
          <path
            d="
              M 82 310
              Q 80 325 84 345
              L 86 400
              Q 88 418 94 428
              L 110 428
              Q 116 418 114 400
              L 112 345
              Q 110 325 106 310
              Z
            "
            fill="url(#tj-body-grad)"
            stroke={CHAMPAGNE}
            strokeWidth="0.6"
            strokeOpacity="0.5"
          />
          {/* Fist */}
          <ellipse cx="100" cy="438" rx="12" ry="10" fill="url(#tj-body-grad)" />
          {/* Dumbbell — bar + plates */}
          <g transform="translate(100,438)">
            <rect x="-4" y="-30" width="8" height="60" rx="2.5" fill="url(#tj-iron)" />
            <rect x="-16" y="-34" width="32" height="14" rx="3" fill="url(#tj-iron)" />
            <rect x="-16" y="20" width="32" height="14" rx="3" fill="url(#tj-iron)" />
          </g>
        </g>

        {/*
          RIGHT forearm + fist + dumbbell — mirror hinge at (305, 310).
        */}
        <g
          style={{
            transformOrigin: "305px 310px",
            transformBox: "fill-box",
            animation: reduceMotion ? undefined : "tj-curl-sym 3.6s ease-in-out infinite"
          }}
        >
          <path
            d="
              M 294 310
              Q 290 325 288 345
              L 286 400
              Q 284 418 290 428
              L 306 428
              Q 312 418 314 400
              L 316 345
              Q 320 325 318 310
              Z
            "
            fill="url(#tj-body-grad)"
            stroke={CHAMPAGNE}
            strokeWidth="0.6"
            strokeOpacity="0.5"
          />
          <ellipse cx="300" cy="438" rx="12" ry="10" fill="url(#tj-body-grad)" />
          <g transform="translate(300,438)">
            <rect x="-4" y="-30" width="8" height="60" rx="2.5" fill="url(#tj-iron)" />
            <rect x="-16" y="-34" width="32" height="14" rx="3" fill="url(#tj-iron)" />
            <rect x="-16" y="20" width="32" height="14" rx="3" fill="url(#tj-iron)" />
          </g>
        </g>
      </svg>

      <style>{`
        @keyframes tj-curl-sym {
          0%   { transform: rotate(0deg); }
          42%  { transform: rotate(-128deg); }
          58%  { transform: rotate(-128deg); }
          100% { transform: rotate(0deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-tj-silhouette] * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
