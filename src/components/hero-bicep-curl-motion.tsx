"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

const HERO_BICEP = "/assets/hero/hero-bicep-curl.png";

/** Smoothstep 0→1 */
function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Asymmetric rep: slow eccentric (arms lengthen) → quicker concentric (curl) → brief hold → return.
 * Reads as a lifting rep, not a symmetric sine “wobble”.
 */
function curlRepDrive(ms: number): number {
  const T = 5600;
  const u = (((ms % T) + T) % T) / T;

  const kf: { t: number; v: number }[] = [
    { t: 0, v: 0.32 },
    { t: 0.26, v: -0.92 },
    { t: 0.5, v: -0.78 },
    { t: 0.62, v: 0.15 },
    { t: 0.78, v: 0.98 },
    { t: 0.88, v: 0.88 },
    { t: 1, v: 0.32 }
  ];

  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i]!;
    const b = kf[i + 1]!;
    if (u >= a.t && u <= b.t) {
      const span = b.t - a.t || 1;
      const local = (u - a.t) / span;
      const e = smoothstep(local);
      return a.v + (b.v - a.v) * e;
    }
  }
  return kf[kf.length - 1]!.v;
}

/**
 * Silhouette curl — rAF at display refresh. Split halves, opposite torque from same drive.
 */
export function HeroBicepCurlBackdrop({ reduce }: { reduce: boolean }) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const imgGlow: CSSProperties = {
    filter: [
      "drop-shadow(0 0 50px rgba(34,211,238,0.45))",
      "drop-shadow(0 0 22px rgba(34,211,238,0.3))",
      "drop-shadow(0 0 8px rgba(167,139,250,0.22))"
    ].join(" ")
  };

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    if (reduce) {
      left.style.transform = "translateZ(0)";
      right.style.transform = "translateZ(0)";
      return;
    }

    const CURL_DEG = 12.5;

    const tick = (now: number) => {
      const drive = curlRepDrive(now);
      const degL = drive * CURL_DEG;
      const degR = -drive * CURL_DEG;
      left.style.transform = `rotate(${degL}deg) translateZ(0)`;
      right.style.transform = `rotate(${degR}deg) translateZ(0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-y-0 -right-[8%] w-[118%] min-w-[min(140vw,920px)] max-md:-right-[20%] max-md:min-w-[160vw] max-md:opacity-[0.35]"
        style={{
          ...imgGlow,
          maskImage:
            "linear-gradient(90deg, black 0%, black 74%, rgba(0,0,0,0.55) 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, black 0%, black 74%, rgba(0,0,0,0.55) 88%, transparent 100%)"
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[3] w-[min(32%,220px)] bg-gradient-to-l from-[#09090B] via-[#09090B]/75 to-transparent"
          aria-hidden
        />
        <div
          className="relative h-full w-full min-h-[min(100svh,820px)] will-change-transform"
          style={{ transformStyle: "preserve-3d", contain: "layout paint" }}
        >
          <div className="absolute inset-0 flex">
            <div className="relative h-full w-1/2 overflow-hidden">
              <div
                ref={leftRef}
                className="absolute left-0 top-0 h-full w-[200%] will-change-transform [backface-visibility:hidden]"
                style={{ transformOrigin: "56% 42%", transform: "translateZ(0)" }}
              >
                <Image src={HERO_BICEP} alt="" fill priority sizes="70vw" className="object-cover object-left" />
              </div>
            </div>
            <div className="relative h-full w-1/2 overflow-hidden">
              <div
                ref={rightRef}
                className="absolute right-0 top-0 h-full w-[200%] will-change-transform [backface-visibility:hidden]"
                style={{ transformOrigin: "44% 42%", transform: "translateZ(0)" }}
              >
                <Image src={HERO_BICEP} alt="" fill sizes="70vw" className="object-cover object-right" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 z-[2] h-[min(36vh,260px)] w-[min(62vw,440px)] bg-gradient-to-tl from-[#09090B] from-15% via-[#09090B]/90 to-transparent" />
      <div className="absolute bottom-0 right-0 z-[2] h-24 w-40 rounded-tl-[40%] bg-[#09090B]/95 blur-2xl" />
    </div>
  );
}
