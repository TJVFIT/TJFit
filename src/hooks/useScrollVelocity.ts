"use client";

import { useEffect, useRef, useState } from "react";

import { useDevice } from "@/lib/device/DeviceContext";

function toBlur(velocity: number) {
  if (velocity >= 10) return 2;
  if (velocity >= 2) return 1;
  return 0;
}

function toScale(velocity: number) {
  if (velocity >= 10) return 1.006;
  if (velocity >= 5) return 1.003;
  return 1;
}

export function useScrollVelocity() {
  const [blur, setBlur] = useState(0);
  const [scale, setScale] = useState(1);
  const timeoutRef = useRef<number | null>(null);
  // `isMobile` (isTouch && hover:none) is DeviceContext's touch-primary
  // proxy for the old direct `(hover: none)` check; `prefersReducedMotion`
  // is an exact match for the old direct reduced-motion check.
  const { isMobile, prefersReducedMotion } = useDevice();

  useEffect(() => {
    if (prefersReducedMotion || isMobile) return;

    let lastY = window.scrollY;
    let lastTime = performance.now();

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dt = Math.max(1, now - lastTime);
      const velocity = Math.abs(y - lastY) / dt;
      lastY = y;
      lastTime = now;

      setBlur(toBlur(velocity));
      setScale(toScale(velocity));

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setBlur(0);
        setScale(1);
      }, 200);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [isMobile, prefersReducedMotion]);

  return { blur, scale };
}

