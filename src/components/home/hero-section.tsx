"use client";

import type { CSSProperties, Ref } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";

import { TJ_PALETTE } from "@/components/3d/palette";
import { TJHeroStage } from "@/components/3d/hero-stage";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { trackMarketingEvent } from "@/lib/analytics-events";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function MagneticLink({
  href,
  className,
  children,
  onClick,
  style
}: {
  href: string;
  className: string;
  children: React.ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  const ref = useMagneticButton<HTMLAnchorElement>(0.25);
  return (
    <Link href={href} className={className} onClick={onClick} ref={ref} style={style}>
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
  heroHeadline: string;
  heroHeadlineLine2?: string;
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
  sectionRef
}: HeroSectionProps) {
  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pb-16 pt-20 lg:px-10 lg:px-12"
      style={{ minHeight: "max(720px, 100svh)", background: TJ_PALETTE.obsidian }}
    >
      {/* Deep obsidian wash with cyan brand pool */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 110% 70% at 72% 40%, rgba(34,211,238,0.14), transparent 58%), radial-gradient(ellipse 80% 60% at 10% 90%, rgba(34,211,238,0.05), transparent 55%), ${TJ_PALETTE.obsidian}`
        }}
        aria-hidden
      />

      {/* Editorial ghost typography */}
      <span className="ghost-text start-[-4%] top-[7%] max-md:start-0 max-md:top-[9%]" aria-hidden style={{ color: "rgba(246,243,237,0.04)" }}>
        DISCIPLINE
      </span>
      <span
        className="ghost-text end-[-5%] top-[36%] max-md:end-0 max-md:top-[34%] max-md:text-[clamp(36px,18vw,80px)]"
        aria-hidden
        style={{ color: "rgba(34,211,238,0.06)" }}
      >
        RITUAL
      </span>
      <span className="ghost-text start-[10%] bottom-[4%] max-md:start-4 max-md:bottom-[6%]" aria-hidden style={{ color: "rgba(246,243,237,0.04)" }}>
        LEGACY
      </span>

      {/* 3D alternating-curl athlete — the living hero visual */}
      <div
        data-tj-silhouette
        className="pointer-events-none absolute inset-y-0 z-[1] end-0 w-full lg:w-[62%]"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.55) 18%, #000 38%, #000 84%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.55) 18%, #000 38%, #000 84%, transparent 100%)",
          opacity: reduce ? 0.42 : 0.88
        }}
        aria-hidden
      >
        <TJHeroStage
          variant="curl-athlete"
          pointerReactive={!reduce}
          speed={reduce ? 0 : 0.75}
          intensity={0.95}
        />
      </div>

      {/* Readability veil on the left for copy */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: [
            `linear-gradient(90deg, ${TJ_PALETTE.obsidian} 0%, rgba(8,8,10,0.97) 32%, rgba(8,8,10,0.55) 56%, rgba(8,8,10,0.12) 76%, transparent 100%)`,
            "radial-gradient(ellipse 72% 88% at 14% 50%, rgba(8,8,10,0.6) 0%, transparent 54%)"
          ].join(", ")
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className={cn("max-w-[min(100%,34rem)] lg:max-w-[56%]", direction === "rtl" ? "text-right ms-auto" : "text-left")}>
          <div style={lineIn(80)}>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{
                color: "#22D3EE",
                borderColor: "rgba(34,211,238,0.32)",
                background: "rgba(34,211,238,0.06)"
              }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 motion-reduce:hidden"
                  style={{ background: "#22D3EE" }}
                />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#22D3EE" }} />
              </span>
              {liveStats.activeToday > 0 ? `${liveStats.activeToday} training now` : "Premium training intelligence"}
            </span>
          </div>

          <h1
            className="hero-headline mt-8 font-display tracking-[-0.03em]"
            style={{ fontSize: "clamp(40px, 6.4vw, 84px)", lineHeight: 0.96, color: TJ_PALETTE.textPrimary }}
          >
            <span className="block" style={lineIn(140)}>
              {heroHeadline}
            </span>
            {heroHeadlineLine2 ? (
              <span className="mt-1 block" style={{ ...lineIn(220), color: "rgba(246,243,237,0.94)" }}>
                {heroHeadlineLine2}
              </span>
            ) : null}
            <span
              className="mt-2 block bg-clip-text text-transparent"
              style={{
                ...lineIn(300),
                backgroundImage: `linear-gradient(90deg, #A5F3FC 0%, #22D3EE 45%, #0EA5E9 100%)`,
                filter: "drop-shadow(0 0 24px rgba(34,211,238,0.22))"
              }}
            >
              {heroGradientTagline}
            </span>
          </h1>

          <div
            className="my-6 h-px"
            style={{
              background: `linear-gradient(90deg, rgba(34,211,238,0.48), transparent)`,
              width: heroEntered ? "100%" : "0%",
              opacity: heroEntered ? 1 : 0,
              transition: reduce
                ? "none"
                : "width 0.88s cubic-bezier(0.16,1,0.3,1) 0.72s, opacity 0.88s cubic-bezier(0.16,1,0.3,1) 0.72s",
              maxWidth: "320px"
            }}
            aria-hidden
          />

          <p className="mt-5 max-w-[30rem] text-lg leading-relaxed" style={{ ...lineIn(420), color: TJ_PALETTE.textMuted }}>
            {heroSub}
          </p>

          <div className="mt-10 flex min-h-[52px] flex-wrap items-center gap-3 sm:gap-4" style={lineIn(520)}>
            <MagneticLink
              href={`/${locale}/start`}
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "immersive-hero" })}
              className="tj-cta-glow-hover inline-flex min-h-[52px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] px-7 py-3.5 text-[15px] font-extrabold transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 sm:flex-none"
              style={{
                background: `linear-gradient(180deg, #67E8F9, #22D3EE)`,
                color: TJ_PALETTE.obsidian,
                boxShadow: "0 12px 40px rgba(34,211,238,0.32)"
              }}
            >
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </MagneticLink>
            <Link
              href={`/${locale}/ai`}
              className="inline-flex min-h-[52px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-[10px] border px-7 py-3.5 text-[15px] font-semibold transition-[border-color,background-color,color] duration-200 sm:flex-none"
              style={{
                borderColor: TJ_PALETTE.hairlineStrong,
                color: TJ_PALETTE.textPrimary,
                background: "rgba(246,243,237,0.02)"
              }}
            >
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: "#22D3EE" }} /> Meet TJAI
            </Link>
          </div>

          <div
            className="mt-10 flex max-w-xl flex-wrap items-center gap-x-5 gap-y-2 text-xs"
            style={{ ...lineIn(640), color: TJ_PALETTE.textSubtle }}
          >
            <span className="inline-flex items-center gap-2">No credit card required</span>
            <span className="hidden sm:inline" aria-hidden style={{ color: TJ_PALETTE.hairline }}>·</span>
            <span className="inline-flex items-center gap-2">5 languages</span>
            <span className="hidden sm:inline" aria-hidden style={{ color: TJ_PALETTE.hairline }}>·</span>
            <span className="inline-flex items-center gap-2">Expert coaches</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-opacity duration-300",
          hideScrollCue ? "opacity-0" : "opacity-50"
        )}
        aria-hidden
      >
        <span className="text-[10px] uppercase tracking-[0.32em]" style={{ color: TJ_PALETTE.textSubtle }}>
          Scroll
        </span>
        <ChevronDown className="tj-scroll-cue h-5 w-5 motion-reduce:animate-none" strokeWidth={1.5} style={{ color: TJ_PALETTE.textMuted }} />
      </div>
    </section>
  );
}
