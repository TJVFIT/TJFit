"use client";

import { useEffect, useRef } from "react";
import Snap from "lenis/snap";

import { LENIS_GONE, LENIS_READY } from "@/components/smooth-scroll";

/**
 * Reel scrolling — full-viewport panels that settle one at a time.
 *
 * Deliberately NOT CSS `scroll-snap`. Lenis does not support native scroll-snap
 * (the two compete for the same gesture and snap silently never fires), so this
 * uses Lenis's own Snap plugin, which shares Lenis's scroll position.
 *
 * That means reel scrolling only exists where Lenis exists — desktop, motion
 * allowed. On mobile and under `prefers-reduced-motion` the panels degrade to
 * ordinary stacked full-height sections, which is the correct fallback: nothing
 * traps the scroll, and native touch momentum is left alone.
 *
 * Usage:
 *   <ReelStage>
 *     <ReelPanel>…</ReelPanel>
 *     <ReelPanel>…</ReelPanel>
 *   </ReelStage>
 */

type ReelStageProps = {
  children: React.ReactNode;
  /** `proximity` only pulls when you're already close — far less hostile than
   *  `mandatory`, which fights every deliberate mid-section stop. */
  type?: "proximity" | "mandatory";
  className?: string;
};

export function ReelStage({ children, type = "proximity", className }: ReelStageProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let snap: Snap | null = null;

    const attach = () => {
      const lenis = window.__lenis;
      const el = root.current;
      if (!lenis || !el || snap) return;

      const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-reel-panel]"));
      if (panels.length < 2) return;

      snap = new Snap(lenis, {
        type,
        // Long enough to read as a deliberate settle, short enough that it
        // never feels like the page is holding you hostage.
        duration: 0.6,
        debounce: 320
      });
      snap.addElements(panels, { align: "start" });
    };

    const detach = () => {
      snap?.destroy();
      snap = null;
    };

    attach();
    window.addEventListener(LENIS_READY, attach);
    window.addEventListener(LENIS_GONE, detach);

    return () => {
      window.removeEventListener(LENIS_READY, attach);
      window.removeEventListener(LENIS_GONE, detach);
      detach();
    };
  }, [type]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

type ReelPanelProps = {
  children: React.ReactNode;
  className?: string;
  /** Panels that legitimately overflow (long copy, tables) opt out of the
   *  fixed height and just snap to their own top. */
  grow?: boolean;
};

export function ReelPanel({ children, className, grow = false }: ReelPanelProps) {
  return (
    <section
      data-reel-panel=""
      // 100dvh, never 100vh: mobile browser chrome eats the bottom of a vh
      // panel and the last line of every section disappears behind it.
      className={[
        grow ? "min-h-[100dvh]" : "h-[100dvh]",
        "relative flex w-full flex-col justify-center",
        className ?? ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
