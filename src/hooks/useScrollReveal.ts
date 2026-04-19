"use client";

import { useEffect } from "react";

/**
 * IntersectionObserver for `.reveal-section` → adds `.revealed` at ~10% viewport entry.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal-section").forEach((el) => el.classList.add("revealed"));
      return;
    }

    const observed = new Set<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("revealed");
          io.unobserve(e.target);
          observed.delete(e.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    const scan = () => {
      document.querySelectorAll(".reveal-section:not(.revealed)").forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}
