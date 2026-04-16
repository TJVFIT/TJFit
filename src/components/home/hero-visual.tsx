"use client";

import Image from "next/image";

import { AnimatedImageWrapper } from "@/components/home/animated-image-wrapper";
import { GlowLayer } from "@/components/home/glow-layer";
import { ParallaxLayer } from "@/components/home/parallax-layer";
import { cn } from "@/lib/utils";

const HERO_IMG = "/assets/hero/hero-bicep-curl.png";

/**
 * Hero plate: right-anchored figure, living scale/drift, cyan glow, vein pulse,
 * slow light sweep — composed as depth layers (glow → parallax → graded image).
 */
export function HeroVisual({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#0A0A0B]" />

      <GlowLayer center="78% 42%" cyanOpacity={0.14} className="z-0" />

      <ParallaxLayer reduce={reduce} strength={8} className="absolute inset-0 z-[1]">
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-[min(118vw,920px)] max-md:w-[min(165vw,920px)] max-md:opacity-[0.38]",
            !reduce && "tj-hero-living"
          )}
        >
          <div className="relative h-full min-h-[min(100svh,920px)] w-full translate-x-[4%] max-md:translate-x-[8%]">
            <AnimatedImageWrapper reduce={reduce} variant="hero" showVein={false}>
              <Image
                src={HERO_IMG}
                alt=""
                fill
                priority
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover object-right"
              />
            </AnimatedImageWrapper>
          </div>
        </div>
      </ParallaxLayer>

      {!reduce && (
        <>
          <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden mix-blend-screen opacity-[0.22]" aria-hidden>
            <div className="tj-hero-light-sweep-hero absolute -left-[30%] top-0 h-full w-[160%]" />
          </div>
          <div className="tj-hero-vein-glow pointer-events-none absolute inset-0 z-[2] mix-blend-screen" aria-hidden />
        </>
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background: [
            "radial-gradient(ellipse 65% 80% at 82% 46%, rgba(34,211,238,0.05) 0%, transparent 55%)",
            "radial-gradient(ellipse 42% 50% at 96% 70%, rgba(167,139,250,0.04) 0%, transparent 50%)",
          ].join(", "),
        }}
        aria-hidden
      />
    </div>
  );
}
