"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFine || reduce) return;

    const el = ref.current;
    if (!el) return;
    target.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    current.current = { ...target.current };

    const move = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };
    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.15;
      current.current.y += (target.current.y - current.current.y) * 0.15;
      el.style.transform = `translate(${current.current.x}px, ${current.current.y}px) translate(-50%, -50%)`;
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return <div ref={ref} className="tj-cursor-glow" aria-hidden />;
}
