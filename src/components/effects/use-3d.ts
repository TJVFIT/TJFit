"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pointer-tracked 3D tilt — direct-DOM CSS custom property writes inside rAF.
 * Gated by `(prefers-reduced-motion: reduce)` and `(hover: none)` so touch
 * and reduced-motion users get a static element.
 *
 * Consumers spread the returned ref onto an element with CSS:
 *   transform: perspective(1100px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
 * and (optionally) consume --glare-x / --glare-y / --glare-opacity for a
 * cursor-following highlight.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(opts?: {
  maxX?: number;
  maxY?: number;
}) {
  const ref = useRef<T>(null);
  const maxX = opts?.maxX ?? 7;
  const maxY = opts?.maxY ?? 9;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        el.style.setProperty("--tilt-x", `${((0.5 - y) * maxX).toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${((x - 0.5) * maxY).toFixed(2)}deg`);
        el.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`);
        el.style.setProperty("--glare-opacity", "1");
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
      el.style.setProperty("--glare-opacity", "0");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [maxX, maxY]);

  return ref;
}

/**
 * IntersectionObserver-driven reveal. Returns `{ ref, shown }`. The element
 * stays at the "hidden" state until 18% of it has scrolled into view; then
 * `shown` flips true once and the observer disconnects. Reduced-motion users
 * are revealed immediately.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(opts?: {
  threshold?: number;
}) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  const threshold = opts?.threshold ?? 0.18;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, shown };
}

/**
 * Scroll-linked parallax. Reads window.scrollY and the element's position,
 * sets `--parallax-y` (in px) so the consumer can apply `translateY`. Gated
 * by reduced-motion; on touch we keep it active because parallax on hero
 * banners is generally fine and the scroll is smooth.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(opts?: {
  strength?: number;
}) {
  const ref = useRef<T>(null);
  const strength = opts?.strength ?? 0.25;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewportH = window.innerHeight;
        // 0 when element is centered in viewport; ±1 when half-out.
        const centerOffset = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
        el.style.setProperty("--parallax-y", `${(centerOffset * strength * 100).toFixed(1)}px`);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [strength]);

  return ref;
}
