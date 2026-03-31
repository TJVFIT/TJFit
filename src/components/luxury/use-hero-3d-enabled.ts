"use client";

import { useEffect, useState } from "react";

const MQ = "(min-width: 1024px)";

/**
 * WebGL hero is opt-in: set NEXT_PUBLIC_HERO_3D=true when you want the Three.js layer (desktop, no reduced motion).
 * Default off so production stays stable across GPUs / browsers / Sentry / drivers.
 */
export function useHero3DEnabled(reducedMotion: boolean | null): boolean {
  const hero3dEnabled = process.env.NEXT_PUBLIC_HERO_3D === "true";
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    if (!hero3dEnabled) return;
    if (reducedMotion) {
      setDesktop(false);
      return;
    }
    const mq = window.matchMedia(MQ);
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [reducedMotion, hero3dEnabled]);

  if (!hero3dEnabled) return false;
  return desktop && !reducedMotion;
}
