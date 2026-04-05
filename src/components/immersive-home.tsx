"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { FreeOfferSection } from "@/components/free-offer-section";
import { HomeProgramPreviewCard } from "@/components/program-card";
import { ScrollTicker } from "@/components/ui/ScrollTicker";
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
  reduce
}: {
  target: number;
  suffix: string;
  label: string;
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
      <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-16 pt-24 lg:px-12 lg:pb-24 lg:pt-16">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.07)_0%,transparent_70%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-24 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.05)_0%,transparent_70%)]"
          aria-hidden
        />

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

          <h1 className="mt-8 font-sans text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em] lg:text-[96px]">
            <span className="block" style={lineMotion(300)}>
              {line1}
            </span>
            <span className="block" style={lineMotion(450)}>
              {line2}
            </span>
            <span className="block" style={lineMotion(600)}>
              <span className="bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">{line3Accent}</span>
              <span className="text-white">{line3Rest}</span>
            </span>
          </h1>

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
            <Link
              href={`/${locale}/start`}
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "immersive-hero" })}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] px-8 py-4 text-base font-bold text-[#09090B] shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-[transform,box-shadow] duration-200 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(34,211,238,0.45)] motion-reduce:hover:scale-100"
            >
              {copy.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${locale}/programs`}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#1E2028] px-8 py-4 text-base font-semibold text-white transition-[border-color,background-color] duration-200 hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.04)]"
            >
              {copy.hero.ctaSecondary} <span className="rtl:rotate-180">→</span>
            </Link>
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
          <div>
            <h2 className="text-[56px] font-extrabold leading-[0.95] tracking-[-0.04em] text-white lg:text-[80px]">
              <span className="block">{programCount}+</span>
              <span className="block">Complete</span>
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
          <div className="grid max-h-[min(70vh,640px)] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
            {programSlice.map((p) => (
              <HomeProgramPreviewCard
                key={p.slug}
                program={p}
                href={`/${locale}/programs/${p.slug}`}
                priceFormatted={formatMoney(locale, p.price)}
                fromLabel={copy.programs.from}
                reducedMotion={reduce}
                ctaLabel={p.is_free ? programUi.viewProgram : programUi.getFullAccess}
                onNavigate={() => trackMarketingEvent("program_view", { slug: p.slug, surface: "immersive-home" })}
              />
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
            <div className="order-1 lg:order-2">
              <h2 className="text-[56px] font-extrabold leading-[0.95] tracking-[-0.04em] text-white lg:text-[80px]">
                <span className="block">{dietCount}+</span>
                <span className="block">Diet</span>
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
            </div>
          </div>
          <div className="tj-gradient-divider mx-auto mt-16 max-w-6xl opacity-80" aria-hidden />
        </section>
      ) : null}

      {/* —— 6 STATS —— */}
      <section className="relative flex min-h-[100svh] flex-col justify-center bg-[#09090B] px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-12 lg:gap-16">
          <CountCell target={Math.min(programCount, 99)} suffix="+" label="Complete Programs" reduce={reduce} />
          <CountCell target={Math.min(dietCount, 99)} suffix="+" label="Diet Systems" reduce={reduce} />
          <CountCell target={12} suffix="" label="Weeks Per Program" reduce={reduce} />
          <CountCell target={100} suffix="%" label="Coach-Structured" reduce={reduce} />
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
          <span className="bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">Transform?</span>
        </h2>
        <p className="relative mt-6 max-w-md text-lg text-[#A1A1AA]">{copy.midCta.sub}</p>
        <Link
          href={`/${locale}/signup`}
          className="relative mt-10 inline-flex min-h-[56px] items-center justify-center rounded-full bg-gradient-to-br from-[#22D3EE] to-[#0EA5E9] px-10 py-4 text-base font-bold text-[#09090B] shadow-[0_0_28px_rgba(34,211,238,0.25)] transition-transform duration-200 hover:scale-[1.03] motion-reduce:hover:scale-100"
        >
          {navChrome.joinLabel}
        </Link>
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
