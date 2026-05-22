"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Dumbbell, Brain, Users, Trophy, Apple, Globe,
  ArrowRight, Zap, Sparkles, Calendar, RefreshCw, Utensils
} from "lucide-react";

import { useMagnetic, useMergedRef, useRipple } from "@/components/effects/use-magnetic";
import { HomeNewsletterBar } from "@/components/home-newsletter-bar";
import { HomeTestimonials } from "@/components/home-testimonials";
import { HomeCoachCta } from "@/components/home-coach-cta";
import { useInView } from "@/hooks/useInView";
import type { Program } from "@/lib/content";
import type { HomeLuxuryCopy } from "@/lib/home-luxury-copy";
import { getNavChromeCopy } from "@/lib/launch-copy";
import { getDirection, type Locale } from "@/lib/i18n";
import { getBundlesCopy } from "@/lib/bundles-copy";
import { BUNDLES } from "@/lib/bundles";
import { cn } from "@/lib/utils";

import type { HomeCoachPreview } from "@/components/luxury/luxury-home";
import { HeroSection } from "@/components/home/hero-section";
import { HomeAmbientBackdrop } from "@/components/home/home-ambient-backdrop";
import { LogoShowcase } from "@/components/home/logo-showcase";
import { MotionReveal } from "@/components/home/motion-reveal";
import { NexusChrome } from "@/components/home/nexus-chrome";
import { ParallaxLayer } from "@/components/home/parallax-layer";
import { PremiumFullBleedImage } from "@/components/home/premium-full-bleed-image";
import { SectionTransition } from "@/components/home/section-transition";
import { TjaiEngineChrome } from "@/components/home/tjai-engine-chrome";
import { HeroTjaiBrainDeco } from "@/components/hero-tjai-brain-deco";
import { CinematicHowItWorks, CinematicTransformation } from "@/components/home/cinematic-sections";
import { Cinematic3DAct } from "@/components/home/cinematic-3d-act";
import { SplineShowcase } from "@/components/home/spline-showcase";
import { useMagneticButton } from "@/hooks/useMagneticButton";

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const a = () => setR(mq.matches);
    a();
    mq.addEventListener("change", a);
    return () => mq.removeEventListener("change", a);
  }, []);
  return r;
}

// Count-up on scroll — eases to target, glows on settle, jumps to value under reduced-motion.
function CountUp({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { threshold: 0.3, once: true });
  const [val, setVal] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      setSettled(true);
      return;
    }
    const dur = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      const el = numRef.current;
      if (el) el.style.setProperty("--countup-glow", `${(eased * 0.55).toFixed(2)}`);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setVal(target);
        setSettled(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <div
      ref={ref}
      className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center lg:min-h-[9rem] lg:py-8 lg:px-8"
    >
      <p
        ref={numRef}
        className={`font-display text-[clamp(1.65rem,3.8vw,2.65rem)] font-medium tabular-nums tracking-tight bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent motion-safe:transition-transform motion-safe:duration-300 ${
          settled ? "motion-safe:scale-100" : "motion-safe:scale-[0.96]"
        }`}
        style={
          {
            "--countup-glow": "0",
            filter: "drop-shadow(0 0 calc(var(--countup-glow) * 14px) rgba(34, 211, 238, calc(var(--countup-glow) * 0.6)))"
          } as React.CSSProperties
        }
      >
        {val}{suffix}
      </p>
      <p className="mt-3 max-w-[11rem] text-[10px] font-medium uppercase leading-relaxed tracking-[0.22em] text-faint">
        {label}
      </p>
    </div>
  );
}

