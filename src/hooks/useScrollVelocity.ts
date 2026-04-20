"use client";

import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    if (reducedMotion || noHover) return;

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
  }, []);

  return { blur, scale };
}

