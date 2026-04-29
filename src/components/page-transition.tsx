"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const PREMIUM_EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const ENTER_MS = 280;
const OUT_MS = 160;

/**
 * Route change: fade + 6px Y — enter `ENTER_MS`, exit `OUT_MS`.
 * No layout collapse: opacity/transform only plus paint containment.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const first = useRef(true);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduceMotion) {
      setPhase("in");
      return;
    }
    setPhase("out");
    const t = window.setTimeout(() => setPhase("in"), OUT_MS + 12);
    return () => window.clearTimeout(t);
  }, [pathname, reduceMotion]);

  return (
    <div
      className="isolate [contain:paint]"
      style={{
        opacity: phase === "in" ? 1 : 0,
        transform:
          phase === "in"
            ? "translateY(0)"
            : reduceMotion
              ? "translateY(0)"
              : "translateY(6px)",
        transition: reduceMotion
          ? "none"
          : phase === "in"
            ? `opacity ${ENTER_MS}ms ${PREMIUM_EASE}, transform ${ENTER_MS}ms ${PREMIUM_EASE}`
            : `opacity ${OUT_MS}ms ease-out, transform ${OUT_MS}ms ease-out`,
        willChange: reduceMotion ? "auto" : "opacity, transform"
      }}
    >
      {children}
    </div>
  );
}
