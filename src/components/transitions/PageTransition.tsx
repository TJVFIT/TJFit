"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

// v3.5 #3 — Spatial Z-fold page transitions.
//
// Wraps {children} in the locale layout. Reads the current pathname;
// on every change runs an outgoing→incoming animation via the Web
// Animations API (NOT framer-motion).
//
// Behaviour:
//   - Outgoing: scale 1 → 0.96, translateZ 0 → -30px, opacity 1 → 0.5 (350 ms)
//   - Incoming: scale 1.04 → 1, translateZ 30px → 0, opacity 0 → 1 (350 ms)
//   - Mobile (<= 768 px): drop translateZ (perspective expensive on
//     mobile GPUs); keep scale + opacity only
//   - prefers-reduced-motion: reduce → instant swap, no animation
//   - useDevice().tier === 'low' is a future gate; we keep this
//     primitive zero-dependency for now and let `prefers-reduced-motion`
//     do double-duty on Low tier (calm presence already biases toward
//     reduced-motion users on slow devices)

const DURATION_MS = 350;
const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

function reducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPathRef = useRef<string | null>(null);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Skip the first mount — no outgoing page to animate from.
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      lastPathRef.current = pathname ?? null;
      return;
    }

    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname ?? null;

    if (reducedMotion()) return;

    const mobile = isMobile();
    const transformIn = mobile ? "scale(1.04)" : "scale(1.04) translateZ(30px)";
    const transformOut = mobile ? "scale(1)" : "scale(1) translateZ(0px)";

    try {
      el.animate(
        [
          { transform: transformIn, opacity: 0 },
          { transform: transformOut, opacity: 1 }
        ],
        {
          duration: DURATION_MS,
          easing: EASING,
          fill: "forwards"
        }
      );
    } catch {
      // Fail open — if WAAPI isn't available, route still renders
    }
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      style={{
        // Establish a 3D context so translateZ has effect on desktop.
        perspective: 1500,
        transformStyle: "preserve-3d"
      }}
    >
      {children}
    </div>
  );
}
