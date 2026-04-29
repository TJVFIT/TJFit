"use client";

import { useEffect } from "react";

function applyStaggerDelays(root: HTMLElement) {
  const stepMs = Number(root.getAttribute("data-reveal-stagger")) || 60;
  root.querySelectorAll<HTMLElement>(".reveal-section, [data-tj-reveal]").forEach((el, index) => {
    el.style.setProperty("--tj-reveal-delay", `${index * stepMs}ms`);
  });
}

/**
 * IntersectionObserver reveal: `.reveal-section` / `[data-tj-reveal]` → `.revealed`.
 * - Threshold 15% viewport intersection, reveal once.
 * - Parents with `[data-reveal-stagger="N"]` set `--tj-reveal-delay` on descendents then reveal all together.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal-section, [data-tj-reveal]").forEach((el) => {
        el.classList.add("revealed");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!(e.target instanceof HTMLElement) || !e.isIntersecting) continue;
          const t = e.target;
          if (t.hasAttribute("data-reveal-stagger")) {
            applyStaggerDelays(t);
            t.querySelectorAll(".reveal-section, [data-tj-reveal]").forEach((node) => {
              node.classList.add("revealed");
            });
          } else {
            t.classList.add("revealed");
          }
          io.unobserve(t);
        }
      },
      { threshold: 0.15 }
    );

    const scan = () => {
      document.querySelectorAll("[data-reveal-stagger]").forEach((root) => {
        if (!(root instanceof HTMLElement)) return;
        io.observe(root);
      });

      document.querySelectorAll(".reveal-section, [data-tj-reveal]").forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        if (el.closest("[data-reveal-stagger]")) return;
        io.observe(el);
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
