"use client";

import type { CSSProperties, Ref } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Zap } from "lucide-react";

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
  const ref = useMagneticButton<HTMLAnchorElement>(0.3);
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
  heroSub,
  ctaPrimary,
  sectionRef,
}: HeroSectionProps) {
  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-16 pt-20 lg:px-12"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-0">
        <HeroVisual reduce={reduce} />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: [
            "linear-gradient(90deg, #0A0A0B 0%, rgba(10,10,11,0.98) 32%, rgba(10,10,11,0.55) 54%, rgba(10,10,11,0.12) 72%, transparent 100%)",
            "radial-gradient(ellipse 70% 90% at 12% 48%, rgba(10,10,11,0.55) 0%, transparent 52%)",
            "radial-gradient(ellipse 50% 70% at 88% 50%, rgba(34,211,238,0.06) 0%, transparent 55%)",
          ].join(", "),
        }}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 z-[2] opacity-[0.38]" aria-hidden>
        <ParticleField className="absolute inset-0" />
      </div>

      <div
        className="pointer-events-none absolute bottom-0 right-0 z-[2] h-full w-[55%] max-md:hidden"
        style={{
          background:
            "radial-gradient(ellipse 88% 96% at 84% 50%, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.02) 45%, transparent 72%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className={cn("max-w-xl lg:max-w-2xl", direction === "rtl" ? "text-right ms-auto" : "text-left")}>
          <div style={lineIn(100)}>
            <span className="inline-flex items-center border border-white/[0.1] bg-white/[0.03] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#A1A1AA]">
              {liveStats.activeToday > 0 ? `${liveStats.activeToday} training now` : "AI-powered coaching"}
            </span>
          </div>

          <h1
            className="hero-headline mt-8 font-display text-[clamp(2.6rem,6.5vw,5rem)] font-semibold leading-[0.92] tracking-[-0.04em]"
            style={lineIn(200)}
          >
            <span className="block text-white">Elevate Your</span>
            <span
              className="block bg-gradient-to-r from-[#22D3EE] via-[#67E8F9] to-[#A78BFA] bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 0 24px rgba(34,211,238,0.2))" }}
            >
              Performance.
            </span>
          </h1>

          <div
            className="my-6 h-px bg-gradient-to-r from-[#22D3EE]/50 via-[#A78BFA]/35 to-transparent"
            style={{
              width: heroEntered ? "100%" : "0%",
              opacity: heroEntered ? 1 : 0,
              transition: reduce
                ? "none"
                : "width var(--tj-motion-slow, 880ms) var(--tj-ease-premium, cubic-bezier(0.22,1,0.36,1)) 800ms, opacity var(--tj-motion-slow, 880ms) var(--tj-ease-premium, cubic-bezier(0.22,1,0.36,1)) 800ms",
              maxWidth: "300px",
            }}
            aria-hidden
          />

          <p className="max-w-md text-lg leading-relaxed text-[#A1A1AA]" style={lineIn(350)}>
            {heroSub}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4" style={lineIn(450)}>
            <MagneticLink
              href={`/${locale}/start`}
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "immersive-hero" })}
              className="tj-cta-glow-hover group inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] px-9 py-4 text-base font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.35)] transition-transform duration-200 hover:scale-[1.02]"
            >
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </MagneticLink>
            <Link
              href={`/${locale}/ai`}
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full border border-[rgba(167,139,250,0.35)] bg-[rgba(167,139,250,0.06)] px-9 py-4 text-base font-semibold text-[#A78BFA] transition-colors duration-200 hover:border-[rgba(167,139,250,0.5)] hover:bg-[rgba(167,139,250,0.12)]"
            >
              <Zap className="h-4 w-4" /> Preview TJAI
            </Link>
          </div>

          <div
            className="mt-12 max-w-md border-t border-white/[0.08] pt-8 text-[11px] font-normal leading-relaxed tracking-wide text-[#71717A]"
            style={lineIn(550)}
          >
            {["GPT-4o plan engine", "25-question intake", "12-week blocks", "5 languages"].join(" · ")}
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
