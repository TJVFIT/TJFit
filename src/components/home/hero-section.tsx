"use client";

import type { CSSProperties, Ref } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { trackMarketingEvent } from "@/lib/analytics-events";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function HeroMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div>
      <p className="font-display text-[28px] font-semibold leading-none tracking-tight text-white">{value}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{label}</p>
      <p className="mt-2 max-w-[18ch] text-[12px] leading-[1.5] text-white/55">{hint}</p>
    </div>
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
  reduce: _reduce,
  liveStats,
  heroEntered: _heroEntered,
  hideScrollCue,
  lineIn,
  heroHeadline,
  heroHeadlineLine2,
  heroGradientTagline,
  heroSub,
  ctaPrimary,
  sectionRef
}: HeroSectionProps) {
  // Compose to 2-3 strong lines: line 1 = heroHeadline; line 2 = heroHeadlineLine2 OR heroGradientTagline.
  const line1 = heroHeadline;
  const line2 = heroHeadlineLine2 || heroGradientTagline;

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden bg-[#08080A] px-5 pb-20 pt-24 sm:px-7 lg:px-12"
    >
      {/* Subtle vertical brand gradient on the right — no orbs */}
      <div
        className="pointer-events-none absolute inset-y-0 end-0 z-0 w-1/2"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 75% 50%, rgba(34,211,238,0.07), transparent 65%)"
        }}
        aria-hidden
      />

      {/* Static athlete image, blended */}
      <div
        className="pointer-events-none absolute inset-y-0 end-0 z-[1] hidden w-[58%] lg:block xl:w-[55%]"
        aria-hidden
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 12%, #000 32%, #000 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.4) 12%, #000 32%, #000 88%, transparent 100%)"
        }}
      >
        <div className="relative h-full w-full">
          <Image
            src="/assets/hero/hero-bicep-curl-clean.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 55vw, 58vw"
            className="select-none object-contain object-right"
            draggable={false}
            style={{ opacity: 0.78 }}
          />
        </div>
      </div>

      {/* Left fade for legibility */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(90deg, #08080A 0%, rgba(8,8,10,0.96) 32%, rgba(8,8,10,0.6) 56%, transparent 80%)"
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.42fr)]">
        <div className={cn("max-w-[44rem]", direction === "rtl" ? "text-right lg:ms-auto" : "text-left")}>
          <div style={lineIn(80)}>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-40 motion-reduce:hidden" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              {liveStats.activeToday > 0 ? `${liveStats.activeToday} training now` : "Fitness operating system"}
            </span>
          </div>

          <h1
            className="mt-7 font-display font-semibold tracking-[-0.02em] text-white"
            style={{
              ...lineIn(150),
              fontSize: "clamp(44px, 5.6vw, 76px)",
              lineHeight: 1.04
            }}
          >
            <span className="block">{line1}</span>
            {line2 ? <span className="mt-1 block text-white/65">{line2}</span> : null}
          </h1>

          <p className="mt-7 max-w-[34rem] text-[16px] leading-[1.6] text-white/65 sm:text-[17px]" style={lineIn(340)}>
            {heroSub}
          </p>

          <div className="mt-9 flex min-h-[52px] flex-wrap items-center gap-3" style={lineIn(460)}>
            <Link
              href={`/${locale}/start`}
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "immersive-hero" })}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-[14px] font-semibold tracking-tight text-[#08080A] transition-[filter,transform] duration-200 hover:-translate-y-[1px] hover:brightness-105"
            >
              {ctaPrimary}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={`/${locale}/programs`}
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-md border border-white/[0.12] px-6 py-3 text-[14px] font-medium text-white transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.04]"
            >
              Browse programs
            </Link>
          </div>

          <div
            className="mt-14 grid max-w-2xl grid-cols-1 gap-y-6 gap-x-10 border-t border-white/[0.06] pt-7 sm:grid-cols-3"
            style={lineIn(600)}
          >
            <HeroMetric value="12" label="weeks" hint="Progressive blocks with checkpoints." />
            <HeroMetric value="25" label="signals" hint="TJAI reads goals, schedule, equipment." />
            <HeroMetric value="10" label="languages" hint="Plans in your language, not translated." />
          </div>
        </div>

        {/* Right column intentionally empty on lg+ — the image lives in its own absolute layer behind. */}
        <div aria-hidden />
      </div>

      {/* Scroll cue hint of next section */}
      <div
        className={cn(
          "absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-opacity duration-300",
          hideScrollCue ? "opacity-0" : "opacity-50"
        )}
        aria-hidden
      >
        <span className="text-[10px] uppercase tracking-[0.32em] text-white/40">Scroll</span>
        <ChevronDown className="h-5 w-5 text-white/55" strokeWidth={1.5} />
      </div>
    </section>
  );
}
