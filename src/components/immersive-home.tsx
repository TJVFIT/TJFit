"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dumbbell, Brain, Users, Trophy, Apple, Globe,
  ChevronDown, ArrowRight, Zap, Star
} from "lucide-react";

import { ParticleField } from "@/components/particle-field";
import { HomeProgramPreviewCard } from "@/components/program-card";
import { ScrollTicker } from "@/components/ui/ScrollTicker";
import { HomeNewsletterBar } from "@/components/home-newsletter-bar";
import { HomeTestimonials } from "@/components/home-testimonials";
import { HomeCoachCta } from "@/components/home-coach-cta";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { useInView } from "@/hooks/useInView";
import type { Program } from "@/lib/content";
import { trackMarketingEvent } from "@/lib/analytics-events";
import type { HomeLuxuryCopy } from "@/lib/home-luxury-copy";
import { getNavChromeCopy } from "@/lib/launch-copy";
import { getProgramUiCopy } from "@/lib/program-localization";
import { getDirection, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { HomeCoachPreview, HomeProgramPreview } from "@/components/luxury/luxury-home";
import { HeroBicepCurlBackdrop } from "@/components/hero-bicep-curl-motion";
import { HeroTjaiBrainDeco } from "@/components/hero-tjai-brain-deco";

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
    <div ref={ref} className="text-center">
      <p className="font-display text-5xl font-extrabold tabular-nums text-[#22D3EE] stat-number-glow lg:text-7xl">{val}{suffix}</p>
      <p className="mt-3 text-sm font-medium uppercase tracking-[0.2em] text-[#52525B]">{label}</p>
    </div>
  );
}

// Scroll reveal
function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { threshold: 0.1, once: true });
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 700ms cubic-bezier(0,0,0.2,1) ${delay}ms, transform 700ms cubic-bezier(0,0,0.2,1) ${delay}ms`
      }}
    >{children}</div>
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
    ref.current.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.02)`;
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

// Bento feature card
function BentoCard({ icon: Icon, title, desc, accent = "#22D3EE", span = 1 }: {
  icon: React.ElementType; title: string; desc: string; accent?: string; span?: 1 | 2;
}) {
  const [spot, setSpot] = useState({ x: 50, y: 50, visible: false });
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[20px] border border-[#1E2028] bg-[#0D0E12] p-6 transition-[border-color,box-shadow,transform] duration-300",
        "hover:-translate-y-1 hover:border-[rgba(34,211,238,0.3)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(34,211,238,0.06)]",
        span === 2 && "md:col-span-2"
      )}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setSpot({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, visible: true });
      }}
      onMouseLeave={() => setSpot(s => ({ ...s, visible: false }))}
    >
      <div className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{ opacity: spot.visible ? 1 : 0, background: `radial-gradient(250px circle at ${spot.x}% ${spot.y}%, rgba(34,211,238,0.07), transparent 70%)` }}
        aria-hidden />
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }} aria-hidden />
      <div className="relative z-10">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          <Icon className="h-6 w-6" style={{ color: accent, filter: `drop-shadow(0 0 6px ${accent}88)` }} strokeWidth={1.75} />
        </div>
        <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#71717A]">{desc}</p>
      </div>
    </div>
  );
}

