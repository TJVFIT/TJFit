"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Merge two refs into one callback ref. Lets a component attach both
 * `useMagnetic` and `useRipple` to a single element.
 */
export function useMergedRef<T extends HTMLElement>(
  a: React.RefObject<T>,
  b: React.RefObject<T>
) {
  return useCallback(
    (node: T | null) => {
      // Refs returned by useRef are mutable; safe to cast.
      (a as unknown as { current: T | null }).current = node;
      (b as unknown as { current: T | null }).current = node;
    },
    [a, b]
  );
}

/**
 * Magnetic pull — the element shifts toward the cursor when it's inside the
 * element's bounding box. rAF-batched, direct-DOM transform, motion-safe gated.
 *
 * `strength` is the divisor on the cursor delta: higher = more subtle. 4 is
 * a strong pull, 8 is barely-there.
 */
export function useMagnetic<T extends HTMLElement = HTMLAnchorElement>(opts?: {
  strength?: number;
  max?: number;
}) {
  const ref = useRef<T>(null);
  const strength = opts?.strength ?? 5;
  const max = opts?.max ?? 10;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-max, Math.min(max, (e.clientX - cx) / strength));
        const dy = Math.max(-max, Math.min(max, (e.clientY - cy) / strength));
        el.style.setProperty("--mag-x", `${dx.toFixed(2)}px`);
        el.style.setProperty("--mag-y", `${dy.toFixed(2)}px`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--mag-x", "0px");
      el.style.setProperty("--mag-y", "0px");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, max]);

  return ref;
}

/**
 * Material-style ripple — injects a transient span on click that scales out
 * from the click point and fades. The host element needs `position: relative`
 * and `overflow: hidden` for the ripple to clip correctly.
 *
 * Motion-safe gated: reduced-motion users get no ripple. The handler is
 * idempotent and cleans up after itself.
 */
export function useRipple<T extends HTMLElement = HTMLAnchorElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPointerDown = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2.2;

      const ripple = document.createElement("span");
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.cssText = `
        position: absolute;
        top: ${y - size / 2}px;
        left: ${x - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168, 85, 247,0.45) 0%, rgba(168, 85, 247,0.12) 35%, transparent 70%);
        transform: scale(0);
        opacity: 1;
        pointer-events: none;
        mix-blend-mode: screen;
        transition: transform 620ms cubic-bezier(0.16, 1, 0.3, 1), opacity 620ms ease-out;
        z-index: 0;
      `;
      el.appendChild(ripple);

      // Trigger transition next frame.
      requestAnimationFrame(() => {
        ripple.style.transform = "scale(1)";
        ripple.style.opacity = "0";
      });

      window.setTimeout(() => ripple.remove(), 700);
    };

    el.addEventListener("pointerdown", onPointerDown);
    return () => el.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return ref;
}
