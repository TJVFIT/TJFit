"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

const HERO_BICEP = "/assets/hero/hero-bicep-curl.png";

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Asymmetric lifting rep — slow down, drive up, squeeze, return */
function curlRepDrive(ms: number): number {
  const T = 5200;
  const u = (((ms % T) + T) % T) / T;

  const kf: { t: number; v: number }[] = [
    { t: 0, v: 0.28 },
    { t: 0.22, v: -1 },
    { t: 0.48, v: -0.72 },
    { t: 0.58, v: 0.08 },
    { t: 0.76, v: 1 },
    { t: 0.86, v: 0.82 },
    { t: 1, v: 0.28 }
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
 * Hero silhouette — rAF curl. IMPORTANT: do not use `contain: paint` here; it clips rotated halves
 * (common reason motion looks “dead” or like a static bounce).
 */
export function HeroBicepCurlBackdrop({ reduce }: { reduce: boolean }) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
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
    const pulse = pulseRef.current;
    if (!left || !right || !pulse) return;

    if (reduce) {
      left.style.transform = "translateZ(0)";
      right.style.transform = "translateZ(0)";
      pulse.style.transform = "scale(1) translateZ(0)";
      return;
    }

    const CURL_DEG = 21;
    const SCALE = 0.065;

    const tick = (now: number) => {
      const drive = curlRepDrive(now);
      const degL = drive * CURL_DEG;
      const degR = -drive * CURL_DEG;
      const s = 1 + Math.abs(drive) * SCALE;
      left.style.transform = `rotate(${degL}deg) translateZ(0)`;
      right.style.transform = `rotate(${degR}deg) translateZ(0)`;
      pulse.style.transform = `scale(${s}) translateZ(0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* No mask on the rotating subtree — masks clip rotated artwork and kill the curl read */}
      <div
        className="absolute inset-y-0 -right-[8%] w-[118%] min-w-[min(140vw,920px)] max-md:-right-[20%] max-md:min-w-[160vw] max-md:opacity-[0.35]"
        style={imgGlow}
      >
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[3] w-[min(32%,220px)] bg-gradient-to-l from-[#09090B] via-[#09090B]/78 to-transparent"
          aria-hidden
        />
        <div className="relative h-full w-full min-h-[min(100svh,820px)] will-change-transform">
          <div ref={pulseRef} className="absolute inset-0 flex will-change-transform" style={{ transformOrigin: "58% 45%" }}>
            <div className="relative h-full w-1/2 overflow-hidden">
              <div
                ref={leftRef}
                className="absolute left-0 top-0 h-full w-[200%] will-change-transform [backface-visibility:hidden]"
                style={{ transformOrigin: "56% 40%", transform: "translateZ(0)" }}
              >
                <Image src={HERO_BICEP} alt="" fill priority sizes="70vw" className="object-cover object-left" />
              </div>
            </div>
            <div className="relative h-full w-1/2 overflow-hidden">
              <div
                ref={rightRef}
                className="absolute right-0 top-0 h-full w-[200%] will-change-transform [backface-visibility:hidden]"
                style={{ transformOrigin: "44% 40%", transform: "translateZ(0)" }}
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
