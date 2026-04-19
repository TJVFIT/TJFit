"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Route change: opacity + Y-slide fade (150ms out, 300ms in).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const first = useRef(true);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPhase("out");
    const t = window.setTimeout(() => setPhase("in"), 160);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: phase === "in" ? 1 : 0,
        transform: phase === "in" ? "translateY(0)" : "translateY(8px)",
        transition: phase === "in"
          ? "opacity 300ms cubic-bezier(0,0,0.2,1), transform 300ms cubic-bezier(0,0,0.2,1)"
          : "opacity 150ms ease-out, transform 150ms ease-out"
      }}
    >
      {children}
    </div>
  );
}
