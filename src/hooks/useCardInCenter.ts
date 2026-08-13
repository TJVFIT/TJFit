"use client";

import { RefObject, useEffect } from "react";

import { useDevice } from "@/lib/device/DeviceContext";

export function useCardInCenter(ref: RefObject<HTMLElement | null>, activeClass = "tj-card-aura-active") {
  // `isMobile` (isTouch && hover:none) is DeviceContext's touch-primary
  // proxy for the old direct `(hover: none)` check; `prefersReducedMotion`
  // is an exact match for the old direct reduced-motion check.
  const { isMobile, prefersReducedMotion } = useDevice();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!isMobile || prefersReducedMotion) return;

    let timer: number | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.classList.add(activeClass);
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => el.classList.remove(activeClass), 1500);
      },
      { threshold: 0.7 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearTimeout(timer);
      el.classList.remove(activeClass);
    };
  }, [ref, activeClass, isMobile, prefersReducedMotion]);
}

