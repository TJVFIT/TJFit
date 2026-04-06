"use client";

import { RefObject, useEffect } from "react";

export function useCardInCenter(ref: RefObject<HTMLElement | null>, activeClass = "tj-card-aura-active") {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined" || !window.matchMedia) return;
    if (!window.matchMedia("(hover: none)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

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
  }, [ref, activeClass]);
}