function TjaiMagneticPrimary({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  const ref = useMagneticButton<HTMLAnchorElement>(0.25);
  return (
    <Link href={href} ref={ref} className={className}>
      {children}
    </Link>
  );
}

/**
 * Bundle catalog teaser CTA — magnetic pull + ripple, matches the
 * Download PDF pill vocabulary. Used on the home page bundle teaser
 * section so the home → bundles CTAs feel like one system.
 */
function BundleTeaserCTA({ href, label }: { href: string; label: string }) {
  const magnetic = useMagnetic<HTMLAnchorElement>({ strength: 6, max: 9 });
  const ripple = useRipple<HTMLAnchorElement>();
  const ref = useMergedRef<HTMLAnchorElement>(magnetic, ripple);
  return (
    <a
      ref={ref}
      href={href}
      className="group/cta tj-cta-sheen relative inline-flex min-h-[52px] shrink-0 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] px-7 py-3 text-sm font-bold text-background shadow-[0_4px_24px_rgba(34,211,238,0.35)] transition-[transform,box-shadow] duration-200 hover:scale-[1.02] hover:shadow-[0_8px_44px_rgba(34,211,238,0.55)]"
      style={
        {
          "--mag-x": "0px",
          "--mag-y": "0px",
          transform: "translate3d(var(--mag-x), var(--mag-y), 0)",
          transition:
            "transform 220ms cubic-bezier(0.2,1,0.3,1), box-shadow 240ms"
        } as React.CSSProperties
      }
    >
      <span className="relative">{label}</span>
      <ArrowRight
        className="relative h-4 w-4 transition-transform rtl:rotate-180 motion-safe:group-hover/cta:translate-x-1 rtl:motion-safe:group-hover/cta:-translate-x-1"
        aria-hidden
      />
    </a>
  );
}

/** Spec-sheet style: no cursor spotlight, no lift — reads like a serious product system */
function PlatformFeatureCard({
  icon: Icon,
  title,
  desc,
  accent = "#22D3EE",
  span = 1,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  accent?: string;
  span?: 1 | 2;
}) {
  return (
    <article
      className={cn(
        "glass-panel group relative flex h-full flex-col overflow-hidden p-8 transition-[transform,border-color,box-shadow,background-color] duration-[250ms] lg:p-10",
        "tj-card-cinematic-hover hover:bg-[rgba(17,18,21,0.95)]",
        span === 2 && "md:col-span-2 md:min-h-[unset] md:flex-row md:items-start md:gap-14"
      )}
    >
      <div
        className="pointer-events-none absolute left-8 top-20 bottom-20 w-px opacity-90 lg:left-10"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${accent}55 35%, ${accent}40 65%, transparent 100%)`,
        }}
        aria-hidden
      />
      <div
        className={cn(
          "mb-6 flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.08] bg-background",
          span === 2 && "md:mb-0"
        )}
      >
        <Icon className="h-[18px] w-[18px] text-muted transition-colors duration-200 group-hover:text-cyan-100" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-medium tracking-tight text-white">{title}</h3>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-faint">{desc}</p>
      </div>
    </article>
  );
}

export function ImmersiveHome({
  locale, copy, coaches: _coaches, freePrograms: _freePrograms
}: {
  locale: Locale; copy: HomeLuxuryCopy;
  coaches: HomeCoachPreview[]; freePrograms: Program[];
}) {
  void _coaches; void _freePrograms;
  const reduce = useReducedMotion();
  const direction = getDirection(locale);
  const navChrome = getNavChromeCopy(locale);

  const [heroEntered, setHeroEntered] = useState(reduce);
  const [hideScrollCue, setHideScrollCue] = useState(false);
  const [liveStats, setLiveStats] = useState({ activeToday: 0 });

  const heroSectionRef = useRef<HTMLElement | null>(null);

  // Hero enter
  useEffect(() => {
    if (reduce) { setHeroEntered(true); return; }
    const t = window.setTimeout(() => setHeroEntered(true), 80);
    return () => clearTimeout(t);
  }, [reduce]);

  // Scroll cue
  useEffect(() => {
    const fn = () => setHideScrollCue(window.scrollY > 100);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Live stats
  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/live", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled && d) setLiveStats({ activeToday: Number(d.activeToday ?? 0) }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);


  const lineIn = (delay: number): CSSProperties => ({
    opacity: heroEntered ? 1 : 0,
    transform: heroEntered ? "translateY(0)" : "translateY(var(--tj-reveal-distance, 20px))",
    transition: reduce
      ? "none"
      : `opacity var(--tj-motion-hero, 1040ms) var(--tj-ease-premium, cubic-bezier(0.22,1,0.36,1)) ${delay}ms, transform var(--tj-motion-hero, 1040ms) var(--tj-ease-premium, cubic-bezier(0.22,1,0.36,1)) ${delay}ms`,
  });

  const bundlesCopy = getBundlesCopy(locale);

  const features = [
    { icon: Brain, title: "TJAI — Your AI Coach", desc: "Adaptive intake, progress-aware memory, and AI-built 12-week transformation plans. Diet + training + supplements.", accent: "#22D3EE", span: 2 as const },
    { icon: Dumbbell, title: "20+ Expert Programs", desc: "12-week structured plans for home or gym. Fat loss, muscle gain — all levels.", accent: "#67E8F9", span: 1 as const },
    { icon: Apple, title: "Full Diet Systems", desc: "Daily meal plans with macros, recipes, grocery lists. Halal, vegan, budget - covered.", accent: "#0EA5E9", span: 1 as const },
    { icon: Users, title: "Coach Marketplace", desc: "Book certified coaches. 1-on-1 guidance and personalized feedback.", accent: "#22D3EE", span: 1 as const },
    { icon: Trophy, title: "Leaderboards", desc: "Earn TJCOIN, compete on weekly boards, unlock rewards for consistency.", accent: "#67E8F9", span: 1 as const },
    { icon: Globe, title: "10 Languages", desc: "Training and nutrition flows support 10 locales from the first visit.", accent: "#0EA5E9", span: 1 as const }
  ] as const;

  // TJAI section ref for reveal trigger
  const tjaiRef = useRef<HTMLElement | null>(null);
  const tjaiInView = useInView(tjaiRef as React.RefObject<HTMLElement>, { threshold: 0.15, once: true });

  // Nexus section ref for node travel
  const nexusRef = useRef<HTMLElement | null>(null);
  const nexusInView = useInView(nexusRef as React.RefObject<HTMLElement>, { threshold: 0.15, once: true });

  const [nexusParallaxY, setNexusParallaxY] = useState(0);
  useEffect(() => {
    if (reduce || typeof window === "undefined" || window.innerWidth < 768) return;
    const fn = () => {
      if (!nexusRef.current) return;
      const rect = nexusRef.current.getBoundingClientRect();
      const c = rect.top + rect.height / 2;
      const vc = window.innerHeight / 2;
      setNexusParallaxY((c - vc) * 0.14 * 0.85);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [reduce]);

  return (
    <div
      className="relative min-h-screen bg-background text-white"
      dir={direction}
      style={{ "--tj-reveal-distance": "40px" } as CSSProperties}
    >
      <HomeAmbientBackdrop reduce={reduce} />

      <div className="relative z-[1]">
      <HeroSection
        sectionRef={heroSectionRef}
        locale={locale}
        direction={direction}
        reduce={reduce}
        liveStats={liveStats}
        heroEntered={heroEntered}
        hideScrollCue={hideScrollCue}
        lineIn={lineIn}
        heroHeadline={copy.hero.headline}
        heroHeadlineLine2={copy.hero.headlineLine2}
        heroGradientTagline={copy.hero.heroGradientTagline}
        heroSub={copy.hero.sub}
        ctaPrimary={copy.hero.ctaPrimary}
        copy={copy.hero}
      />

      <SectionTransition variant="soft" />

      <Cinematic3DAct />

      <SectionTransition variant="soft" />

      <section
        className="reveal-section relative border-t border-divider bg-[rgba(10,10,11,0.7)] px-6 py-16 lg:px-12 lg:py-20"
        aria-label="TJAI overview"
      >
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">TJAI</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your AI coach, built for your body.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
              Answer 25 questions — TJAI generates a full 12-week training plan, diet, and supplement stack
              tuned to your goals, equipment and time. Preview it free; unlock the full plan when you&rsquo;re ready.
            </p>
          </div>
          <Link
            href={`/${locale}/tjai`}
            className="lux-btn-primary inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 tj-cta-sheen rounded-full bg-[linear-gradient(135deg,#22D3EE,#0EA5E9)] shadow-[0_0_16px_rgba(34,211,238,0.2)] hover:shadow-[0_0_24px_rgba(34,211,238,0.32)] transition-[transform,box-shadow] duration-200 hover:scale-[1.02] px-6 py-3 text-sm font-bold text-background shadow-[0_4px_24px_rgba(34,211,238,0.35)] transition-[transform,box-shadow] duration-200 hover:scale-[1.02]"
          >
            Try TJAI <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════ BUNDLES CATALOG TEASER ══════════════ */}
      <section
        className="reveal-section relative overflow-hidden border-t border-divider bg-background px-6 py-20 lg:px-12 lg:py-28"
        aria-label="Bundle catalog"
      >
        {/* Ambient cyan glow anchored top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(45% 60% at 78% 30%, rgba(34,211,238,0.10), transparent 70%)"
          }}
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{bundlesCopy.homeTeaser.eyebrow}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              <span className="tj-title-shimmer">{bundlesCopy.title(BUNDLES.length)}</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
              {bundlesCopy.homeTeaser.body}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
              {(["fat-loss", "muscle-gain", "recomp", "strength", "conditioning", "foundation"] as const).map((key) => (
                <span
                  key={key}
                  className="rounded-full border border-cyan-300/25 bg-cyan-300/[0.05] px-2.5 py-1 text-cyan-100/85"
                >
                  {bundlesCopy.filterLabels[key]}
                </span>
              ))}
            </div>
          </div>
          <BundleTeaserCTA href={`/${locale}/bundles`} label={bundlesCopy.homeTeaser.cta(BUNDLES.length)} />
        </div>
      </section>

      {/* Editorial rail — no marquee, no shouty caps */}
      <div className="-mt-px border-y border-white/[0.06] bg-surface/35">
        <p className="mx-auto max-w-6xl px-6 py-4 text-center text-[10px] font-medium uppercase leading-loose tracking-[0.28em] text-dim lg:px-12">
          {[
            "12-week periodization",
            "Macro-aware meals",
            "TJAI · GPT-4o",
            "Coach marketplace",
            "10 languages",
          ].join("      ·      ")}
        </p>
      </div>

      {/* Platform spec */}
      <section className="reveal-section border-t border-divider px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <MotionReveal reducedMotion={reduce} className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-dim">The stack</p>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
              Built like training software,
              <span className="text-faint"> not a toy app.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Structured plans, real nutrition systems, AI that respects constraints, and human coaches when you want them — one surface, one visual language.
            </p>
          </MotionReveal>

          <div className="mt-16 grid grid-cols-1 gap-px bg-divider md:grid-cols-2">
            {features.map((f, i) => (
              <MotionReveal reducedMotion={reduce} key={f.title} delayMs={i * 60} className={cn(f.span === 2 && "md:col-span-2")}>
                <PlatformFeatureCard {...f} />
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <CinematicHowItWorks />
      <CinematicTransformation reduce={reduce} />

      <SplineShowcase />

      {/* Stats — restrained, no neon scoreboard */}
      <section className="reveal-section border-y border-divider bg-background py-16 lg:py-20">
        <MotionReveal reducedMotion={reduce} className="mx-auto max-w-5xl px-6 lg:px-12">
          <div className="flex flex-col divide-y divide-[#1E2028] lg:flex-row lg:divide-x lg:divide-y-0">
            <CountUp target={12} label="Free Bundles" />
            <CountUp target={12} label="Weeks Per Plan" />
            <CountUp target={10} label="Languages" />
          </div>
        </MotionReveal>
      </section>

      <SectionTransition variant="soft" />

      {/* ══════════════ TJAI — KINETIC HEART CORE ══════════════ */}
      <section
        ref={(el) => { tjaiRef.current = el; }}
        className="reveal-section relative overflow-hidden border-t border-divider bg-background lg:min-h-[700px]"
      >
        <span
          className="ghost-text pointer-events-none start-1/2 top-8 z-0 max-lg:opacity-[0.02] -translate-x-1/2 text-[clamp(4rem,18vw,12rem)]"
          aria-hidden
        >
          INTELLIGENCE
        </span>

        <PremiumFullBleedImage
          src="/assets/hero/hero-tjai-core.png"
          preset="tjai"
          active={tjaiInView || reduce}
          reduce={reduce}
          peakOpacity={0.28}
        />
        <TjaiEngineChrome active={tjaiInView || reduce} reduce={reduce} />

        <div className="pointer-events-none absolute inset-0 z-[1] opacity-40 max-lg:hidden" aria-hidden>
          <HeroTjaiBrainDeco reduce={reduce} active={tjaiInView} />
        </div>

        <div
          className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-16 lg:px-12 lg:py-28"
        >
          <div className="relative hidden min-h-[380px] lg:flex lg:items-center lg:justify-center" aria-hidden>
            {/* TJAI brand mark — cyan glow ring, no wireframe mannequin */}
            <div
              className="relative h-[320px] w-[320px] rounded-full"
              style={{
                background: "radial-gradient(circle at 50% 45%, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0.06) 42%, transparent 70%)",
                boxShadow: "0 0 120px rgba(34,211,238,0.18) inset"
              }}
            >
              <div className="absolute inset-10 rounded-full border border-[rgba(34,211,238,0.18)]" />
              <div className="absolute inset-20 rounded-full border border-[rgba(34,211,238,0.12)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-5xl font-bold tracking-tight text-accent">TJAI</span>
              </div>
            </div>
          </div>

          <MotionReveal reducedMotion={reduce}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">AI transformation engine</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-white">
              Meet TJAI.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
              Complete an adaptive intake and get a complete 12-week plan in minutes — training blocks, meals, macros, and progression tuned to your metabolism, schedule, and feedback.
            </p>

            <ul className="mt-10 space-y-4">
              {[
                {
                  Icon: Sparkles,
                  title: "Science-based calculations",
                  desc: "Metabolism, load, and recovery modeled like a performance lab — not generic templates.",
                },
                {
                  Icon: Calendar,
                  title: "Complete 12-week structure",
                  desc: "Periodized weeks, deloads, and checkpoints you can execute without guesswork.",
                },
                {
                  Icon: Utensils,
                  title: "Daily meal plans + macros",
                  desc: "Meals, grocery logic, and macro targets aligned to your training phase.",
                },
                {
                  Icon: RefreshCw,
                  title: "Adjustable + regeneratable",
                  desc: "Life changes — regenerate blocks while preserving your history and intent.",
                },
              ].map((row) => (
                <li
                  key={row.title}
                  className="group flex gap-4 rounded-xl border border-transparent bg-transparent p-1 transition-[border-color,background-color] duration-200 hover:border-[rgba(34,211,238,0.12)] hover:bg-[rgba(34,211,238,0.03)]"
                  style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(34,211,238,0.06)] transition-[border-color,box-shadow] duration-200 group-hover:border-[rgba(34,211,238,0.35)]"
                  >
                    <row.Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-white">{row.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-dim group-hover:text-muted">{row.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TjaiMagneticPrimary
                href={`/${locale}/ai`}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] bg-accent px-8 py-3.5 text-[15px] font-extrabold text-[#09090B] shadow-[0_12px_40px_rgba(34,211,238,0.28)] transition-[filter,transform,box-shadow] duration-200 hover:brightness-110 hover:-translate-y-0.5"
              >
                <Zap className="h-4 w-4 shrink-0" aria-hidden />
                Build my plan — free preview
              </TjaiMagneticPrimary>
              <Link
                href={`/${locale}/ai`}
                className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.14)] px-8 py-3.5 text-[15px] font-semibold text-white transition-[border-color,background-color,color] duration-200 hover:border-[rgba(34,211,238,0.35)] hover:bg-[rgba(34,211,238,0.04)] hover:text-accent"
              >
                See a sample plan
                <ArrowRight className="ms-1 h-4 w-4" aria-hidden />
              </Link>
            </div>
            <p className="mt-6 text-xs text-dim">
              <Link href={`/${locale}/membership`} className="text-muted underline-offset-4 transition-colors hover:text-accent">
                Core (Free) · TJAI unlock $10 · Pro $6/mo · Apex $10/mo
              </Link>
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <HomeTestimonials locale={locale} />

      <LogoShowcase locale={locale} reduce={reduce} />

      {/* ══════════════ COACH CTA ══════════════ */}
      <div id="coaches" className="scroll-mt-20">
        <HomeCoachCta locale={locale} />
      </div>

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <HomeNewsletterBar locale={locale} />

      {/* ══════════════ FINAL CTA — NEXUS BG ══════════════ */}
      <section
        ref={(el) => { nexusRef.current = el; }}
        className="relative overflow-hidden border-t border-divider px-6 py-32 text-center lg:px-12 lg:py-44"
      >
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <ParallaxLayer reduce={reduce} strength={4} className="absolute inset-0 h-full w-full">
            <div className="absolute inset-0">
              <PremiumFullBleedImage
                src="/assets/hero/hero-nexus.png"
                preset="nexus"
                active={nexusInView || reduce}
                reduce={reduce}
                parallaxY={nexusParallaxY * 0.52}
                peakOpacity={0.44}
              />
            </div>
          </ParallaxLayer>
        </div>
        <NexusChrome reduce={reduce} parallaxY={nexusParallaxY} />

        {/* Animated SVG node network — screen-blended + breath motion */}
        {nexusInView && (
          <ParallaxLayer reduce={reduce} strength={12} className="pointer-events-none absolute inset-0 z-[4] h-full w-full">
          <svg
            className={cn(
              "pointer-events-none absolute inset-0 h-full w-full mix-blend-screen",
              reduce ? "opacity-[0.26]" : "animate-nexus-network"
            )}
            aria-hidden
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1200 600"
          >
            {[
              "M 600 550 L 600 300 L 300 100",
              "M 600 300 L 900 100",
              "M 600 300 L 150 200",
              "M 600 300 L 1050 200",
              "M 600 550 L 380 490",
              "M 600 550 L 820 490",
            ].map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round"
                strokeDasharray="1000" strokeDashoffset="1000"
                style={{ animation: `nodeTravel ${3 + i * 0.7}s ease-in-out ${i * 0.4}s infinite` }} />
            ))}
            {[[600,550],[600,300],[300,100],[900,100],[150,200],[1050,200],[380,490],[820,490]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="5" fill="#22D3EE"
                style={{ animation: `neuralPulse ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </svg>
          </ParallaxLayer>
        )}

        {/* CTA content */}
        <div className="relative z-10 mx-auto max-w-3xl">
          <MotionReveal reducedMotion={reduce}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-dim">Access</p>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Start your next{" "}
              <span className="bg-gradient-to-r from-[#22D3EE] to-[#67E8F9] bg-clip-text text-transparent">12 weeks</span>
              <span className="text-faint">.</span>
            </h2>
            <p className="mt-6 text-lg text-muted">{copy.midCta?.sub ?? "Join thousands already training smarter with TJFit."}</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={`/${locale}/signup`}
                className="tj-cta-glow-hover inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] px-10 py-4 text-base font-bold text-[#0A0A0B] shadow-[0_0_40px_rgba(34,211,238,0.5),0_0_80px_rgba(34,211,238,0.2)] transition-transform hover:scale-[1.04]"
              >
                {navChrome.joinLabel} — It&apos;s Free
              </Link>
              <Link
                href={`/${locale}/bundles`}
                className="tj-cta-sheen inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/20 bg-white/[0.05] px-10 py-4 text-base font-semibold text-white backdrop-blur-sm transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-cyan-300/40 hover:bg-cyan-300/[0.05] hover:text-cyan-50 hover:shadow-[0_0_22px_rgba(34,211,238,0.16)]"
              >
                Browse Bundles
              </Link>
            </div>
            <p className="mt-8 text-[13px] text-dim">{copy.hero.trustLine}</p>
          </MotionReveal>
        </div>
      </section>
      </div>
    </div>
  );
}
