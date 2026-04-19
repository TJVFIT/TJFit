"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dumbbell, Brain, Users, Trophy, Apple, Globe,
  ArrowRight, Zap, Sparkles, Calendar, RefreshCw, Utensils
} from "lucide-react";

import { HomeProgramPreviewCard } from "@/components/program-card";
import { HomeNewsletterBar } from "@/components/home-newsletter-bar";
import { HomeTestimonials } from "@/components/home-testimonials";
import { HomeCoachCta } from "@/components/home-coach-cta";
import { useInView } from "@/hooks/useInView";
import type { Program } from "@/lib/content";
import { trackMarketingEvent } from "@/lib/analytics-events";
import type { HomeLuxuryCopy } from "@/lib/home-luxury-copy";
import { getNavChromeCopy } from "@/lib/launch-copy";
import { getProgramUiCopy } from "@/lib/program-localization";
import { getDirection, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { HomeCoachPreview, HomeProgramPreview } from "@/components/luxury/luxury-home";
import { HeroSection } from "@/components/home/hero-section";
import { HomeAmbientBackdrop } from "@/components/home/home-ambient-backdrop";
import { LogoShowcase } from "@/components/home/logo-showcase";
import { MotionReveal } from "@/components/home/motion-reveal";
import { NexusChrome } from "@/components/home/nexus-chrome";
import { ParallaxLayer } from "@/components/home/parallax-layer";
import { PremiumFullBleedImage } from "@/components/home/premium-full-bleed-image";
import { ProgramsDepthFx } from "@/components/home/programs-depth-fx";
import { SectionTransition } from "@/components/home/section-transition";
import { TjaiEngineChrome } from "@/components/home/tjai-engine-chrome";
import { HeroTjaiBrainDeco } from "@/components/hero-tjai-brain-deco";
import { CinematicHowItWorks, CinematicTransformation } from "@/components/home/cinematic-sections";
import { HeroAiCore } from "@/components/home/hero-ai-core";
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

function useIsTouchDevice() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia("(hover: none)").matches);
  }, []);
  return touch;
}

