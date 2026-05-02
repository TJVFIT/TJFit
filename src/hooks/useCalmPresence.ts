"use client";

import { useEffect, useState } from "react";

// Calm presence (master upgrade prompt v3, Phase 8).
//
// Tracks user activity. After `idleMs` of no input the page is
// considered "calm" and consumers (cards, flow field, heartbeat)
// can subtly reduce their own intensity. On any input — mouse,
// scroll, keypress, touch — the page wakes back over `wakeMs`.
//
// Usage:
//   const { isCalm } = useCalmPresence();
//   <div className={cn("...", isCalm && "tj-calm")}>...
//
// The CSS utility `.tj-calm` is defined in globals.css and applies
// the dim + slowdown without any per-component branching.
//
// No proactive UI ("ARE YOU STILL THERE?!") — pure quiet calm. The
// only side-effect is a single PostHog event when entering / exiting
// calm mode (see Phase 8.2 of v3 prompt + the taxonomy doc).

type Options = {
  /** Inactivity threshold before entering calm. Default 60 000 ms. */
  idleMs?: number;
  /** Whether to publish PostHog events. Default true. */
  emitAnalytics?: boolean;
};

const DEFAULT_IDLE_MS = 60_000;

const ACTIVITY_EVENTS: Array<keyof DocumentEventMap> = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "wheel"
];

export function useCalmPresence(options: Options = {}): { isCalm: boolean } {
  const { idleMs = DEFAULT_IDLE_MS, emitAnalytics = true } = options;
  const [isCalm, setIsCalm] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timer: number | null = null;
    let calm = false;

    const enterCalm = () => {
      if (calm) return;
      calm = true;
      setIsCalm(true);
      if (emitAnalytics && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tjfit:idle-calm-entered"));
      }
    };

    const exitCalm = () => {
      if (!calm) return;
      calm = false;
      setIsCalm(false);
      if (emitAnalytics && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tjfit:idle-calm-woke"));
      }
    };

    const restart = () => {
      if (calm) exitCalm();
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(enterCalm, idleMs);
    };

    // Start the idle timer. The first interaction will reset it
    // (this is fine — calm requires `idleMs` of true silence).
    restart();

    const opts: AddEventListenerOptions = { passive: true };
    for (const eventName of ACTIVITY_EVENTS) {
      window.addEventListener(eventName, restart, opts);
    }

    // Tab visibility — when the tab is hidden, exit calm immediately
    // (we'll re-enter on return if still idle). Keeps the UI in a
    // sensible state if the user comes back from another tab.
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (timer) window.clearTimeout(timer);
        exitCalm();
      } else {
        restart();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timer) window.clearTimeout(timer);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, restart);
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [idleMs, emitAnalytics]);

  return { isCalm };
}
