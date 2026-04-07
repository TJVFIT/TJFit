"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

import { BlurReveal } from "@/components/blur-reveal";
import { FreeOfferSection } from "@/components/free-offer-section";
import { ParticleField } from "@/components/particle-field";
import { HomeProgramPreviewCard } from "@/components/program-card";
import { SplitText } from "@/components/ui/split-text";
import { ScrollTicker } from "@/components/ui/ScrollTicker";
import { WordReveal } from "@/components/ui/word-reveal";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { useInView } from "@/hooks/useInView";
import type { Program } from "@/lib/content";
import { trackMarketingEvent } from "@/lib/analytics-events";
import type { HomeLuxuryCopy } from "@/lib/home-luxury-copy";
import { getNavChromeCopy } from "@/lib/launch-copy";
import { getProgramUiCopy } from "@/lib/program-localization";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import type { HomeCoachPreview, HomeProgramPreview } from "@/components/luxury/luxury-home";

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

function formatMoney(locale: Locale, value: number) {
  const n = Number.isFinite(value) ? value : 0;
  const loc =
    locale === "tr"
      ? "tr-TR"
      : locale === "ar"
        ? "ar-SA"
        : locale === "es"
          ? "es-ES"
          : locale === "fr"
            ? "fr-FR"
            : "en-US";
  try {
    return new Intl.NumberFormat(loc, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}

function CountCell({
  target,
  suffix,
  label,
  subtitle,
  reduce
}: {
  target: number;
  suffix: string;
  label: string;
  subtitle: string;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.2, once: true });
  const [val, setVal] = useState(() => (reduce ? target : 0));

  useEffect(() => {
    if (reduce) {
      setVal(target);
      return;
    }
    if (!inView) return;
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) * (1 - t);
      setVal(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, target]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-mono text-4xl font-extrabold tabular-nums text-[#22D3EE] sm:text-5xl lg:text-6xl">
        {val}
        {suffix}
      </p>
      <p className="mt-3 text-base uppercase tracking-[0.2em] text-[#52525B]">{label}</p>
      <p className="mt-1 text-[11px] text-[#52525B]">{subtitle}</p>
    </div>
  );
}

function MagneticHeroLink({
  href,
  className,
  children,
  onClick
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

function HeroSilhouette({ entered, reduce }: { entered: boolean; reduce: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        "transition-[opacity,transform] duration-[1200ms] [transition-timing-function:cubic-bezier(0,0,0.2,1)]",
        entered ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-95"
      )}
      style={{ transitionDelay: reduce ? "0ms" : "800ms" }}
      aria-hidden
    >
      <svg
        viewBox="0 0 520 820"
        className={cn(
          "absolute bottom-0 right-[-5%] h-[95%] w-auto will-change-transform",
          "opacity-[0.15] max-md:opacity-[0.08] max-md:right-auto max-md:left-1/2 max-md:-translate-x-1/2 max-md:scale-[0.7] max-md:opacity-[0.06]",
          "motion-reduce:opacity-[0.1]"
        )}
        style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.6)) drop-shadow(0 0 20px rgba(34,211,238,0.3))" }}
      >
        <g className={cn("origin-bottom motion-safe:animate-[tj-hero-breathe_3s_ease-in-out_infinite]", reduce && "animate-none")}>
          <circle cx="260" cy="86" r="30" fill="none" stroke="#22D3EE" strokeWidth="2" />
          <path d="M260 116 L260 146" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M198 166 Q260 136 322 166 L306 332 Q260 366 214 332 Z" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M214 182 L170 286 L178 366" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M322 182 L352 240" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <g
            className={cn("origin-[352px_240px] [transform-box:fill-box] motion-safe:animate-[tj-curl-rep_2.4s_ease-in-out_infinite]", reduce && "animate-none")}
          >
            <path d="M352 240 L390 204 L420 196" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
            <path d="M420 196 L450 196" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
            <circle cx="416" cy="196" r="12" fill="none" stroke="#22D3EE" strokeWidth="2" />
            <circle cx="454" cy="196" r="12" fill="none" stroke="#22D3EE" strokeWidth="2" />
          </g>
          <path d="M236 366 L210 520 L222 702" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M286 366 L320 520 L308 702" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M220 702 L190 746" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
          <path d="M306 702 L336 746" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

function FloatingHeroStats({
  entered,
  reduce,
  activeUsers
}: {
  entered: boolean;
  reduce: boolean;
  activeUsers: number;
}) {
  const cards = [
    { a: "20+", b: "Expert Programs", c: "", pos: "left-[5%] top-[35%]" },
    { a: `${activeUsers || 0} Online`, b: "Members Training Now", c: "", pos: "right-[5%] top-[25%]" },
    { a: "5", b: "Languages", c: "", pos: "right-[8%] top-[55%]" }
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-0 max-md:hidden">
      {cards.map((card, i) => (
        <div
          key={`${card.a}-${card.b}`}
          className={cn(
            "tj-float-stat absolute w-[210px] rounded-2xl border border-[rgba(34,211,238,0.2)] bg-[rgba(17,18,21,0.85)] px-5 py-4 backdrop-blur-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] will-change-transform",
            card.pos,
            entered ? "opacity-100" : "opacity-0"
          )}
          style={{
            transition: "opacity 600ms ease",
            transitionDelay: entered && !reduce ? `${1200 + i * 150}ms` : "0ms",
            animation: reduce
              ? "none"
              : `tj-float-up ${[4, 5, 3.5][i]}s ease-in-out infinite ${[0, 1, 2][i]}s`
          }}
          aria-hidden
        >
          <p className="text-[32px] font-bold text-[#22D3EE]">{card.a}</p>
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#A1A1AA]">{card.b}</p>
          {card.c ? <p className="text-[10px] text-[#52525B]">{card.c}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function ImmersiveHome({
  locale,
  copy,
  programs,
  diets,
  coaches: _coaches,
  freePrograms,
  programCount,
  dietCount
}: {
  locale: Locale;
  copy: HomeLuxuryCopy;
  programs: HomeProgramPreview[];
  diets: HomeProgramPreview[];
  coaches: HomeCoachPreview[];
  freePrograms: Program[];
  programCount: number;
  dietCount: number;
}) {
  void _coaches;
  const reduce = useReducedMotion();
  const programUi = getProgramUiCopy(locale);
  const navChrome = getNavChromeCopy(locale);
  const [heroEntered, setHeroEntered] = useState(reduce);
  const [hideScrollCue, setHideScrollCue] = useState(false);
  const [liveStats, setLiveStats] = useState({ activeToday: 0, programsStartedToday: 0 });
  const [livePulse, setLivePulse] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);
  const logo3DRef = useRef<HTMLDivElement>(null);
  const particleRef = useRef<HTMLDivElement>(null);
  const silhouetteRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) {
      setHeroEntered(true);
      return;
    }
    const t = window.setTimeout(() => setHeroEntered(true), 50);
    return () => clearTimeout(t);
  }, [reduce]);

  useEffect(() => {
    const onScroll = () => setHideScrollCue(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadLive = async () => {
      try {
        const res = await fetch("/api/stats/live", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setLiveStats((prev) => {
          if (prev.activeToday !== data.activeToday || prev.programsStartedToday !== data.programsStartedToday) {
            setLivePulse(true);
            window.setTimeout(() => setLivePulse(false), 220);
          }
          return {
            activeToday: Number(data.activeToday ?? 0),
            programsStartedToday: Number(data.programsStartedToday ?? 0)
          };
        });
      } catch {
        // silent fail for hero microstat
      }
    };
    void loadLive();
    const id = window.setInterval(loadLive, 300000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const noHover = window.matchMedia("(hover: none)").matches;
    if (reduced || noHover) return;

    let raf = 0;
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const apply = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;

      if (ambientRef.current) ambientRef.current.style.transform = `translate(${current.x * 0.02}px, ${current.y * 0.02}px)`;
      if (logo3DRef.current) logo3DRef.current.style.transform = `translate(${current.x * 0.04}px, ${current.y * 0.04}px)`;
      if (particleRef.current) particleRef.current.style.transform = `translate(${current.x * 0.01}px, ${current.y * 0.01}px)`;
      if (silhouetteRef.current) silhouetteRef.current.style.transform = `translate(${current.x * 0.06}px, ${current.y * 0.06}px)`;
      if (statsRef.current) statsRef.current.style.transform = `translate(${current.x * 0.08}px, ${current.y * 0.08}px)`;
      if (headlineRef.current) headlineRef.current.style.transform = `translate(${current.x * 0.015}px, ${current.y * 0.015}px)`;
      if (subCtaRef.current) subCtaRef.current.style.transform = `translate(${current.x * 0.01}px, ${current.y * 0.01}px)`;

      raf = window.requestAnimationFrame(apply);
    };

    const onMove = (event: MouseEvent) => {
      target.x = event.clientX - window.innerWidth / 2;
      target.y = event.clientY - window.innerHeight / 2;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = window.requestAnimationFrame(apply);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  const h1 = copy.hero.headline.trim();
  const line1 = h1.split(/\s+/)[0] ?? "Train";
  const line2 = h1.slice(line1.length).trim() || "Smarter.";
  const line3Accent = copy.hero.headlineLine2Accent ?? "Transform";
  const line3Rest = copy.hero.headlineLine2Rest ?? ".";

  const featureItems = copy.features.items.slice(0, 3);
  const programSlice = useMemo(() => programs.slice(0, 4), [programs]);
  const dietSlice = useMemo(() => diets.slice(0, 4), [diets]);

  const tickerPrograms = [
    "FAT LOSS",
    "MUSCLE GAIN",
    "HOME",
    "GYM",
    "12 WEEKS",
    "STRUCTURED",
    "PROGRESSION",
    "COACH-BUILT"
  ];
  const tickerDiets = [
    "CUTTING",
    "BULKING",
    "MACROS",
    "RECIPES",
    "MEAL PLANS",
    "ADJUSTMENTS",
    "STRUCTURED"
  ];

  const lineMotion = (delayMs: number, y = 40) =>
    ({
      opacity: heroEntered ? 1 : 0,
      transform: heroEntered ? "translateY(0)" : `translateY(${y}px)`,
      transitionProperty: "opacity, transform",
      transitionDuration: reduce ? "0ms" : "700ms",
      transitionTimingFunction: "cubic-bezier(0,0,0.2,1)",
      transitionDelay: reduce ? "0ms" : `${delayMs}ms`
    }) as CSSProperties;

  return (
    <div className="bg-[#09090B] text-white">
      {/* —— 1 HERO —— */}
      <section
        ref={heroRef}
        className="hero-mesh relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-16 pt-24 lg:px-12 lg:pb-24 lg:pt-16"
      >
        <div ref={particleRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <ParticleField className="pointer-events-none absolute inset-0 z-0" />
        </div>
        <div ref={ambientRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="orb-3d orb-3d-cyan absolute -left-20 -top-20 h-[500px] w-[500px] max-md:h-[280px] max-md:w-[280px]" />
          <div className="orb-3d orb-3d-blue absolute -bottom-24 -right-10 h-[400px] w-[400px] max-md:h-[220px] max-md:w-[220px]" />
          <div className="orb-3d orb-3d-deep absolute right-[22%] top-[20%] h-[300px] w-[300px] max-md:hidden" />
        </div>
        <div
          ref={logo3DRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06] max-md:h-[240px] max-md:w-[240px] max-md:opacity-[0.04]"
          aria-hidden
        >
          <Image src="/logo/tj-icon.svg" alt="" fill className="tj-logo-3d object-contain" />
        </div>
        <div ref={silhouetteRef}>
          <HeroSilhouette entered={heroEntered} reduce={reduce} />
        </div>
        <div ref={statsRef}>
          <FloatingHeroStats entered={heroEntered} reduce={reduce} activeUsers={liveStats.activeToday} />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center lg:text-left">
          <p
            className={cn(
              "text-[11px] font-medium uppercase tracking-[0.15em] text-[#22D3EE] transition-opacity duration-500 motion-reduce:transition-none",
              heroEntered ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDelay: reduce ? "0ms" : "200ms" }}
          >
            {copy.hero.eyebrow ?? copy.hero.badge}
          </p>

          <h1 ref={headlineRef} className="mt-8 font-sans text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] lg:text-[96px]">
            <span className="block" style={lineMotion(300)}>
              <SplitText text={line1} delay={300} />
            </span>
            <span className="block" style={lineMotion(450)}>
              <SplitText text={line2} delay={450} />
            </span>
            <span className="block" style={lineMotion(600)}>
              <span className="bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">{line3Accent}</span>
              <span className="text-white">{line3Rest}</span>
            </span>
          </h1>

          <div ref={subCtaRef}>
            <p
              className={cn(
                "mx-auto mt-8 max-w-[480px] text-base leading-relaxed text-[#A1A1AA] transition-opacity duration-500 ease-out motion-reduce:transition-none sm:text-lg lg:mx-0",
                heroEntered ? "opacity-100" : "opacity-0"
              )}
              style={{ transitionDelay: reduce ? "0ms" : "800ms" }}
            >
              {copy.hero.sub}
            </p>

            <div
              className={cn(
                "mt-10 flex flex-col gap-4 sm:flex-row sm:items-center",
                "transition-opacity duration-500 motion-reduce:transition-none",
                heroEntered ? "opacity-100" : "opacity-0"
              )}
              style={{ transitionDelay: reduce ? "0ms" : "1000ms" }}
            >
              <MagneticHeroLink
                href={`/${locale}/start`}
                onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "immersive-hero" })}
                className="btn-primary-shimmer inline-flex min-h-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] px-8 py-4 text-base font-bold text-[#09090B] shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-[transform,box-shadow] duration-200 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(34,211,238,0.45)] motion-reduce:hover:scale-100"
              >
                {copy.hero.ctaPrimary}
              </MagneticHeroLink>
              <Link
                href={`/${locale}/programs`}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#1E2028] px-8 py-4 text-base font-semibold text-white transition-[border-color,background-color] duration-200 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.04)]"
              >
                {copy.hero.ctaSecondary} <span className="rtl:rotate-180">→</span>
              </Link>
            </div>
            <div className="mt-5 inline-flex flex-wrap gap-2 text-xs text-[#A1A1AA]">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-[rgba(34,211,238,0.15)] bg-[rgba(34,211,238,0.06)] px-3 py-1.5",
                  livePulse && "scale-[1.04]"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] motion-safe:animate-pulse" />
                {liveStats.activeToday} people training on TJFit right now
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-[rgba(34,211,238,0.15)] bg-[rgba(34,211,238,0.06)] px-3 py-1.5",
                  livePulse && "scale-[1.04]"
                )}
              >
                {liveStats.programsStartedToday} programs started today
              </span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 transition-opacity duration-300",
            hideScrollCue ? "opacity-0" : "opacity-40"
          )}
          aria-hidden
        >
          <ChevronDown className="h-6 w-6 motion-safe:animate-bounce" strokeWidth={1.5} />
        </div>

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-b from-transparent to-[#09090B]"
          aria-hidden
        />
      </section>

      {/* —— 2 WHAT YOU GET —— */}
      <section className="relative min-h-[100svh] border-t border-[#1E2028] bg-[#09090B] px-6 py-16 lg:px-12 lg:py-24">
        <div className="absolute start-8 top-32 bottom-32 hidden w-px bg-gradient-to-b from-[#22D3EE]/40 via-[#22D3EE]/20 to-transparent lg:block" aria-hidden />
        <div className="relative mx-auto max-w-4xl space-y-24 lg:ps-12">
          {featureItems.map((item, i) => (
            <FeatureBlock key={item.title} index={i} title={item.title} body={item.desc} reduce={reduce} />
          ))}
        </div>
        <div className="tj-gradient-divider mx-auto mt-20 max-w-6xl opacity-80" aria-hidden />
      </section>

      {/* —— 3 FREE STARTERS —— */}
      {freePrograms.length > 0 ? (
        <section className="relative min-h-[100svh] bg-[#09090B] py-8">
          <FreeOfferSection locale={locale} freePrograms={freePrograms} sectionClassName="min-h-[100svh] flex flex-col justify-center border-b-0 py-16 lg:py-24" />
        </section>
      ) : null}

      {/* —— 4 PROGRAMS —— */}
      <section className="relative min-h-[100svh] border-t border-[var(--color-border)] bg-[#111215] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <BlurReveal>
            <div>
            <h2 className="text-[56px] font-extrabold leading-[0.95] tracking-[-0.04em] text-white lg:text-[80px]">
              <span className="block">{programCount}+</span>
              <span className="block">
                <WordReveal text="Complete" />
              </span>
              <span className="block bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">Programs.</span>
            </h2>
            <div className="mt-8 max-w-xl overflow-hidden">
              <ScrollTicker items={tickerPrograms} speed={40} className="opacity-80" />
            </div>
            <Link
              href={`/${locale}/programs`}
              className="mt-8 inline-flex text-sm font-semibold text-[#22D3EE] transition-opacity hover:opacity-80"
            >
              {copy.programs.viewAll} <span className="rtl:rotate-180">→</span>
            </Link>
            </div>
          </BlurReveal>
          <div className="grid max-h-[min(70vh,640px)] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
            {programSlice.map((p, i) => (
              <BlurReveal key={p.slug} delay={i * 90}>
                <HomeProgramPreviewCard
                  program={p}
                  href={`/${locale}/programs/${p.slug}`}
                  priceFormatted={formatMoney(locale, p.price)}
                  fromLabel={copy.programs.from}
                  reducedMotion={reduce}
                  ctaLabel={p.is_free ? programUi.viewProgram : programUi.getFullAccess}
                  onNavigate={() => trackMarketingEvent("program_view", { slug: p.slug, surface: "immersive-home" })}
                />
              </BlurReveal>
            ))}
          </div>
        </div>
        <div className="tj-gradient-divider mx-auto mt-16 max-w-6xl opacity-80" aria-hidden />
      </section>

      {/* —— 5 DIETS —— */}
      {diets.length > 0 ? (
        <section className="relative min-h-[100svh] bg-[#09090B] px-6 py-16 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <div className="order-2 lg:order-1">
              <div className="grid max-h-[min(70vh,640px)] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
                {dietSlice.map((p) => (
                  <HomeProgramPreviewCard
                    key={p.slug}
                    program={p}
                    href={`/${locale}/programs/${p.slug}`}
                    priceFormatted={formatMoney(locale, p.price)}
                    fromLabel={copy.programs.from}
                    reducedMotion={reduce}
                    ctaLabel={programUi.viewProgram}
                    onNavigate={() => trackMarketingEvent("program_view", { slug: p.slug, surface: "immersive-diets" })}
                  />
                ))}
              </div>
            </div>
            <BlurReveal className="order-1 lg:order-2">
              <h2 className="text-[56px] font-extrabold leading-[0.95] tracking-[-0.04em] text-white lg:text-[80px]">
                <span className="block">{dietCount}+</span>
                <span className="block">
                  <WordReveal text="Diet" />
                </span>
                <span className="block bg-gradient-to-br from-[#A78BFA] to-[#22D3EE] bg-clip-text text-transparent">Systems.</span>
              </h2>
              <div className="mt-8 max-w-xl overflow-hidden">
                <ScrollTicker items={tickerDiets} speed={45} direction="right" className="opacity-80" />
              </div>
              <Link
                href={`/${locale}/diets`}
                className="mt-8 inline-flex text-sm font-semibold text-[#A78BFA] transition-opacity hover:opacity-80"
              >
                {copy.dietsTeaser?.cta ?? programUi.viewProgram} <span className="rtl:rotate-180">→</span>
              </Link>
            </BlurReveal>
          </div>
          <div className="tj-gradient-divider mx-auto mt-16 max-w-6xl opacity-80" aria-hidden />
        </section>
      ) : null}

      {/* —— 6 STATS —— */}
      <section className="relative flex min-h-[100svh] flex-col justify-center bg-[#09090B] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-12 lg:gap-16">
          <CountCell target={programCount} suffix="+" label="Programs" subtitle="Home & gym training" reduce={reduce} />
          <CountCell target={dietCount} suffix="+" label="Diet Systems" subtitle="Cutting & bulking" reduce={reduce} />
          <CountCell target={12} suffix="" label="Weeks Per Program" subtitle="Structured progression" reduce={reduce} />
          <CountCell target={5} suffix="" label="Languages" subtitle="Global platform" reduce={reduce} />
        </div>
        <div className="tj-gradient-divider mx-auto mt-20 max-w-6xl opacity-80" aria-hidden />
      </section>

      {/* —— 7 FINAL CTA —— */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-[#09090B] px-6 py-16 text-center lg:px-12 lg:py-24">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.06)_0%,transparent_55%)]"
          aria-hidden
        />
        <h2 className="relative text-[48px] font-extrabold leading-[0.95] tracking-[-0.04em] lg:text-[88px]">
          <span className="text-white">Ready to </span>
          <span className="bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">
            <WordReveal text="Transform?" />
          </span>
        </h2>
        <p className="relative mt-6 max-w-md text-lg text-[#A1A1AA]">{copy.midCta.sub}</p>
        <MagneticHeroLink
          href={`/${locale}/signup`}
          className="relative mt-10 inline-flex min-h-[56px] items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] px-10 py-4 text-base font-bold text-[#09090B] shadow-[0_0_28px_rgba(34,211,238,0.25)] transition-transform duration-200 hover:scale-[1.03] motion-reduce:hover:scale-100"
        >
          {navChrome.joinLabel}
        </MagneticHeroLink>
        <p className="relative mt-8 text-[13px] text-[#52525B]">{copy.hero.trustLine}</p>
      </section>
    </div>
  );
}

function FeatureBlock({
  index,
  title,
  body,
  reduce
}: {
  index: number;
  title: string;
  body: string;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.15, once: true });
  const fromLeft = index % 2 === 0;
  const show = inView || reduce;
  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        show ? "translate-x-0 opacity-100" : fromLeft ? "-translate-x-10 opacity-0" : "translate-x-10 opacity-0"
      )}
      style={{ transitionDelay: reduce ? "0ms" : `${index * 150}ms` }}
    >
      <p
        className={cn(
          "font-sans text-[100px] font-extrabold leading-none sm:text-[120px]",
          index === 0 && "text-[rgba(34,211,238,0.12)]",
          index === 1 && "text-[rgba(167,139,250,0.12)]",
          index === 2 && "text-[rgba(34,211,238,0.1)]"
        )}
      >
        0{index + 1}
      </p>
      <h3 className="mt-4 text-3xl font-bold tracking-tight text-white lg:text-4xl">{title}</h3>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#A1A1AA]">{body}</p>
    </div>
  );
}
