"use client";

import type { CSSProperties, MutableRefObject, Ref } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Zap } from "lucide-react";

import type { HeroMouseRef } from "@/components/luxury/luxury-hero-3d-canvas";
import { LuxuryHero3DExperience } from "@/components/luxury/luxury-hero-3d";
import { HeroAiCore } from "@/components/home/hero-ai-core";
import { HeroNetwork } from "@/components/home/hero-network";
import { ParticleField } from "@/components/particle-field";
import { HeroVisual } from "@/components/home/hero-visual";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { trackMarketingEvent } from "@/lib/analytics-events";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function MagneticLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const ref = useMagneticButton<HTMLAnchorElement>(0.25);
  return (
    <Link href={href} className={className} onClick={onClick} ref={ref}>
      {children}
    </Link>
  );
}

export type HeroSectionProps = {
  locale: Locale;
  direction: "ltr" | "rtl";
  reduce: boolean;
  liveStats: { activeToday: number };
  heroEntered: boolean;
  hideScrollCue: boolean;
  lineIn: (delay: number) => CSSProperties;
  /** Primary headline (localized). */
  heroHeadline: string;
  /** Optional second line (white) for rhythm. */
  heroHeadlineLine2?: string;
  /** Gradient tagline under the white lines. */
  heroGradientTagline: string;
  heroSub: string;
  ctaPrimary: string;
  sectionRef: Ref<HTMLElement>;
};