function formatMoney(locale: Locale, value: number) {
  const n = Number.isFinite(value) ? value : 0;
  const eur = n * 0.029;
  const loc = locale === "tr" ? "tr-TR" : locale === "ar" ? "ar-SA" : locale === "es" ? "es-ES" : locale === "fr" ? "fr-FR" : "en-GB";
  try { return new Intl.NumberFormat(loc, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(eur); }
  catch { return `€${Math.round(eur)}`; }
}

// Count-up on scroll
function CountUp({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { threshold: 0.3, once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return (
    <div ref={ref} className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center lg:min-h-[9rem] lg:py-8 lg:px-8">
      <p className="font-display text-[clamp(1.65rem,3.8vw,2.65rem)] font-medium tabular-nums tracking-tight text-white">
        {val}{suffix}
      </p>
      <p className="mt-3 max-w-[11rem] text-[10px] font-medium uppercase leading-relaxed tracking-[0.22em] text-[#71717A]">
        {label}
      </p>
    </div>
  );
}

// Program card tilt wrapper component — avoids hook-in-callback violation
function TiltCard({ children, disabled }: { children: React.ReactNode; disabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) scale(1.015)`;
  };
  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: "transform 0.2s ease-out" }}
      className="hover:border-cyan-400/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-[border-color,box-shadow] duration-300 h-full"
    >
      {children}
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
          "mb-6 flex h-10 w-10 shrink-0 items-center justify-center border border-white/[0.08] bg-[#0A0A0B]",
          span === 2 && "md:mb-0"
        )}
      >
        <Icon className="h-[18px] w-[18px] text-[#A1A1AA] transition-colors group-hover:text-white" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-lg font-medium tracking-tight text-white">{title}</h3>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-[#71717A]">{desc}</p>
      </div>
    </article>
  );
}

export function ImmersiveHome({
  locale, copy, programs, diets, coaches: _coaches, freePrograms: _freePrograms, programCount, dietCount
}: {
  locale: Locale; copy: HomeLuxuryCopy; programs: HomeProgramPreview[]; diets: HomeProgramPreview[];
  coaches: HomeCoachPreview[]; freePrograms: Program[]; programCount: number; dietCount: number;
}) {
  void _coaches; void _freePrograms;
  const reduce = useReducedMotion();
  const isTouch = useIsTouchDevice();
  const direction = getDirection(locale);
  const programUi = getProgramUiCopy(locale);
  const navChrome = getNavChromeCopy(locale);

  const [heroEntered, setHeroEntered] = useState(reduce);
  const [hideScrollCue, setHideScrollCue] = useState(false);
  const [liveStats, setLiveStats] = useState({ activeToday: 0 });

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const programsSectionRef = useRef<HTMLDivElement>(null);

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


  // Programs section parallax
  const [parallaxY, setParallaxY] = useState(0);
  useEffect(() => {
    if (reduce || window.innerWidth < 768) return;
    const fn = () => {
      if (!programsSectionRef.current) return;
      const rect = programsSectionRef.current.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      setParallaxY((sectionCenter - viewportCenter) * 0.28);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [reduce]);

  const lineIn = (delay: number): CSSProperties => ({
    opacity: heroEntered ? 1 : 0,
    transform: heroEntered ? "translateY(0)" : "translateY(var(--tj-reveal-distance, 20px))",
    transition: reduce
      ? "none"
      : `opacity var(--tj-motion-hero, 1040ms) var(--tj-ease-premium, cubic-bezier(0.22,1,0.36,1)) ${delay}ms, transform var(--tj-motion-hero, 1040ms) var(--tj-ease-premium, cubic-bezier(0.22,1,0.36,1)) ${delay}ms`,
  });

  const programSlice = useMemo(() => programs.slice(0, 4), [programs]);
  const dietSlice = useMemo(() => diets.slice(0, 3), [diets]);

  const features = [
    { icon: Brain, title: "TJAI — Your AI Coach", desc: "25 questions. GPT-4o builds your complete 12-week transformation plan. Diet + training + supplements.", accent: "#22D3EE", span: 2 as const },
    { icon: Dumbbell, title: "20+ Expert Programs", desc: "12-week structured plans for home or gym. Fat loss, muscle gain — all levels.", accent: "#67E8F9", span: 1 as const },
    { icon: Apple, title: "Full Diet Systems", desc: "Daily meal plans with macros, recipes, grocery lists. Halal, vegan, budget — covered.", accent: "#A78BFA", span: 1 as const },
    { icon: Users, title: "Coach Marketplace", desc: "Book certified coaches. 1-on-1 guidance and personalized feedback.", accent: "#22D3EE", span: 1 as const },
    { icon: Trophy, title: "Leaderboards", desc: "Earn TJCOIN, compete on weekly boards, unlock rewards for consistency.", accent: "#A78BFA", span: 1 as const },
    { icon: Globe, title: "5 Languages", desc: "English, Turkish, Arabic, Spanish, French. Premium fitness in your language.", accent: "#A78BFA", span: 1 as const }
  ] as const;

  // TJAI section ref for reveal trigger
  const tjaiRef = useRef<HTMLElement | null>(null);
  const tjaiInView = useInView(tjaiRef as React.RefObject<HTMLElement>, { threshold: 0.15, once: true });

  // Nexus section ref for node travel
  const nexusRef = useRef<HTMLElement | null>(null);
  const nexusInView = useInView(nexusRef as React.RefObject<HTMLElement>, { threshold: 0.15, once: true });

  const programsBgInView = useInView(programsSectionRef as React.RefObject<HTMLElement>, { threshold: 0.06, once: true });

  const [nexusParallaxY, setNexusParallaxY] = useState(0);
  useEffect(() => {
    if (reduce || typeof window === "undefined" || window.innerWidth < 768) return;
    const fn = () => {
      if (!nexusRef.current) return;
      const rect = nexusRef.current.getBoundingClientRect();
      const c = rect.top + rect.height / 2;
      const vc = window.innerHeight / 2;
      setNexusParallaxY((c - vc) * 0.14);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [reduce]);

  return (
    <div
      className="relative min-h-screen bg-[#0A0A0B] text-white"
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
        heroSub={copy.hero.sub}
        ctaPrimary={copy.hero.ctaPrimary}
      />

      <SectionTransition variant="soft" />
      {/* Editorial rail — no marquee, no shouty caps */}
      <div className="-mt-px border-y border-white/[0.06] bg-[#111215]/35">
        <p className="mx-auto max-w-6xl px-6 py-4 text-center text-[10px] font-medium uppercase leading-loose tracking-[0.28em] text-[#52525B] lg:px-12">
          {[
            "12-week periodization",
            "Macro-aware meals",
            "TJAI · GPT-4o",
            "Coach marketplace",
            "Five languages",
          ].join("      ·      ")}
        </p>
      </div>

      {/* Platform spec */}
      <section className="reveal-section border-t border-[#1E2028] px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <MotionReveal reducedMotion={reduce} className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#52525B]">The stack</p>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
              Built like training software,
              <span className="text-[#71717A]"> not a toy app.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-[#A1A1AA]">
              Structured plans, real nutrition systems, AI that respects constraints, and human coaches when you want them — one surface, one visual language.
            </p>
          </MotionReveal>

          <div className="mt-16 grid grid-cols-1 gap-px bg-[#1E2028] md:grid-cols-2">
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

      {/* Stats — restrained, no neon scoreboard */}
      <section className="reveal-section border-y border-[#1E2028] bg-[#0A0A0B] py-16 lg:py-20">
        <MotionReveal reducedMotion={reduce} className="mx-auto max-w-5xl px-6 lg:px-12">
          <div className="flex flex-col divide-y divide-[#1E2028] lg:flex-row lg:divide-x lg:divide-y-0">
            <CountUp target={programCount} suffix="+" label="Expert Programs" />
            <CountUp target={dietCount} suffix="+" label="Diet Systems" />
            <CountUp target={12} label="Weeks Per Plan" />
            <CountUp target={5} label="Languages" />
          </div>
        </MotionReveal>
      </section>

      <SectionTransition variant="soft" />

      {/* ══════════════ PROGRAMS — Parallax BG ══════════════ */}
      <div ref={programsSectionRef} className="reveal-section relative overflow-hidden border-t border-[#1E2028]">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <ParallaxLayer reduce={reduce} strength={9} className="absolute inset-0 h-full w-full">
            <div className="absolute inset-0">
              <PremiumFullBleedImage
                src="/assets/hero/hero-programs-bg.png"
                preset="programs"
                active={programsBgInView || reduce}
                reduce={reduce}
                parallaxY={parallaxY}
                peakOpacity={0.24}
              />
            </div>
          </ParallaxLayer>
          <ProgramsDepthFx reduce={reduce} />
        </div>

        <section className="relative z-10 px-6 py-24 lg:px-12 lg:py-32">
          <span className="ghost-text pointer-events-none start-1/2 top-20 z-0 -translate-x-1/2" aria-hidden>
            PROGRAMS
          </span>
          <div className="relative z-[1] mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <MotionReveal reducedMotion={reduce}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#22D3EE]">Transformation systems</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                  {programCount}+ complete<br /><span className="text-[#22D3EE]">programs</span>
                </h2>
              </MotionReveal>
              <MotionReveal reducedMotion={reduce} delayMs={100}>
                <Link href={`/${locale}/programs`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#22D3EE] transition-opacity hover:opacity-80">
                  View all programs <ArrowRight className="h-4 w-4" />
                </Link>
              </MotionReveal>
            </div>
            <div className="mb-10 h-px max-w-lg bg-gradient-to-r from-[#22D3EE]/20 via-[#1E2028] to-transparent" aria-hidden />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {programSlice.map((p, i) => (
                <MotionReveal reducedMotion={reduce} key={p.slug} delayMs={i * 80}>
                  <TiltCard disabled={isTouch || reduce}>
                    <HomeProgramPreviewCard
                      program={p}
                      href={`/${locale}/programs/${p.slug}`}
                      priceFormatted={formatMoney(locale, p.price)}
                      fromLabel={copy.programs.from}
                      reducedMotion={reduce}
                      ctaLabel={p.is_free ? programUi.viewProgram : programUi.getFullAccess}
                      onNavigate={() => trackMarketingEvent("program_view", { slug: p.slug, surface: "immersive-home" })}
                    />
                  </TiltCard>
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>
      </div>

      <SectionTransition variant="soft" />

      {/* ══════════════ TJAI — KINETIC HEART CORE ══════════════ */}
      <section
        ref={(el) => { tjaiRef.current = el; }}
        className="reveal-section relative overflow-hidden border-t border-[#1E2028] bg-[#09090B]"
        style={{ minHeight: "min(90vh, 700px)" }}
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
          style={{ minHeight: "inherit" }}
        >
          <div className="relative flex min-h-[220px] justify-center lg:min-h-[380px]">
            <HeroAiCore reduce={reduce} layout="embedded" />
          </div>

          <MotionReveal reducedMotion={reduce}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#22D3EE]">AI transformation engine</p>
            <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-white">
              Meet TJAI.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#A1A1AA]">
              Answer 25 questions. Get a complete 12-week plan in minutes — training blocks, meals, macros, and progression tuned to your metabolism and schedule.
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
                    <row.Icon className="h-5 w-5 text-[#22D3EE]" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-white">{row.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#52525B] group-hover:text-[#A1A1AA]">{row.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TjaiMagneticPrimary
                href={`/${locale}/ai`}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[10px] bg-[#22D3EE] px-8 py-3.5 text-[15px] font-extrabold text-[#09090B] shadow-[0_12px_40px_rgba(34,211,238,0.28)] transition-[filter,transform,box-shadow] duration-200 hover:brightness-110 hover:-translate-y-0.5"
              >
                <Zap className="h-4 w-4 shrink-0" aria-hidden />
                Build my plan — free preview
              </TjaiMagneticPrimary>
              <Link
                href={`/${locale}/ai`}
                className="inline-flex min-h-[52px] items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.14)] px-8 py-3.5 text-[15px] font-semibold text-white transition-[border-color,background-color,color] duration-200 hover:border-[rgba(34,211,238,0.35)] hover:bg-[rgba(34,211,238,0.04)] hover:text-[#22D3EE]"
              >
                See a sample plan
                <ArrowRight className="ms-1 h-4 w-4" aria-hidden />
              </Link>
            </div>
            <p className="mt-6 text-xs text-[#52525B]">
              <Link href={`/${locale}/membership`} className="text-[#A1A1AA] underline-offset-4 transition-colors hover:text-[#22D3EE]">
                Core (Free) · Pro €20/mo · Apex €35/mo
              </Link>
            </p>
          </MotionReveal>
        </div>
      </section>

      {/* ══════════════ DIETS ══════════════ */}
      {dietSlice.length > 0 && (
        <section className="reveal-section relative border-t border-[#1E2028] bg-[#0A0A0B] px-6 py-24 lg:px-12 lg:py-32">
          <span className="ghost-text pointer-events-none start-1/2 top-16 z-0 -translate-x-1/2 text-[#A78BFA] opacity-[0.04]" aria-hidden>
            NUTRITION
          </span>
          <div className="relative z-[1] mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <MotionReveal reducedMotion={reduce}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A78BFA]">Nutrition</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                  {dietCount}+ diet<br /><span className="text-[#A78BFA]">systems</span>
                </h2>
              </MotionReveal>
              <MotionReveal reducedMotion={reduce} delayMs={100}>
                <Link href={`/${locale}/diets`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#A78BFA] transition-opacity hover:opacity-80">
                  View all diets <ArrowRight className="h-4 w-4" />
                </Link>
              </MotionReveal>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dietSlice.map((p, i) => (
                <MotionReveal reducedMotion={reduce} key={p.slug} delayMs={i * 80}>
                  <HomeProgramPreviewCard
                    program={p}
                    href={`/${locale}/programs/${p.slug}`}
                    priceFormatted={formatMoney(locale, p.price)}
                    fromLabel={copy.programs.from}
                    reducedMotion={reduce}
                    ctaLabel={programUi.viewProgram}
                    onNavigate={() => trackMarketingEvent("program_view", { slug: p.slug, surface: "immersive-diets" })}
                  />
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <HomeTestimonials locale={locale} />

      <LogoShowcase locale={locale} reduce={reduce} />

      {/* ══════════════ COACH CTA ══════════════ */}
      <HomeCoachCta locale={locale} />

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <HomeNewsletterBar locale={locale} />

      {/* ══════════════ FINAL CTA — NEXUS BG ══════════════ */}
      <section
        ref={(el) => { nexusRef.current = el; }}
        className="relative overflow-hidden border-t border-[#1E2028] px-6 py-32 text-center lg:px-12 lg:py-44"
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#52525B]">Access</p>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Start your next{" "}
              <span className="bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">12 weeks</span>
              <span className="text-[#71717A]">.</span>
            </h2>
            <p className="mt-6 text-lg text-[#A1A1AA]">{copy.midCta?.sub ?? "Join thousands already training smarter with TJFit."}</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={`/${locale}/signup`}
                className="tj-cta-glow-hover inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] px-10 py-4 text-base font-bold text-[#0A0A0B] shadow-[0_0_40px_rgba(34,211,238,0.5),0_0_80px_rgba(34,211,238,0.2)] transition-transform hover:scale-[1.04]"
              >
                {navChrome.joinLabel} — It&apos;s Free
              </Link>
              <Link
                href={`/${locale}/programs`}
                className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/20 bg-white/[0.05] px-10 py-4 text-base font-semibold text-white backdrop-blur-sm transition-[border-color,background] hover:border-white/30 hover:bg-white/[0.08]"
              >
                Browse Programs
              </Link>
            </div>
            <p className="mt-8 text-[13px] text-[#52525B]">{copy.hero.trustLine}</p>
          </MotionReveal>
        </div>
      </section>
      </div>
    </div>
  );
}
