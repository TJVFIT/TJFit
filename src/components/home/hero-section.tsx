"use client";

import type { CSSProperties, Ref } from "react";
import Link from "next/link";
import { Activity, ArrowRight, ChevronDown, Dumbbell, Gauge, Timer, Utensils } from "lucide-react";

import { useMagnetic, useMergedRef, useRipple } from "@/components/effects/use-magnetic";

import { TJ_PALETTE } from "@/components/3d/palette";
import { TJHeroStage } from "@/components/3d/hero-stage";
import { GrainOverlay } from "@/components/ui/grain-overlay";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { trackMarketingEvent } from "@/lib/analytics-events";
import type { HomeLuxuryCopy } from "@/lib/home-luxury-copy";
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
    <div className="group/metric relative border-t border-white/[0.08] pt-4 transition-[border-color] duration-300 hover:border-purple-300/30">
      {/* Cyan glow that follows the top hairline only on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover/metric:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(168,85,247,0.7) 35%, rgba(237,233,254,0.9) 50%, rgba(168,85,247,0.7) 65%, transparent)",
          boxShadow: "0 0 12px rgba(168,85,247,0.45)"
        }}
      />
      <p className="font-display text-2xl font-semibold tracking-tight text-white transition-colors duration-200 group-hover/metric:text-purple-50">
        {value}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-faint transition-colors duration-200 group-hover/metric:text-purple-200/80">
        {label}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{hint}</p>
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
    <div className={cn("tj-hero-signal pointer-events-auto hidden xl:block", className)}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
        <Icon className="h-3.5 w-3.5 text-accent-muted" strokeWidth={1.6} />
        {label}
      </div>
      <p className="mt-2 font-display text-xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function HeroCommandPanel({ reduce, copy }: { reduce: boolean; copy: HomeLuxuryCopy["hero"] }) {
  const rowIcons = [Dumbbell, Utensils, Gauge] as const;
  return (
    <div className="tj-hero-command-panel relative mx-auto w-full max-w-[23.75rem] overflow-hidden rounded-[22px] border border-white/[0.08] bg-[rgba(13,15,18,0.58)] p-3.5 shadow-[0_30px_90px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_12%,rgba(168,85,247,0.12),transparent_34%)]" aria-hidden />
      <div className="relative flex items-center justify-between border-b border-white/[0.07] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-faint">{copy.commandToday}</p>
          <p className="mt-1 font-display text-xl font-semibold tracking-tight text-white">{copy.commandPlan}</p>
        </div>
        <span className="rounded-[10px] border border-accent/25 bg-accent/10 px-3 py-1.5 text-[11px] font-bold text-accent-muted">
          {copy.commandLive}
        </span>
      </div>

      <div className="relative mt-4 space-y-3">
        {copy.commandRows.map((row, index) => {
          const Icon = rowIcons[index] ?? Dumbbell;
          return (
          <div
            key={row.title}
            className="tj-hero-command-row flex items-center gap-3 rounded-[15px] border border-white/[0.06] bg-white/[0.035] p-2.5"
            style={{ animationDelay: reduce ? undefined : `${index * 120}ms` }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-background">
              <Icon className="h-[18px] w-[18px] text-accent-muted" strokeWidth={1.6} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-white">{row.title}</span>
              <span className="mt-0.5 block text-xs text-faint">{row.meta}</span>
            </span>
            <span className="text-right font-display text-sm font-semibold text-bright">{row.value}</span>
          </div>
          );
        })}
      </div>

      <div className="relative mt-4 grid grid-cols-[1fr_auto] items-end gap-4 rounded-[18px] border border-white/[0.06] bg-surface-2 p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-faint">{copy.commandConsistency}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">84%</p>
        </div>
        <div className="flex h-20 items-end gap-1.5">
          {[42, 58, 52, 76, 62, 84, 78].map((h, i) => (
            <span
              key={i}
              className="w-2 rounded-full bg-accent"
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
  heroEntered: boolean;
  hideScrollCue: boolean;
  lineIn: (delay: number) => CSSProperties;
  heroHeadline: string;
  heroHeadlineLine2?: string;
  heroGradientTagline: string;
  heroSub: string;
  ctaPrimary: string;
  copy: HomeLuxuryCopy["hero"];
  sectionRef: Ref<HTMLElement>;
};

export function HeroSection({
  locale,
  direction,
  reduce,
  heroEntered,
  hideScrollCue,
  lineIn,
  heroHeadline,
  heroHeadlineLine2,
  heroGradientTagline,
  heroSub,
  ctaPrimary,
  copy,
  sectionRef
}: HeroSectionProps) {
  const headlineLine = [heroHeadline, heroHeadlineLine2].filter(Boolean).join(" ");

  return (
    <section
      ref={sectionRef}
      className="tj-hero-premium-stage relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-5 pb-16 pt-24 sm:px-7 lg:px-12"
      style={{ minHeight: "max(760px, 100dvh)", background: TJ_PALETTE.obsidian }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 92% 72% at 78% 36%, rgba(168,85,247,0.16), transparent 60%), radial-gradient(ellipse 60% 50% at 70% 30%, rgba(124,58,237,0.10), transparent 52%), radial-gradient(ellipse 70% 60% at 8% 88%, rgba(246,243,237,0.05), transparent 55%), ${TJ_PALETTE.obsidian}`
        }}
        aria-hidden
      />
      <div className="tj-hero-depth-grid pointer-events-none absolute inset-0 z-0" aria-hidden />
      <div className="tj-hero-aperture pointer-events-none absolute inset-0 z-[1]" aria-hidden />

      <span className="ghost-text start-[-5%] top-[8%] max-md:start-0 max-md:top-[10%]" aria-hidden style={{ color: "rgba(246,243,237,0.035)" }}>
        TRAINING
      </span>
      <span className="ghost-text end-[-4%] bottom-[8%] max-md:end-0" aria-hidden style={{ color: "rgba(168,85,247,0.045)" }}>
        SYSTEM
      </span>

      <div
        data-tj-silhouette
        className="pointer-events-none absolute inset-y-0 end-0 z-[1] w-full lg:w-[56%] xl:w-[58%]"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.44) 18%, #000 36%, #000 82%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.44) 18%, #000 36%, #000 82%, transparent 100%)",
          opacity: reduce ? 0.32 : 0.66
        }}
        aria-hidden
      >
        <div className="tj-hero-kinetic-frame pointer-events-none absolute inset-[8%]" aria-hidden />
        <TJHeroStage variant="neural" pointerReactive={!reduce} speed={reduce ? 0 : 0.78} intensity={0.95} />
        <HeroSignal icon={Activity} label={copy.signals.model} value={copy.signals.modelValue} className="absolute right-[7%] top-[19%]" />
        <HeroSignal icon={Timer} label={copy.signals.cycle} value={copy.signals.cycleValue} className="absolute bottom-[24%] right-[10%]" />
        <HeroSignal icon={Gauge} label={copy.signals.output} value={copy.signals.outputValue} className="absolute bottom-[13%] left-[12%]" />
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

      <GrainOverlay className="z-[3]" vignette={false} />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 xl:grid-cols-[minmax(0,0.98fr)_minmax(20rem,0.56fr)] xl:gap-8">
        <div className={cn("max-w-[45rem]", direction === "rtl" ? "text-right lg:ms-auto" : "text-left")}>
          <div style={lineIn(80)}>
            <span className="inline-flex items-center gap-2 rounded-[12px] border border-accent/25 bg-accent/10 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-muted">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              {copy.fallbackBadge}
            </span>
          </div>

          <h1
            className="hero-headline mt-8 max-w-[14ch] text-balance font-display font-black tracking-[-0.035em]"
            style={{ ...lineIn(150), fontSize: "clamp(46px, 6.4vw, 88px)", lineHeight: 0.94, color: TJ_PALETTE.textPrimary }}
          >
            {headlineLine}
          </h1>

          {heroGradientTagline ? (
            <p
              className="tj-hero-gradient-line mt-5 max-w-[26ch] font-display font-bold tracking-[-0.005em]"
              style={{
                ...lineIn(250),
                fontSize: "clamp(16px, 1.7vw, 24px)",
                lineHeight: 1.25,
                backgroundImage:
                  "linear-gradient(102deg, #d8caff 0%, #a855f7 46%, #ede9fe 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(168,85,247,0.28))"
              }}
            >
              {heroGradientTagline}
            </p>
          ) : null}

          <div
            className="my-7 h-px"
            style={{
              background: "linear-gradient(90deg, rgba(168,85,247,0.52), rgba(246,243,237,0.22), transparent)",
              width: heroEntered ? "100%" : "0%",
              opacity: heroEntered ? 1 : 0,
              transition: reduce
                ? "none"
                : "width 0.9s cubic-bezier(0.16,1,0.3,1) 0.66s, opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.66s",
              maxWidth: "460px"
            }}
            aria-hidden
          />

          <p className="max-w-[34rem] text-lg leading-relaxed text-muted sm:text-xl" style={lineIn(340)}>
            {heroSub}
          </p>

          <div className="mt-10 flex min-h-[52px] flex-wrap items-center gap-3 sm:gap-4" style={lineIn(460)}>
            <MagneticLink
              href={`/${locale}/start`}
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "immersive-hero" })}
              className="tj-premium-primary-cta tj-cta-sheen inline-flex min-h-[54px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-[14px] px-7 py-3.5 text-[15px] font-extrabold transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 sm:flex-none"
              style={{
                background: `linear-gradient(180deg, ${TJ_PALETTE.accentHi}, ${TJ_PALETTE.accent})`,
                color: TJ_PALETTE.obsidian,
                boxShadow: "0 18px 44px rgba(0,0,0,0.3), 0 0 34px rgba(168,85,247,0.18)"
              }}
            >
              {ctaPrimary}
              <ArrowRight className="h-4 w-4 shrink-0" />
            </MagneticLink>
            <HeroBundlesLink href={`/${locale}/bundles`} label={copy.ctaBrowsePrograms} />
          </div>

          <div className="mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3" style={lineIn(600)}>
            {copy.metrics.map((metric) => (
              <HeroMetric key={metric.label} value={metric.value} label={metric.label} hint={metric.hint} />
            ))}
          </div>
        </div>

        <div className="relative hidden xl:block" style={lineIn(260)} aria-hidden>
          <HeroCommandPanel reduce={reduce} copy={copy} />
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
          {copy.scroll}
        </span>
        <ChevronDown className="tj-scroll-cue h-5 w-5 motion-reduce:animate-none" strokeWidth={1.5} style={{ color: TJ_PALETTE.textMuted }} />
      </div>
    </section>
  );
}

/**
 * Secondary hero CTA — magnetic pull + ripple, with an arrow that slides
 * right on hover. Standard anchor (no Link routing prefetch needed for the
 * sibling /bundles route which is statically generated anyway).
 */
function HeroBundlesLink({ href, label }: { href: string; label: string }) {
  const magnetic = useMagnetic<HTMLAnchorElement>({ strength: 6, max: 8 });
  const ripple = useRipple<HTMLAnchorElement>();
  const ref = useMergedRef<HTMLAnchorElement>(magnetic, ripple);
  return (
    <a
      ref={ref}
      href={href}
      className="group/hero-cta tj-cta-sheen relative inline-flex min-h-[54px] min-w-[44px] flex-1 items-center justify-center gap-2 rounded-[14px] border border-white/[0.12] bg-white/[0.035] px-7 py-3.5 text-[15px] font-semibold text-white hover:border-purple-300/35 hover:bg-purple-300/[0.05] hover:shadow-[0_0_36px_rgba(168,85,247,0.18)] sm:flex-none"
      style={
        {
          "--mag-x": "0px",
          "--mag-y": "0px",
          transform: "translate3d(var(--mag-x), var(--mag-y), 0)",
          transition:
            "transform 220ms cubic-bezier(0.2,1,0.3,1), border-color 200ms, background-color 200ms, box-shadow 220ms"
        } as React.CSSProperties
      }
    >
      <span className="relative">{label}</span>
      <ArrowRight
        className="relative h-4 w-4 shrink-0 transition-transform motion-safe:group-hover/hero-cta:translate-x-1"
        aria-hidden
      />
    </a>
  );
}
