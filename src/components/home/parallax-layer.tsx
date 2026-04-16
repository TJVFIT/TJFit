"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ParallaxLayerProps = {
  children: ReactNode;
  reduce: boolean;
  /** Multiplier for mouse offset (px at edges) */
  strength?: number;
  className?: string;
};

/**
 * GPU-friendly pointer parallax. Disabled on touch / reduced motion.
 */
export function ParallaxLayer({ children, reduce, strength = 10, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    if (reduce) return;
    if (typeof window === "undefined" || window.matchMedia("(hover: none)").matches) return;
    const el = ref.current;
    if (!el) return;

    const tick = () => {
      const t = target.current;
      const c = cur.current;
      c.x += (t.x - c.x) * 0.07;
      c.y += (t.y - c.y) * 0.07;
      el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0)`;
      raf.current = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      target.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2 * strength,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2 * (strength * 0.55),
      };
    };
    const reset = () => {
      target.current = { x: 0, y: 0 };
    };

    raf.current = requestAnimationFrame(tick);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", reset);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", reset);
    };
  }, [reduce, strength]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: "translate3d(0,0,0)",
        willChange: reduce ? undefined : "transform",
      }}
    >
      {children}
    </div>
  );
}
