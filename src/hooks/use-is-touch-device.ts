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
//
// WP-DESIGN-06: deliberately NOT unified onto DeviceContext. The
// provider only resolves real capabilities inside its own `useEffect`
// (after sessionStorage-cache-or-detect), so on first mount every
// consumer sees `DEFAULT_CAPABILITIES` (isMobile: false) for at least
// one render — exactly the flash this hook's sync initializer exists to
// avoid for `PointerCamera` in cinematic-3d-impl.tsx. Consuming context
// here would reintroduce that flash, which is a behavior change.
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
