"use client";

import { useEffect } from "react";

import { useDevice } from "@/lib/device/DeviceContext";

export function SpotlightCursor() {
  const { prefersReducedMotion } = useDevice();

  useEffect(() => {
    if (prefersReducedMotion) return;
    // DEVICE-CONTEXT EXCEPTION: DeviceCapabilities has no standalone
    // "has a hover pointer" signal — only `isMobile`, which ANDs touch
    // with `(hover: none)` — so this stays a local, direct check (same
    // reasoning as useMagneticButton.ts).
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const onMove = (event: MouseEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        document.documentElement.style.setProperty("--mouse-x", `${x}px`);
        document.documentElement.style.setProperty("--mouse-y", `${y}px`);
        raf = 0;
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion]);

  return <div className="spotlight pointer-events-none fixed inset-0 z-[1]" aria-hidden />;
}