function MagneticLink({ href, className, children, onClick }: { href: string; className: string; children: React.ReactNode; onClick?: () => void }) {
  const ref = useMagneticButton<HTMLAnchorElement>(0.3);
  return <Link href={href} className={className} onClick={onClick} ref={ref}>{children}</Link>;
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
  const [hasScanned, setHasScanned] = useState(false);
  const [liveStats, setLiveStats] = useState({ activeToday: 0 });

  const heroRef = useRef<HTMLElement | null>(null);
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

  // Hero in-view (for scanline)
  const heroInView = useInView(heroSectionRef as React.RefObject<HTMLElement>, { threshold: 0.1, once: true });

  const lineIn = (delay: number): CSSProperties => ({
    opacity: heroEntered ? 1 : 0,
    transform: heroEntered ? "translateY(0)" : "translateY(32px)",
    transition: reduce ? "none" : `opacity 800ms cubic-bezier(0,0,0.2,1) ${delay}ms, transform 800ms cubic-bezier(0,0,0.2,1) ${delay}ms`
  });

  const programSlice = useMemo(() => programs.slice(0, 4), [programs]);
  const dietSlice = useMemo(() => diets.slice(0, 3), [diets]);

  const features = [
    { icon: Brain, title: "TJAI — Your AI Coach", desc: "25 questions. GPT-4o builds your complete 12-week transformation plan. Diet + training + supplements.", accent: "#22D3EE", span: 2 as const },
    { icon: Dumbbell, title: "20+ Expert Programs", desc: "12-week structured plans for home or gym. Fat loss, muscle gain — all levels.", accent: "#67E8F9" },
    { icon: Apple, title: "Full Diet Systems", desc: "Daily meal plans with macros, recipes, grocery lists. Halal, vegan, budget — covered.", accent: "#A78BFA" },
    { icon: Users, title: "Coach Marketplace", desc: "Book certified coaches. 1-on-1 guidance and personalized feedback.", accent: "#22D3EE" },
    { icon: Trophy, title: "Leaderboards", desc: "Earn TJCOIN, compete on weekly boards, unlock rewards for consistency.", accent: "#F59E0B" },
    { icon: Globe, title: "5 Languages", desc: "English, Turkish, Arabic, Spanish, French. Premium fitness in your language.", accent: "#A78BFA" }
  ] as const;

  // TJAI section ref for reveal trigger
  const tjaiRef = useRef<HTMLElement | null>(null);
  const tjaiInView = useInView(tjaiRef as React.RefObject<HTMLElement>, { threshold: 0.15, once: true });

  // Nexus section ref for node travel
  const nexusRef = useRef<HTMLElement | null>(null);
  const nexusInView = useInView(nexusRef as React.RefObject<HTMLElement>, { threshold: 0.15, once: true });

  return (
    <div className="bg-[#09090B] text-white" dir={direction}>

      {/* ══════════════ HERO — SPLIT LAYOUT ══════════════ */}
      <section
        ref={(el) => { heroRef.current = el; heroSectionRef.current = el; }}
        className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-16 pt-20 lg:px-12"
      >
        {/* Base + animated bicep silhouette (full-section backdrop) */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[#09090B]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 z-0">
          <HeroBicepCurlBackdrop reduce={reduce} />
        </div>

        {/* Readability: heavy veil on the left so copy stays crisp over the figure */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: [
              "linear-gradient(90deg, #09090B 0%, rgba(9,9,11,0.97) 28%, rgba(9,9,11,0.55) 52%, rgba(9,9,11,0.2) 68%, transparent 100%)",
              "radial-gradient(ellipse 70% 90% at 15% 45%, rgba(9,9,11,0.5) 0%, transparent 55%)",
              "radial-gradient(ellipse 55% 70% at 88% 50%, rgba(34,211,238,0.07) 0%, transparent 55%)"
            ].join(", ")
          }}
          aria-hidden
        />

        {/* Particles — subtle depth layer */}
        <div className="pointer-events-none absolute inset-0 z-[2]" aria-hidden>
          <ParticleField className="absolute inset-0" />
        </div>

        {/* Extra cyan rim on the right — reinforces glow without covering text */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 z-[2] h-full w-[50%] max-md:hidden"
          style={{
            background: "radial-gradient(ellipse 85% 95% at 82% 52%, rgba(34,211,238,0.09) 0%, rgba(34,211,238,0.02) 42%, transparent 72%)"
          }}
          aria-hidden
        />

        {/* Scanline entrance — fires once */}
        {heroInView && !hasScanned && (
          <div className="pointer-events-none absolute inset-0 z-[40] overflow-hidden" aria-hidden
            onAnimationEnd={() => setHasScanned(true)}>
            <div
              className="animate-scanline absolute left-0 h-[3px] w-full"
              style={{ background: "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.8) 50%, transparent 100%)" }}
            />
          </div>
        )}

        {/* Text column — figure is full-bleed behind */}
        <div className="relative z-10 mx-auto w-full max-w-7xl">
          <div className={cn("max-w-xl lg:max-w-2xl", direction === "rtl" ? "text-right ms-auto" : "text-left")}>
            {/* Eyebrow */}
            <div style={lineIn(100)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.08)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#22D3EE]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22D3EE]" />
                {liveStats.activeToday > 0 ? `${liveStats.activeToday} training now` : "AI-Powered Fitness"}
              </span>
            </div>

            {/* Headline with glitch-in */}
            <h1
              className="hero-headline mt-8 font-display text-[clamp(2.8rem,7vw,5.5rem)] font-extrabold leading-[0.88] tracking-[-0.04em]"
              style={reduce ? lineIn(200) : {
                ...lineIn(200),
                animation: heroEntered ? "glitchIn 0.7s ease-out forwards" : "none"
              }}
            >
              <span className="block text-white">Elevate Your</span>
              <span
                className="block bg-gradient-to-r from-[#22D3EE] via-[#67E8F9] to-[#A78BFA] bg-clip-text text-transparent"
                style={{ filter: "drop-shadow(0 0 30px rgba(34,211,238,0.25))" }}
              >
                Performance.
              </span>
            </h1>

            {/* Cyber line separator */}
            <div
              className="my-6 h-px bg-gradient-to-r from-[#22D3EE]/60 via-[#A78BFA]/40 to-transparent"
              style={{
                width: heroEntered ? "100%" : "0%",
                opacity: heroEntered ? 1 : 0,
                transition: reduce ? "none" : "width 600ms ease-out 800ms, opacity 600ms ease-out 800ms",
                maxWidth: "320px"
              }}
              aria-hidden
            />

            {/* Subtitle */}
            <p className="max-w-md text-lg leading-relaxed text-[#A1A1AA]" style={lineIn(350)}>
              {copy.hero.sub}
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4" style={lineIn(450)}>
              <MagneticLink
                href={`/${locale}/start`}
                onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "immersive-hero" })}
                className="group inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] px-9 py-4 text-base font-bold text-[#09090B] shadow-[0_0_30px_rgba(34,211,238,0.4),0_0_60px_rgba(34,211,238,0.15)] transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)]"
              >
                {copy.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </MagneticLink>
              <Link
                href={`/${locale}/ai`}
                className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full border border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.08)] px-9 py-4 text-base font-semibold text-[#A78BFA] transition-all duration-200 hover:border-[rgba(167,139,250,0.6)] hover:bg-[rgba(167,139,250,0.14)] hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
              >
                <Zap className="h-4 w-4" /> Preview TJAI
              </Link>
            </div>

            {/* Trust row */}
            <div className="mt-10 flex flex-wrap items-center gap-4 text-[11px] font-medium uppercase tracking-[0.15em] text-[#52525B]" style={lineIn(550)}>
              {["GPT-4o Powered", "25 Questions", "12-Week Plans", "5 Languages"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Star className="h-3 w-3 text-[#22D3EE]" strokeWidth={2} />{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className={cn("absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 transition-opacity duration-300", hideScrollCue ? "opacity-0" : "opacity-50")} aria-hidden>
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Scroll</span>
          <ChevronDown className="h-5 w-5 text-zinc-600 motion-safe:animate-bounce" strokeWidth={1.5} />
        </div>
      </section>

      {/* ══════════════ TICKER ══════════════ */}
      <div className="border-y border-[#1E2028] bg-[#09090B] py-4 overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)" }}>
        <ScrollTicker items={["TRANSFORM", "12 WEEKS", "FAT LOSS", "MUSCLE GAIN", "HOME GYM", "AI COACH", "DIET PLAN", "MACROS", "TJAI", "RESULTS"]} speed={35} className="text-[#1E2028] text-[11px] font-bold tracking-[0.3em]" />
      </div>

      {/* ══════════════ FEATURES BENTO ══════════════ */}
      <section className="px-6 py-24 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-16 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#22D3EE]">Everything You Need</p>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white lg:text-6xl">
              One Platform.<br />
              <span className="bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">Complete Transformation.</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <BentoCard {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section className="relative overflow-hidden border-y border-[#1E2028] bg-[#09090B] py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#22D3EE] opacity-[0.04] blur-[80px]" />
          <div className="absolute right-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#A78BFA] opacity-[0.04] blur-[80px]" />
        </div>
        <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-12 px-6 lg:grid-cols-4 lg:gap-16 lg:px-12">
          <CountUp target={programCount} suffix="+" label="Expert Programs" />
          <CountUp target={dietCount} suffix="+" label="Diet Systems" />
          <CountUp target={12} label="Weeks Per Plan" />
          <CountUp target={5} label="Languages" />
        </div>
      </section>

      {/* ══════════════ PROGRAMS — Parallax BG ══════════════ */}
      <div ref={programsSectionRef} className="relative overflow-hidden border-t border-[#1E2028]">
        {/* Parallax background — more visible + animated */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <Image
            src="/assets/hero/hero-programs-bg.png"
            alt=""
            fill
            className="object-cover object-center"
            style={{
              opacity: 0.2,
              transform: `translateY(${parallaxY}px) scale(1.1)`,
              transition: "transform 0.1s linear"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/80 via-transparent to-[#09090B]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/50 via-transparent to-[#09090B]/50" />
        </div>
        {/* Animated watermark text overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-hidden" aria-hidden>
          <p
            className="animate-float-slow select-none whitespace-nowrap font-display text-[7vw] font-black uppercase tracking-[0.25em] text-white"
            style={{ opacity: 0.03 }}
          >
            ENDLESS · ORGANIZED · DATA
          </p>
        </div>

        <section className="relative px-6 py-24 lg:px-12 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Reveal>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#22D3EE]">Programs</p>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
                  {programCount}+ Complete<br /><span className="text-[#22D3EE]">Programs.</span>
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <Link href={`/${locale}/programs`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#22D3EE] transition-opacity hover:opacity-80">
                  View all programs <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>
            <div className="mb-6 overflow-hidden">
              <ScrollTicker items={["FAT LOSS", "MUSCLE GAIN", "HOME TRAINING", "GYM", "12 WEEKS", "PROGRESSIVE", "COACH-BUILT"]} speed={40} className="opacity-30" />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {programSlice.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80}>
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══════════════ TJAI — KINETIC HEART CORE ══════════════ */}
      <section ref={(el) => { tjaiRef.current = el; }} className="relative overflow-hidden border-t border-[#1E2028]" style={{ minHeight: "min(90vh, 700px)" }}>

        {/* Full-section background — heart / core art (slow drift + blend into page) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <div
            className={cn(
              "absolute inset-0",
              tjaiInView && !reduce && "animate-tjai-core-drift"
            )}
          >
            <Image
              src="/assets/hero/hero-tjai-core.png"
              alt=""
              fill
              className="object-cover object-center mix-blend-soft-light"
              style={{
                opacity: tjaiInView ? 0.52 : 0,
                transition: "opacity 1.2s ease-out",
                filter: "saturate(1.08) contrast(1.05) drop-shadow(0 0 50px rgba(34,211,238,0.35))",
                transitionProperty: "opacity"
              }}
            />
          </div>
          {/* Dark overlay so text stays readable — feathered so art blends, not boxed */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/88 to-[#09090B]/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090B]/45 via-transparent to-[#09090B]/55" />
          <div
            className="absolute inset-0 opacity-70 mix-blend-overlay"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 70% 45%, rgba(34,211,238,0.07) 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 20% 30%, rgba(167,139,250,0.05) 0%, transparent 50%)"
            }}
          />
        </div>

        <HeroTjaiBrainDeco reduce={reduce} active={tjaiInView} />

        {/* Content — left-aligned over the image */}
        <div className="relative z-10 mx-auto flex max-w-6xl items-center px-6 py-24 lg:px-12 lg:py-32" style={{ minHeight: "inherit" }}>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#22D3EE]">
              <Brain className="h-3.5 w-3.5" /> TJAI · AI Coaching Engine
            </span>
            <h2 className="mt-6 font-display text-5xl font-extrabold tracking-tight text-white lg:text-7xl">
              Intelligence.<br />Kinetic.<br />
              <span className="bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">Core.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#A1A1AA]">
              Answer 25 smart questions. TJAI analyzes your metabolism, lifestyle, injuries, and goals — then generates a complete 12-week plan powered by GPT-4o.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Full 12-week training program — personalized to your level",
                "Daily meal plan with macros, recipes, and grocery list",
                "Supplement stack, calorie cycling, refeed & deload weeks"
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#A1A1AA]">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(34,211,238,0.15)] text-[#22D3EE]">
                    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={`/${locale}/ai`}
              className="mt-10 inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] px-9 py-3 text-base font-bold text-[#09090B] shadow-[0_0_30px_rgba(34,211,238,0.4),0_0_60px_rgba(34,211,238,0.15)] transition-all hover:scale-[1.04] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)]"
            >
              <Zap className="h-4 w-4" /> TJAI — Free quiz, paid plan
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ DIETS ══════════════ */}
      {dietSlice.length > 0 && (
        <section className="border-t border-[#1E2028] bg-[#09090B] px-6 py-24 lg:px-12 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Reveal>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A78BFA]">Nutrition</p>
                <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-white lg:text-5xl">
                  {dietCount}+ Diet<br /><span className="text-[#A78BFA]">Systems.</span>
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <Link href={`/${locale}/diets`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#A78BFA] transition-opacity hover:opacity-80">
                  View all diets <ArrowRight className="h-4 w-4" />
                </Link>
              </Reveal>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dietSlice.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80}>
                  <HomeProgramPreviewCard
                    program={p}
                    href={`/${locale}/programs/${p.slug}`}
                    priceFormatted={formatMoney(locale, p.price)}
                    fromLabel={copy.programs.from}
                    reducedMotion={reduce}
                    ctaLabel={programUi.viewProgram}
                    onNavigate={() => trackMarketingEvent("program_view", { slug: p.slug, surface: "immersive-diets" })}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <HomeTestimonials locale={locale} />

      {/* ══════════════ COACH CTA ══════════════ */}
      <HomeCoachCta locale={locale} />

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <HomeNewsletterBar locale={locale} />

      {/* ══════════════ FINAL CTA — NEXUS BG ══════════════ */}
      <section
        ref={(el) => { nexusRef.current = el; }}
        className="relative overflow-hidden border-t border-[#1E2028] px-6 py-32 text-center lg:px-12 lg:py-44"
      >
        {/* Nexus background — blended into #09090B + slow drift (matches TJAI / hero language) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#09090B]" aria-hidden>
          <div className={cn("absolute inset-0", nexusInView && !reduce && "animate-nexus-bg-drift")}>
            <Image
              src="/assets/hero/hero-nexus.png"
              alt=""
              fill
              className="object-cover object-center mix-blend-soft-light"
              style={{
                opacity: nexusInView ? 0.44 : 0,
                transition: "opacity 1.4s ease-out",
                filter:
                  "saturate(1.06) contrast(1.05) brightness(0.92) drop-shadow(0 0 48px rgba(34,211,238,0.18))"
              }}
            />
          </div>
          {/* Wash art into site chrome — no flat gray box */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#09090B] via-[#09090B]/78 to-[#09090B]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/95 via-transparent to-[#09090B]/95" />
          <div
            className="absolute inset-0 opacity-80 mix-blend-overlay"
            style={{
              background:
                "radial-gradient(ellipse 85% 65% at 50% 42%, rgba(34,211,238,0.09) 0%, transparent 58%), radial-gradient(ellipse 55% 50% at 15% 70%, rgba(167,139,250,0.06) 0%, transparent 50%), radial-gradient(ellipse 50% 45% at 88% 65%, rgba(34,211,238,0.05) 0%, transparent 48%)"
            }}
          />
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#09090B] via-[#09090B]/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#09090B] via-[#09090B]/40 to-transparent" />
        </div>

        {/* Animated SVG node network — screen-blended + breath motion */}
        {nexusInView && (
          <svg
            className={cn(
              "pointer-events-none absolute inset-0 z-[1] h-full w-full mix-blend-screen",
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
        )}

        {/* CTA content */}
        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#22D3EE]">Join the Nexus</p>
            <h2 className="mt-5 font-display text-5xl font-extrabold tracking-tight text-white lg:text-7xl">
              Ready to<br />
              <span
                className="bg-gradient-to-r from-[#22D3EE] via-[#67E8F9] to-[#A78BFA] bg-clip-text text-transparent"
                style={{ filter: "drop-shadow(0 0 40px rgba(34,211,238,0.4))" }}
              >
                Transform?
              </span>
            </h2>
            <p className="mt-6 text-lg text-[#A1A1AA]">{copy.midCta?.sub ?? "Join thousands already training smarter with TJFit."}</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={`/${locale}/signup`}
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#0EA5E9] px-10 py-4 text-base font-bold text-[#09090B] shadow-[0_0_40px_rgba(34,211,238,0.5),0_0_80px_rgba(34,211,238,0.2)] transition-all hover:scale-[1.04] hover:shadow-[0_0_60px_rgba(34,211,238,0.7)]"
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
          </Reveal>
        </div>
      </section>
    </div>
  );
}
