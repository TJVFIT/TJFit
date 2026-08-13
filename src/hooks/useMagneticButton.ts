"use client";

import { useEffect, useRef } from "react";

import { useDevice } from "@/lib/device/DeviceContext";

export function useMagneticButton<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);
  const { prefersReducedMotion } = useDevice();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // DeviceCapabilities has no standalone "has a hover pointer" signal —
    // only `isMobile`, which ANDs touch with `(hover: none)` — so this
    // stays a local, direct `(hover: hover)` check; the context is not a
    // superset here.
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const threshold = 60 + rect.width / 2;
      if (distance < threshold) {
        const pull = (1 - distance / threshold) * strength;
        const moveX = Math.max(-8, Math.min(8, dx * pull));
        const moveY = Math.max(-8, Math.min(8, dy * pull));
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        el.style.transition = "transform 100ms ease";
      } else {
        el.style.transform = "translate(0, 0)";
        el.style.transition = "transform 400ms cubic-bezier(0.16,1,0.3,1)";
      }
    };

    const handleMouseLeave = () => {
      el.style.transform = "translate(0, 0)";
      el.style.transition = "transform 400ms cubic-bezier(0.16,1,0.3,1)";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength, prefersReducedMotion]);

  return ref;
}

