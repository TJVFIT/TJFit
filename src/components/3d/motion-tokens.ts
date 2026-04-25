/**
 * Shared motion language for the TJFit v2 3D + UI system.
 * Mirrors the SCARABUSE-style slow, decisive easing.
 */

export const TJ_EASE = {
  // Cinematic ease-out — slow in, smooth settle. Primary transition curve.
  cinema: "cubic-bezier(0.16, 1, 0.3, 1)",
  // Editorial glide — for large surface transitions.
  editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
  // Quick snap — for small controls, hover states.
  snap: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Gentle breathe — for idle float loops.
  breathe: "cubic-bezier(0.22, 1, 0.36, 1)"
} as const;

export const TJ_DURATION = {
  instantMs: 120,
  snapMs: 240,
  fastMs: 420,
  mediumMs: 680,
  slowMs: 1100,
  cinematicMs: 1800,
  breatheMs: 5400
} as const;

/** CSS var emitter for globals.css if needed. */
export function tjMotionCssVars() {
  return {
    "--tj-ease-cinema": TJ_EASE.cinema,
    "--tj-ease-editorial": TJ_EASE.editorial,
    "--tj-ease-snap": TJ_EASE.snap,
    "--tj-duration-fast": `${TJ_DURATION.fastMs}ms`,
    "--tj-duration-medium": `${TJ_DURATION.mediumMs}ms`,
    "--tj-duration-slow": `${TJ_DURATION.slowMs}ms`,
    "--tj-duration-cinematic": `${TJ_DURATION.cinematicMs}ms`
  };
}
