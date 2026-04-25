"use client";

import type { ReactNode } from "react";

import { GlowLayer } from "@/components/home/glow-layer";
import { cn } from "@/lib/utils";

export type PremiumBleedPreset = "programs" | "tjai" | "nexus";

const DRIFT: Record<PremiumBleedPreset, string> = {
  programs: "animate-premium-programs-drift",
  tjai: "animate-tjai-core-drift",
  nexus: "animate-nexus-bg-drift",
};

const FILTER: Record<PremiumBleedPreset, string> = {
  programs: "saturate(1.05) contrast(1.04)",
  tjai: "saturate(1.08) contrast(1.05) drop-shadow(0 0 50px rgba(34,211,238,0.28))",
  nexus: "saturate(1.06) contrast(1.05) brightness(0.92) drop-shadow(0 0 48px rgba(34,211,238,0.16))",
};

const PROCEDURAL_SURFACE: Record<PremiumBleedPreset, string> = {
  programs:
    "radial-gradient(ellipse 44% 34% at 64% 40%, rgba(34,211,238,0.13), transparent 62%), linear-gradient(122deg, transparent 0 48%, rgba(246,243,237,0.055) 48.2% 48.8%, transparent 49% 100%), repeating-linear-gradient(116deg, rgba(246,243,237,0.035) 0 1px, transparent 1px 72px)",
  tjai:
    "radial-gradient(circle at 58% 45%, rgba(34,211,238,0.16), transparent 18%), radial-gradient(circle at 58% 45%, transparent 0 24%, rgba(34,211,238,0.11) 24.5% 25%, transparent 25.5% 100%), repeating-conic-gradient(from 8deg at 58% 45%, rgba(103,232,249,0.1) 0deg 2deg, transparent 2deg 18deg)",
  nexus:
    "radial-gradient(ellipse 42% 38% at 50% 42%, rgba(34,211,238,0.14), transparent 62%), linear-gradient(90deg, transparent 0 24%, rgba(246,243,237,0.045) 24.2% 24.4%, transparent 24.6% 100%), repeating-linear-gradient(30deg, rgba(34,211,238,0.05) 0 1px, transparent 1px 58px)"
};

const SURFACE_CLASS: Record<PremiumBleedPreset, string> = {
  programs: "tj-procedural-programs",
  tjai: "tj-procedural-tjai",
  nexus: "tj-procedural-nexus"
};

type PremiumFullBleedImageProps = {
  src: string;
  preset: PremiumBleedPreset;
  active: boolean;
  reduce: boolean;
  /** Scroll-linked vertical offset (px), applied outside CSS drift */
  parallaxY?: number;
  /** Target opacity when `active` */
  peakOpacity: number;
  priority?: boolean;
  children?: ReactNode;
};

/**
 * Full-bleed campaign imagery: staged opacity, CSS drift, optional scroll parallax,
 * preset overlays — keeps section art cohesive with the hero motion language.
 */
export function PremiumFullBleedImage({
  src,
  preset,
  active,
  reduce,
  parallaxY = 0,
  peakOpacity,
  priority = false,
  children,
}: PremiumFullBleedImageProps) {
  void src;
  void priority;
  const drift = DRIFT[preset];
  const filter = FILTER[preset];

  const parallaxTransition = preset === "programs" ? "transform 0.12s linear" : undefined;

  const overlays = (() => {
    if (preset === "programs") {
      return (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/82 via-transparent to-[#0A0A0B]/82" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/52 via-transparent to-[#0A0A0B]/52" />
        </>
      );
    }
    if (preset === "tjai") {
      return (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B] via-[#0A0A0B]/88 to-[#0A0A0B]/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/45 via-transparent to-[#0A0A0B]/55" />
          <div
            className="absolute inset-0 opacity-70 mix-blend-overlay"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 70% 45%, rgba(34,211,238,0.07) 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 20% 30%, rgba(246,243,237,0.035) 0%, transparent 50%)",
            }}
          />
        </>
      );
    }
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B]/78 to-[#0A0A0B]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/95 via-transparent to-[#0A0A0B]/95" />
        <div
          className="absolute inset-0 opacity-80 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(ellipse 85% 65% at 50% 42%, rgba(34,211,238,0.09) 0%, transparent 58%), radial-gradient(ellipse 55% 50% at 15% 70%, rgba(246,243,237,0.035) 0%, transparent 50%), radial-gradient(ellipse 50% 45% at 88% 65%, rgba(34,211,238,0.05) 0%, transparent 48%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent" />
      </>
    );
  })();

  const glowCenter =
    preset === "programs" ? "50% 48%" : preset === "tjai" ? "58% 44%" : "50% 42%";

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-background" aria-hidden>
      <GlowLayer center={glowCenter} cyanOpacity={preset === "programs" ? 0.08 : 0.11} className="z-0" />
      <div
        className="absolute inset-0 z-[1]"
        style={{
          transform: `translate3d(0, ${parallaxY}px, 0)`,
          transition: parallaxTransition,
        }}
      >
        <div className={cn("absolute inset-0", !reduce && drift)} style={{ willChange: reduce ? undefined : "transform" }}>
          <div
            className={cn("absolute inset-0", SURFACE_CLASS[preset])}
            style={{
              opacity: active ? peakOpacity : 0,
              transition: `opacity 1.25s var(--tj-ease-premium, cubic-bezier(0.22,1,0.36,1))`,
              filter,
              background: PROCEDURAL_SURFACE[preset],
            }}
          />
        </div>
      </div>

      {!reduce && (preset === "tjai" || preset === "nexus") && (
        <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden mix-blend-screen opacity-[0.2]">
          <div className="tj-premium-light-sweep absolute -left-[20%] top-0 h-full w-[140%]" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[4]">{overlays}</div>
      {children}
    </div>
  );
}
