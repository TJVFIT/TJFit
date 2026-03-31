"use client";

import { useEffect, useState } from "react";

const MQ = "(min-width: 1024px)";

/**
 * 3D hero only on large screens and when the user has not requested reduced motion.
 */
export function useHero3DEnabled(reducedMotion: boolean | null): boolean {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setDesktop(false);
      return;
    }
    const mq = window.matchMedia(MQ);
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [reducedMotion]);

  return desktop && !reducedMotion;
}
