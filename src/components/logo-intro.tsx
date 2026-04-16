"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function LogoIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"hidden" | "reveal" | "glow" | "exit">("hidden");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = window.setTimeout(() => { setDone(true); onComplete(); }, 400);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("reveal"), 50));
    timers.push(window.setTimeout(() => setPhase("glow"), 800));
    timers.push(window.setTimeout(() => setPhase("exit"), 1800));
    timers.push(window.setTimeout(() => { setDone(true); onComplete(); }, 2300));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onComplete]);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09090B]"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: phase === "exit" ? "opacity 500ms ease-in" : "none"
      }}
    >
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: phase === "glow" || phase === "exit"
            ? "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,211,238,0.10) 0%, transparent 70%)"
            : "transparent",
          transition: "background 600ms ease"
        }}
        aria-hidden
      />

      {/* The logo */}
      <Image
        src="/assets/hero/logo-tjfit-3d.png"
        alt="TJFit"
        width={1024}
        height={836}
        priority
        style={{
          height: "clamp(120px, 20vw, 220px)",
          width: "auto",
          opacity: phase === "hidden" ? 0 : 1,
          transform: phase === "hidden" ? "scale(0.85) translateY(10px)" : "scale(1) translateY(0)",
          filter: phase === "glow" || phase === "exit"
            ? "drop-shadow(0 0 30px rgba(34,211,238,0.9)) drop-shadow(0 0 60px rgba(34,211,238,0.4))"
            : "drop-shadow(0 0 10px rgba(34,211,238,0.4))",
          transition: [
            "opacity 600ms cubic-bezier(0.16,1,0.3,1)",
            "transform 600ms cubic-bezier(0.16,1,0.3,1)",
            "filter 400ms ease"
          ].join(", ")
        }}
      />
    </div>
  );
}
