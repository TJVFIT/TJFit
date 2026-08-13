"use client";

import { useEffect, useRef } from "react";

import { useDevice } from "@/lib/device/DeviceContext";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { prefersReducedMotion } = useDevice();

  useEffect(() => {
    if (prefersReducedMotion) return;
    // DEVICE-CONTEXT EXCEPTION: DeviceCapabilities has no "fine pointer"
    // signal (only touch/no-hover), so the `(hover: hover) and
    // (pointer: fine)` check stays local — same reasoning as
    // useMagneticButton.ts's hover check.
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFine) return;

    const el = ref.current;
    if (!el) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    let raf: number | null = null;
    let running = false;

    const tick = () => {
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      current.x += dx * 0.18;
      current.y += dy * 0.18;
      el.style.transform = `translate(${current.x}px, ${current.y}px) translate(-50%, -50%)`;
      if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
        running = false;
        raf = null;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const move = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      start();
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion]);

  return <div ref={ref} className="tj-cursor-glow" aria-hidden />;
}
