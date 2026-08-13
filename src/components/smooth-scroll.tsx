"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scrolling, mounted once at the root.
 *
 * Deliberately NOT always on:
 *   - `prefers-reduced-motion: reduce` → never initialised. The CSS guard in
 *     globals.css kills animations and transitions, but Lenis is JS-driven and
 *     would sail straight past it.
 *   - below the tablet breakpoint → native touch momentum is better than
 *     anything we can synthesise, and hijacking it on mobile costs battery and
 *     breaks pull-to-refresh.
 *
 * Both are live: switching OS motion settings, or resizing across the
 * breakpoint, starts or stops Lenis without a reload.
 *
 * The instance is published on `window.__lenis` so ScrollTrigger can drive its
 * ticker from the same rAF loop instead of running a competing one.
 */

const TABLET_MIN_PX = 768;

/** Fired on `window` when Lenis starts / stops. See ReelStage. */
export const LENIS_READY = "tj:lenis-ready";
export const LENIS_GONE = "tj:lenis-gone";

declare global {
  // eslint-disable-next-line no-var
  var __lenis: Lenis | undefined;
}

export function SmoothScroll() {
  useEffect(() => {
    // DEVICE-CONTEXT EXCEPTION: root-level singleton (Lenis smooth-
    // scroll engine, published on `window.__lenis`) — `belowTablet` is
    // a viewport-width breakpoint with no DeviceCapabilities field, and
    // `reduced` is wired into the same live-`sync()` listener pair as
    // `belowTablet`; splitting `reduced` onto DeviceContext while
    // `belowTablet` stays a raw matchMedia listener would change the
    // start/stop ordering of this singleton across the DeviceContext
    // first-render race.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const belowTablet = window.matchMedia(`(max-width: ${TABLET_MIN_PX - 1}px)`);

    let lenis: Lenis | null = null;
    let frame = 0;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        // Slightly under the default so it reads as weight, not float. A
        // fitness brand should feel like it has mass.
        lerp: 0.11,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        autoRaf: false
      });
      window.__lenis = lenis;

      const raf = (time: number) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);

      // Reel panels mount per-page and can't rely on this root-level provider
      // having run first, so announce instead of making them poll.
      window.dispatchEvent(new CustomEvent(LENIS_READY));
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lenis?.destroy();
      lenis = null;
      window.__lenis = undefined;
      window.dispatchEvent(new CustomEvent(LENIS_GONE));
    };

    const sync = () => {
      if (reduced.matches || belowTablet.matches) stop();
      else start();
    };

    sync();
    reduced.addEventListener("change", sync);
    belowTablet.addEventListener("change", sync);

    return () => {
      reduced.removeEventListener("change", sync);
      belowTablet.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
