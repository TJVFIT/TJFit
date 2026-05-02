"use client";

import { useEffect, useState } from "react";

// Returns true on touch-primary devices (matchMedia "(hover: none)").
//
// Uses a lazy useState initializer so the first client render already
// knows whether we're on touch — otherwise pointer-tracked tilt /
// camera effects briefly flash an enabled state before the useEffect
// resolves to the actual capability.
//
// SSR returns false (no window). All consumers using this hook live
// inside client-only components (immersive-home, program-card, R3F
// Canvas children), so the SSR/initial-client mismatch is moot.
export function useIsTouchDevice(): boolean {
  const [touch, setTouch] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: none)").matches;
  });
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const handler = () => setTouch(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return touch;
}
