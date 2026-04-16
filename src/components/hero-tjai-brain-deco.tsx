"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const BRAIN_SRC = "/assets/hero/hero-tjai-brain.svg";

/** Holographic brain — rAF 3D tilt (avoids Next/Image + SVG edge cases). */
export function HeroTjaiBrainDeco({ reduce, active }: { reduce: boolean; active: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !active || reduce) {
      if (el) el.style.transform = "perspective(1000px) translateZ(0)";
      return;
    }

    const tick = (now: number) => {
      // Slower, smoother hologram drift (readable “3D”, not twitchy)
      const ry = Math.sin(now * 0.00055) * 11;
      const rx = Math.cos(now * 0.00042) * 5.5;
      const rz = Math.sin(now * 0.00032) * 3.5;
      el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) translateZ(0)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, reduce]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] hidden items-center justify-end lg:flex lg:pe-10 xl:pe-16"
      aria-hidden
    >
      <div
        className={cn(
          "relative h-[400px] w-[400px] xl:h-[480px] xl:w-[480px]",
          reduce && "animate-none"
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-[-18%] rounded-full blur-3xl",
            !reduce && "animate-tjai-brain-glow"
          )}
          style={{
            background:
              "radial-gradient(circle at 42% 38%, rgba(34,211,238,0.35) 0%, rgba(167,139,250,0.12) 42%, transparent 68%)"
          }}
        />
        <div
          ref={wrapRef}
          className="relative flex h-full w-full items-center justify-center mix-blend-screen opacity-[0.9]"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG + fill reliably via native img */}
          <img
            src={BRAIN_SRC}
            alt=""
            width={512}
            height={512}
            draggable={false}
            className="h-[92%] w-[92%] max-h-full max-w-full object-contain p-3 select-none"
            style={{
              filter:
                "drop-shadow(0 0 20px rgba(34,211,238,0.55)) drop-shadow(0 0 48px rgba(167,139,250,0.2))"
            }}
          />
        </div>
      </div>
    </div>
  );
}