export function HeroSection({
  locale,
  direction,
  reduce,
  liveStats,
  heroEntered,
  hideScrollCue,
  lineIn,
  heroHeadline,
  heroHeadlineLine2,
  heroGradientTagline,
  heroSub,
  ctaPrimary,
  sectionRef,
}: HeroSectionProps) {
  const mouseRef: MutableRefObject<{ x: number; y: number }> = useRef({ x: 0, y: 0 });
  const mouse3dRef = mouseRef as HeroMouseRef;

  useEffect(() => {
    if (reduce || typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    if (!mq.matches) return;
    const sync = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", sync, { passive: true });
    return () => window.removeEventListener("mousemove", sync);
  }, [reduce]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-[#0A0A0B] px-5 pb-16 pt-20 lg:px-10 lg:px-12"
      style={{ minHeight: "max(700px, 100svh)" }}
    >
      {/* LAYER 1 — deep wash */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 60% 40%, rgba(14,165,233,0.07) 0%, rgba(34,211,238,0.04) 30%, transparent 70%), #0A0A0B",
        }}
        aria-hidden
      />

      {/* LAYER 2 — ghost typographic field */}
      <span className="ghost-text start-[-4%] top-[8%] max-md:start-0 max-md:top-[10%]" aria-hidden>
        INTELLIGENCE
      </span>
      <span
        className="ghost-text end-[-6%] top-[38%] max-md:end-0 max-md:top-[36%] max-md:text-[clamp(36px,18vw,80px)]"
        aria-hidden
      >
        KINETIC
      </span>
      <span className="ghost-text start-[12%] bottom-[4%] max-md:start-4 max-md:bottom-[6%]" aria-hidden>
        CORE
      </span>

      {/* LAYER 3 — ambient orbs */}
      {!reduce && (
        <>
          <div
            className="ambient-orb -end-[10%] -top-[12%] h-[min(500px,55vw)] w-[min(500px,55vw)]"
            style={
              {
                "--tj-orb-dur": "18s",
                background: "radial-gradient(circle, rgba(34,211,238,0.09) 0%, transparent 70%)",
              } as CSSProperties
            }
            aria-hidden
          />
          <div
            className="ambient-orb -bottom-[8%] -start-[6%] h-[min(400px,50vw)] w-[min(400px,50vw)]"
            style={
              {
                "--tj-orb-dur": "22s",
                background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)",
                animationDirection: "reverse",
              } as CSSProperties
            }
            aria-hidden
          />
          <div
            className="ambient-orb start-[40%] top-[42%] h-[min(300px,40vw)] w-[min(300px,40vw)]"
            style={
              {
                "--tj-orb-dur": "15s",
                animationDelay: "5s",
                background: "radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)",
              } as CSSProperties
            }
            aria-hidden
          />
        </>
      )}

      {/* LAYER 4 — SVG network */}
      <div className="pointer-events-none absolute inset-0 z-[1] max-lg:opacity-40" aria-hidden>
        <HeroNetwork reduce={reduce} />
      </div>

      {/* WebGL (desktop) */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden opacity-[0.32] lg:block" aria-hidden>
          <LuxuryHero3DExperience mouseRef={mouse3dRef} />
        </div>
      )}

      {/* Figure plate — softened so CSS core reads */}
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-90 max-lg:opacity-50 lg:opacity-[0.42]">
        <HeroVisual reduce={reduce} />
      </div>

      {/* LAYER 5 — AI core composition */}
      <HeroAiCore reduce={reduce} />

      {/* Readability veil */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background: [
            "linear-gradient(90deg, #0A0A0B 0%, rgba(10,10,11,0.98) 34%, rgba(10,10,11,0.55) 56%, rgba(10,10,11,0.14) 74%, transparent 100%)",
            "radial-gradient(ellipse 72% 88% at 14% 48%, rgba(10,10,11,0.58) 0%, transparent 54%)",
          ].join(", "),
        }}
        aria-hidden
      />

      {/* Particles — desktop only */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 z-[3] hidden opacity-[0.28] lg:block" aria-hidden>
          <ParticleField className="absolute inset-0" />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className={cn("max-w-[min(100%,34rem)] lg:max-w-[55%]", direction === "rtl" ? "text-right ms-auto" : "text-left")}>
          <div style={lineIn(80)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.08)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#22D3EE]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22D3EE] opacity-40 motion-reduce:hidden" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22D3EE]" />
              </span>
              {liveStats.activeToday > 0 ? `${liveStats.activeToday} live now` : "AI-powered fitness platform"}
            </span>
          </div>

          <h1
            className="hero-headline mt-8 font-display font-black tracking-[-0.03em] text-[#FFFFFF]"
            style={{ fontSize: "clamp(40px, 6.2vw, 80px)", lineHeight: 0.98 }}
          >
            <span className="block text-white" style={lineIn(140)}>
              {heroHeadline}
            </span>
            {heroHeadlineLine2 ? (
              <span className="mt-1 block text-white/95" style={lineIn(220)}>
                {heroHeadlineLine2}
              </span>
            ) : null}
            <span
              className="mt-2 block bg-gradient-to-r from-[#22D3EE] via-[#67E8F9] to-[#A78BFA] bg-clip-text text-transparent"
              style={{ ...lineIn(300), filter: "drop-shadow(0 0 20px rgba(34,211,238,0.2))" }}
            >
              {heroGradientTagline}
            </span>
          </h1>

          <div
            className="my-6 h-px bg-gradient-to-r from-[#22D3EE]/45 via-[#A78BFA]/3 to-transparent"
            style={{
              width: heroEntered ? "100%" : "0%",
              opacity: heroEntered ? 1 : 0,
              transition: reduce
                ? "none"
                : "width 0.88s cubic-bezier(0.22,1,0.36,1) 0.72s, opacity 0.88s cubic-bezier(0.22,1,0.36,1) 0.72s",
              maxWidth: "320px",
            }}
            aria-hidden
          />

          <p className="mt-5 max-w-[30rem] text-lg leading-relaxed text-[#A1A1AA]" style={lineIn(420)}>
            {heroSub}
          </p>

          <div className="mt-10 flex min-h-[52px] flex-wrap items-center gap-3 sm:gap-4" style={lineIn(520)}>
            <MagneticLink
              href={`/${locale}/start`}
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "immersive-hero" })}
              className="tj-cta-glow-hover inline-flex min-h-[52px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#22D3EE] px-7 py-3.5 text-[15px] font-extrabold text-[#0A0A0B] shadow-[0_12px_40px_rgba(34,211,238,0.22)] transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 sm:flex-none"
            >
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </MagneticLink>
            <Link
              href={`/${locale}/ai`}
              className="inline-flex min-h-[52px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.14)] px-7 py-3.5 text-[15px] font-semibold text-white transition-[border-color,background-color,color] duration-200 hover:border-[rgba(34,211,238,0.4)] hover:bg-[rgba(34,211,238,0.05)] hover:text-[#22D3EE] sm:flex-none"
            >
              <Zap className="h-4 w-4 shrink-0" /> Meet TJAI
            </Link>
          </div>

          <div
            className="mt-10 flex max-w-xl flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#52525B]"
            style={lineIn(640)}
          >
            <span className="inline-flex items-center gap-2">🔒 No credit card</span>
            <span className="hidden text-[#2A2D38] sm:inline" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-2">🌍 5 languages</span>
            <span className="hidden text-[#2A2D38] sm:inline" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-2">⭐ Expert coaches</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-opacity duration-300",
          hideScrollCue ? "opacity-0" : "opacity-45"
        )}
        aria-hidden
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Scroll</span>
        <ChevronDown className="tj-scroll-cue h-5 w-5 text-zinc-600 motion-reduce:animate-none" strokeWidth={1.5} />
      </div>
    </section>
  );
}
