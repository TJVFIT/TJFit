"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useDevice } from "@/lib/device/DeviceContext";
import { cn } from "@/lib/utils";

// Number rendering primitive (master upgrade prompt v3, Phase 5.3).
//
// Wrap any number that should feel alive — streak counters, live
// "people training right now" tickers, calorie totals, set/rep
// numbers in the workout player, prices.
//
// Behavior per `rhythm`:
//   - `static`     : no animation. Default.
//   - `resting`    : 1Hz pulse, scale ±2%, opacity ±5%. Streak counter,
//                    calorie totals.
//   - `active`     : faster pulse (1.4Hz), warmer tint. Used during
//                    a workout for the active set/rep numbers.
//   - `completed`  : a single one-shot scale-up + glow over 280 ms,
//                    then settles to the warmer "earned" tint forever.
//                    Used after a milestone hit.
//
// All animations use only `transform` + `opacity` per Vercel's design
// guidelines. Tabular numerals on the inner span so digits don't shift.
// Tier-low devices get the static form regardless of `rhythm`.
// `prefers-reduced-motion: reduce` always wins.

export type NumberRhythm = "static" | "resting" | "active" | "completed";

type Props = {
  /** Children — the actual number / digit / value to display. */
  children: ReactNode;
  /** Rhythm preset. Default 'static'. */
  rhythm?: NumberRhythm;
  /** Optional className for sizing / weight / colour. */
  className?: string;
  /**
   * When set true, this number has been "earned" (a milestone has
   * been reached). The number renders with a permanent warmer tint
   * and a one-time bloom on first mount.
   */
  earned?: boolean;
  /** ARIA label for screen readers. */
  ariaLabel?: string;
};

export function NumberDisplay({
  children,
  rhythm = "static",
  className,
  earned = false,
  ariaLabel
}: Props) {
  const { tier, prefersReducedMotion } = useDevice();
  const [bloomed, setBloomed] = useState(false);

  // One-time bloom on first mount when the number is freshly
  // earned. We only bloom once per element — re-renders don't
  // re-trigger.
  useEffect(() => {
    if (!earned || prefersReducedMotion || tier === "low") return;
    setBloomed(true);
    const t = window.setTimeout(() => setBloomed(false), 1200);
    return () => window.clearTimeout(t);
  }, [earned, prefersReducedMotion, tier]);

  const reduceAll = prefersReducedMotion || tier === "low";
  const effectiveRhythm: NumberRhythm = reduceAll ? "static" : rhythm;

  const animationStyle =
    effectiveRhythm === "resting"
      ? { animation: "tj-number-rest 1000ms ease-in-out infinite" }
      : effectiveRhythm === "active"
        ? { animation: "tj-number-active 720ms ease-in-out infinite" }
        : effectiveRhythm === "completed"
          ? { animation: "tj-number-complete 280ms cubic-bezier(0.16, 1, 0.3, 1) 1" }
          : undefined;

  return (
    <>
      <span
        aria-label={ariaLabel}
        className={cn(
          // Tabular numerals so digit width stays constant across
          // the pulse / count-up / count-down. tnum is enabled at
          // the font-feature level here regardless of parent.
          "inline-block tabular-nums [font-feature-settings:'tnum']",
          // Earned numbers get a warmer permanent tint (cyan →
          // cyan-warm). Subtle — visible side-by-side against an
          // un-earned number, otherwise unobtrusive.
          earned && "text-[#7DEAFA]",
          // Brief bloom shadow on first mount when freshly earned.
          bloomed && "[text-shadow:0_0_24px_rgba(34,211,238,0.55)]",
          className
        )}
        style={animationStyle}
      >
        {children}
      </span>
      {/* Keyframes scoped to this primitive so it's drop-in
          anywhere. globals.css doesn't need a separate definition. */}
      <style>{`
        @keyframes tj-number-rest {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50%      { transform: scale(1.018); opacity: 1; }
        }
        @keyframes tj-number-active {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.024); opacity: 1; }
        }
        @keyframes tj-number-complete {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}
