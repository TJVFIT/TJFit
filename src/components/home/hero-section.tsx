"use client";

import type { CSSProperties, Ref } from "react";
import Link from "next/link";
import { Activity, ArrowRight, ChevronDown, Dumbbell, Gauge, Sparkles, Timer, Utensils } from "lucide-react";

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
  const ref = useMagneticButton<HTMLAnchorElement>(0.18);
  return (
    <Link href={href} className={className} onClick={onClick} ref={ref} style={style}>
      {children}
    </Link>
  );
}

function HeroMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border-t border-white/[0.08] pt-4">
      <p className="font-display text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#71717A]">{label}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">{hint}</p>
    </div>
  );
}

function HeroSignal({
  icon: Icon,
  label,
  value,
  className
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("tj-hero-signal pointer-events-auto hidden lg:block", className)}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
        <Icon className="h-3.5 w-3.5 text-[#67E8F9]" strokeWidth={1.6} />
        {label}
      </div>
      <p className="mt-2 font-display text-xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function HeroCommandPanel({ reduce }: { reduce: boolean }) {
  const rows = [
    { icon: Dumbbell, title: "Training block", value: "Upper strength", meta: "Week 04 / Day 02" },
    { icon: Utensils, title: "Macro target", value: "2,420 kcal", meta: "Protein 186g" },
    { icon: Gauge, title: "Recovery", value: "Load -8%", meta: "Auto adjusted" }
  ];

  return (
    <div className="tj-hero-command-panel relative mx-auto w-full max-w-[28rem] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[rgba(13,15,18,0.62)] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_12%,rgba(34,211,238,0.12),transparent_34%)]" aria-hidden />
      <div className="relative flex items-center justify-between border-b border-white/[0.07] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#71717A]">Today</p>
          <p className="mt-1 font-display text-xl font-semibold tracking-tight text-white">Adaptive plan</p>
        </div>
        <span className="rounded-[10px] border border-[rgba(34,211,238,0.22)] bg-[rgba(34,211,238,0.08)] px-3 py-1.5 text-[11px] font-bold text-[#67E8F9]">
          Live
        </span>
      </div>

      <div className="relative mt-4 space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.title}
            className="tj-hero-command-row flex items-center gap-3 rounded-[16px] border border-white/[0.06] bg-white/[0.035] p-3"
            style={{ animationDelay: reduce ? undefined : `${index * 120}ms` }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-[#0A0A0B]">
              <row.icon className="h-[18px] w-[18px] text-[#67E8F9]" strokeWidth={1.6} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-white">{row.title}</span>
              <span className="mt-0.5 block text-xs text-[#71717A]">{row.meta}</span>
            </span>
            <span className="text-right font-display text-sm font-semibold text-[#F6F3ED]">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="relative mt-4 grid grid-cols-[1fr_auto] items-end gap-4 rounded-[18px] border border-white/[0.06] bg-[#08080A] p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#71717A]">Consistency</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">84%</p>
        </div>
        <div className="flex h-20 items-end gap-1.5">
          {[42, 58, 52, 76, 62, 84, 78].map((h, i) => (
            <span
              key={i}
              className="w-2 rounded-full bg-[#22D3EE]"
              style={{ height: `${h}%`, opacity: 0.28 + i * 0.08 }}
            />
          ))}
        </div>
      </div>
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
  const headlineLine = [heroHeadline, heroHeadlineLine2, heroGradientTagline].filter(Boolean).join(" ");

  return (
    <section
      ref={sectionRef}
      className="tj-hero-premium-stage relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-5 pb-16 pt-20 lg:px-12"
      style={{ minHeight: "max(760px, 100dvh)", background: TJ_PALETTE.obsidian }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 78% 38%, rgba(34,211,238,0.11), transparent 58%), radial-gradient(ellipse 70% 60% at 8% 88%, rgba(246,243,237,0.045), transparent 55%), ${TJ_PALETTE.obsidian}`
        }}
        aria-hidden
      />
      <div className="tj-hero-depth-grid pointer-events-none absolute inset-0 z-0" aria-hidden />
      <div className="tj-hero-aperture pointer-events-none absolute inset-0 z-[1]" aria-hidden />

      <span className="ghost-text start-[-5%] top-[8%] max-md:start-0 max-md:top-[10%]" aria-hidden style={{ color: "rgba(246,243,237,0.035)" }}>
        TRAINING
      </span>
      <span className="ghost-text end-[-4%] bottom-[8%] max-md:end-0" aria-hidden style={{ color: "rgba(34,211,238,0.045)" }}>
        SYSTEM
      </span>

      <div
        data-tj-silhouette
        className="pointer-events-none absolute inset-y-0 end-0 z-[1] w-full lg:w-[61%]"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.44) 18%, #000 36%, #000 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.44) 18%, #000 36%, #000 82%, transparent 100%)",
          opacity: reduce ? 0.34 : 0.72
        }}
        aria-hidden
      >
        <div className="tj-hero-kinetic-frame pointer-events-none absolute inset-[8%] hidden lg:block" aria-hidden />
        <TJHeroStage variant="curl-athlete" pointerReactive={!reduce} speed={reduce ? 0 : 0.52} intensity={0.82} />
        <HeroSignal icon={Activity} label="model" value="Adaptive split" className="absolute right-[7%] top-[19%]" />
        <HeroSignal icon={Timer} label="cycle" value="12 weeks" className="absolute bottom-[24%] right-[10%]" />
        <HeroSignal icon={Gauge} label="output" value="Plan + macros" className="absolute bottom-[13%] left-[12%]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: [
            `linear-gradient(90deg, ${TJ_PALETTE.obsidian} 0%, rgba(8,8,10,0.98) 36%, rgba(8,8,10,0.72) 58%, rgba(8,8,10,0.18) 80%, transparent 100%)`,
            "radial-gradient(ellipse 70% 86% at 14% 48%, rgba(8,8,10,0.64) 0%, transparent 58%)"
          ].join(", ")
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1.03fr)_minmax(22rem,0.72fr)] lg:gap-10">
        <div className={cn("max-w-[42rem]", direction === "rtl" ? "text-right lg:ms-auto" : "text-left")}>
          <div style={lineIn(80)}>
            <span className="inline-flex items-center gap-2 rounded-[12px] border border-[rgba(34,211,238,0.22)] bg-[rgba(34,211,238,0.055)] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#67E8F9]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22D3EE] opacity-40 motion-reduce:hidden" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22D3EE]" />
              </span>
              {liveStats.activeToday > 0 ? `${liveStats.activeToday} training now` : "Fitness operating system"}
            </span>
          </div>

          <h1
            className="hero-headline mt-8 max-w-[12ch] text-balance font-display font-black tracking-[-0.045em]"
            style={{ ...lineIn(150), fontSize: "clamp(48px, 7.3vw, 104px)", lineHeight: 0.9, color: TJ_PALETTE.textPrimary }}
          >
            {headlineLine}
          </h1>

          <div
            className="my-7 h-px"
            style={{
              background: "linear-gradient(90deg, rgba(34,211,238,0.52), rgba(246,243,237,0.22), transparent)",
              width: heroEntered ? "100%" : "0%",
              opacity: heroEntered ? 1 : 0,
              transition: reduce
                ? "none"
                : "width 0.9s cubic-bezier(0.16,1,0.3,1) 0.66s, opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.66s",
              maxWidth: "460px"
            }}
            aria-hidden
          />

          <p className="max-w-[34rem] text-lg leading-relaxed text-[#A1A1AA] sm:text-xl" style={lineIn(340)}>
            {heroSub}
          </p>

          <div className="mt-10 flex min-h-[52px] flex-wrap items-center gap-3 sm:gap-4" style={lineIn(460)}>
            <MagneticLink
              href={`/${locale}/start`}
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "immersive-hero" })}
              className="tj-premium-primary-cta inline-flex min-h-[54px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-[14px] px-7 py-3.5 text-[15px] font-extrabold transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 sm:flex-none"
              style={{
                background: "linear-gradient(180deg, #A5F3FC, #22D3EE)",
                color: TJ_PALETTE.obsidian,
                boxShadow: "0 18px 44px rgba(0,0,0,0.3), 0 0 34px rgba(34,211,238,0.18)"
              }}
            >
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </MagneticLink>
            <Link
              href={`/${locale}/programs`}
              className="inline-flex min-h-[54px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-[14px] border border-white/[0.12] bg-white/[0.035] px-7 py-3.5 text-[15px] font-semibold text-white transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-white/[0.2] hover:bg-white/[0.06] sm:flex-none"
            >
              Browse programs
            </Link>
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3" style={lineIn(600)}>
            <HeroMetric value="12" label="weeks" hint="Structured blocks with progression and checkpoints." />
            <HeroMetric value="25" label="signals" hint="TJAI intake reads goals, schedule, equipment, and constraints." />
            <HeroMetric value="5" label="languages" hint="Training and nutrition in the language you actually use." />
          </div>
        </div>

        <div className="relative hidden lg:block" style={lineIn(260)} aria-hidden>
          <HeroCommandPanel reduce={reduce} />
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-opacity duration-300",
          hideScrollCue ? "opacity-0" : "opacity-45"
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
