"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

const HERO_BICEP = "/assets/hero/hero-bicep-curl.png";

/**
 * Silhouette “curl” via rAF — updates every display frame (~60–165 Hz).
 * True 400fps isn’t possible in browsers; this is the smoothest web-native approach.
 */
export function HeroBicepCurlBackdrop({ reduce }: { reduce: boolean }) {
  const shellRef = useRef<HTMLDivElement>(null);
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
    const shell = shellRef.current;
    if (!left || !right || !shell) return;

    if (reduce) {
      left.style.transform = "translateZ(0)";
      right.style.transform = "translateZ(0)";
      shell.style.transform = "translateZ(0)";
      return;
    }

    const CURL_DEG = 10.5;
    const TILT_X_DEG = 4.2;
    // ~3.1s per full curl cycle (readable, smooth)
    const CURL_SPEED = 0.00205;
    const TILT_SPEED = 0.00165;

    const tick = (now: number) => {
      const curl = Math.sin(now * CURL_SPEED);
      const degL = curl * CURL_DEG;
      const degR = -curl * CURL_DEG;
      const tiltX = Math.cos(now * TILT_SPEED) * TILT_X_DEG;
      left.style.transform = `rotate(${degL}deg) translateZ(0)`;
      right.style.transform = `rotate(${degR}deg) translateZ(0)`;
      shell.style.transform = `perspective(1600px) rotateX(${tiltX}deg) translateZ(0)`;
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
            "linear-gradient(90deg, black 0%, black 72%, rgba(0,0,0,0.65) 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, black 0%, black 72%, rgba(0,0,0,0.65) 88%, transparent 100%)"
        }}
      >
        {/* Kill hard seam on the far right */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[3] w-[min(28%,200px)] bg-gradient-to-l from-[#09090B] via-[#09090B]/70 to-transparent"
          aria-hidden
        />
        <div
          ref={shellRef}
          className="relative h-full w-full min-h-[min(100svh,820px)] will-change-transform"
          style={{ transformStyle: "preserve-3d", contain: "layout paint" }}
        >
          <div className="absolute inset-0 flex">
            <div className="relative h-full w-1/2 overflow-hidden">
              <div
                ref={leftRef}
                className="absolute left-0 top-0 h-full w-[200%] will-change-transform backface-hidden"
                style={{ transformOrigin: "right center", transform: "translateZ(0)" }}
              >
                <Image src={HERO_BICEP} alt="" fill priority sizes="70vw" className="object-cover object-left" />
              </div>
            </div>
            <div className="relative h-full w-1/2 overflow-hidden">
              <div
                ref={rightRef}
                className="absolute right-0 top-0 h-full w-[200%] will-change-transform backface-hidden"
                style={{ transformOrigin: "left center", transform: "translateZ(0)" }}
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
