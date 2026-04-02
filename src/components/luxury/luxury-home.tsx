"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bot, Dumbbell, Sparkles, Users } from "lucide-react";
import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { GlowButton } from "@/components/luxury/glow-button";
import { LuxuryHero3DExperience } from "@/components/luxury/luxury-hero-3d";
import { HomeProgramPreviewCard } from "@/components/program-card";
import { Logo } from "@/components/ui/Logo";
import { HomeLeadNudge } from "@/components/marketing/home-lead-nudge";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { PricingPreviewHome } from "@/components/marketing/pricing-preview-home";
import { trackMarketingEvent } from "@/lib/analytics-events";
import type { HomeLuxuryCopy } from "@/lib/home-luxury-copy";
import type { Locale } from "@/lib/i18n";
import { subscribeToMediaQueryChange } from "@/lib/media-query-list";

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useLayoutEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const apply = () => setReduce(mq.matches);
      apply();
      return subscribeToMediaQueryChange(mq, apply);
    } catch {
      return;
    }
  }, []);
  return reduce;
}

function useNarrowViewport() {
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    try {
      const mq = window.matchMedia("(max-width: 1023px)");
      const apply = () => setNarrow(mq.matches);
      apply();
      return subscribeToMediaQueryChange(mq, apply);
    } catch {
      return;
    }
  }, []);
  return narrow;
}

const HomeBlogsPreview = dynamic(
  () => import("@/components/home-blogs-preview").then((m) => m.HomeBlogsPreview),
  {
    loading: () => (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="h-48 animate-pulse rounded-xl bg-white/[0.03] ring-1 ring-white/[0.05]" />
      </div>
    )
  }
);

export type HomeProgramPreview = {
  slug: string;
  title: string;
  category: string;
  duration: string;
  price: number;
};

export type HomeCoachPreview = {
  slug: string;
  name: string;
  specialty: string;
  rating: number;
};

const featureIcons = [Sparkles, Dumbbell, Users, Bot] as const;

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
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
}

function Reveal({
  children,
  className,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = usePrefersReducedMotion();
  const narrow = useNarrowViewport();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    try {
      const io = new IntersectionObserver(
        (entries) => {
          const e = entries[0];
          if (e?.isIntersecting) setVisible(true);
        },
        { root: null, rootMargin: "-12% 0px -8% 0px", threshold: 0.08 }
      );
      io.observe(el);
      return () => io.disconnect();
    } catch {
      setVisible(true);
    }
  }, [reduce]);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const lightMotion = narrow;
  const lift = lightMotion ? 0 : 14;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: lightMotion ? "none" : visible ? "translateY(0)" : `translateY(${lift}px)`,
        transitionProperty: lightMotion ? "opacity" : "opacity, transform",
        transitionDuration: lightMotion ? "0.24s" : "0.58s",
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)"
      }}
    >
      {children}
    </div>
  );
}

export function LuxuryHome({
  locale,
  copy,
  programs,
  coaches
}: {
  locale: Locale;
  copy: HomeLuxuryCopy;
  programs: HomeProgramPreview[];
  coaches: HomeCoachPreview[];
}) {
  const reduce = usePrefersReducedMotion();

  const programCardCta =
    locale === "tr"
      ? "İncele"
      : locale === "ar"
        ? "تفاصيل"
        : locale === "es"
          ? "Ver"
          : locale === "fr"
            ? "Voir"
            : "Open";

  const tierHome =
    locale === "tr"
      ? { elite: "Elite", popular: "Popüler", fresh: "Yeni", signature: "Özel" }
      : locale === "ar"
        ? { elite: "نخبة", popular: "الأكثر طلباً", fresh: "جديد", signature: "مميز" }
        : locale === "es"
          ? { elite: "Elite", popular: "Popular", fresh: "Nuevo", signature: "Signature" }
          : locale === "fr"
            ? { elite: "Élite", popular: "Populaire", fresh: "Nouveau", signature: "Signature" }
            : { elite: "Elite", popular: "Popular", fresh: "New", signature: "Signature" };

  const heroRef = useRef<HTMLElement>(null);
  const heroMouseRef = useRef({ x: 0, y: 0 });
  const [allowHero3d, setAllowHero3d] = useState(false);
  const [stickyCta, setStickyCta] = useState(false);

  useEffect(() => {
    if (reduce) {
      setAllowHero3d(false);
      return;
    }
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setAllowHero3d(mq.matches);
    apply();
    return subscribeToMediaQueryChange(mq, apply);
  }, [reduce]);

  useEffect(() => {
    if (!allowHero3d) return;
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
      heroMouseRef.current = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: ((e.clientY - r.top) / r.height) * 2 - 1
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [allowHero3d]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = heroRef.current;
    if (!el) return;
    try {
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e) return;
          setStickyCta(!e.isIntersecting);
        },
        { threshold: 0, rootMargin: "-10% 0px 0px 0px 0px" }
      );
      io.observe(el);
      return () => io.disconnect();
    } catch {
      /* sticky CTA optional */
    }
  }, []);

  const trustItems = Array.isArray(copy?.hero?.trust) ? copy.hero.trust : [];
  const headlineAccent = copy?.hero?.headlineLine2?.trim();
  const socialStats = Array.isArray(copy.social?.stats) ? copy.social.stats : [];
  const testimonials = Array.isArray(copy.social?.testimonials) ? copy.social.testimonials : [];
  const leadBullets = Array.isArray(copy.leadMagnet?.bullets) ? copy.leadMagnet.bullets : [];
  const featureItems = Array.isArray(copy.features?.items) ? copy.features.items : [];

  return (
    <div className={`overflow-x-hidden ${stickyCta ? "pb-24 lg:pb-0" : ""}`}>
      {/* Hero — base gradient + optional client-only 3D (lg+, motion OK); mobile uses CSS orb */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100dvh] flex-col justify-center overflow-x-hidden overflow-y-visible px-4 pb-32 pt-[max(5rem,env(safe-area-inset-top,0px)+3.25rem)] sm:px-6 sm:pb-28 sm:pt-24 lg:px-10 lg:pb-32 lg:pt-32"
      >
        {/* Cinematic depth stack — 3D hero replaces orbs on lg when enabled */}
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-15%,rgba(34,211,238,0.09),transparent_52%),radial-gradient(ellipse_55%_45%_at_95%_8%,rgba(167,139,250,0.06),transparent_50%),radial-gradient(ellipse_50%_40%_at_8%_85%,rgba(6,182,212,0.05),transparent_55%)]"
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute inset-0 z-[1] opacity-40 mix-blend-screen ${reduce ? "" : "lux-hero-sheen"}`}
          style={{
            background:
              "linear-gradient(105deg, transparent 0%, rgba(34,211,238,0.04) 38%, transparent 62%, rgba(167,139,250,0.03) 100%)"
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] mesh-grid opacity-[0.22] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_20%,transparent_75%)]"
          aria-hidden
        />
        {allowHero3d ? (
          <LuxuryHero3DExperience mouseRef={heroMouseRef} />
        ) : (
          <>
            <div
              className={`hero-orb pointer-events-none absolute -left-28 top-[16%] z-0 h-[18rem] w-[18rem] bg-cyan-400/12 sm:h-80 sm:w-80 ${reduce ? "" : "hero-orb--drift-a"}`}
              aria-hidden
            />
            <div
              className={`hero-orb pointer-events-none absolute -right-20 bottom-[12%] z-0 h-[20rem] w-[20rem] bg-violet-500/10 sm:-right-28 sm:h-[22rem] sm:w-[22rem] ${reduce ? "" : "hero-orb--drift-b"}`}
              aria-hidden
            />
          </>
        )}
        <div
          className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_72%_58%_at_50%_42%,transparent_0%,rgba(10,10,11,0.4)_55%,#0A0A0B_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-b from-[#0A0A0B]/50 via-transparent via-45% to-[#0A0A0B]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full min-w-0 max-w-6xl text-center sm:text-start">
          <div className="mb-6 flex justify-center sm:justify-start">
            <Logo variant="full" size="hero" glow href={`/${locale}`} />
          </div>
          <span className="lux-badge inline-flex">{copy.hero.badge}</span>

          <h1 className="mx-auto mt-9 w-full min-w-0 max-w-[min(100%,38rem)] font-display text-[clamp(1.9rem,6vw+0.4rem,3.65rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-white text-shadow-[0_2px_48px_rgba(0,0,0,0.45)] sm:mx-0 sm:mt-11 sm:max-w-[42rem] sm:text-[clamp(2.35rem,4.8vw+0.5rem,3.75rem)] sm:leading-[1.06] sm:tracking-[-0.025em]">
            <span className="block text-balance break-words">{copy.hero.headline}</span>
            {headlineAccent ? (
              <span className="mt-3 block text-balance break-words text-[0.92em] font-normal leading-snug tracking-normal text-zinc-400 sm:mt-2.5 sm:text-[0.88em]">
                {headlineAccent}
              </span>
            ) : null}
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-[1.65] text-zinc-400 sm:mx-0 sm:mt-8 sm:text-lg sm:leading-[1.6]">
            {copy.hero.sub}
          </p>

          <div className="relative mx-auto mt-10 w-full max-w-xl sm:mx-0 sm:mt-12 sm:max-w-2xl">
            <div
              className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-[1.75rem] bg-gradient-to-b from-cyan-500/[0.06] via-transparent to-violet-500/[0.04] opacity-80 blur-2xl sm:-inset-x-8"
              aria-hidden
            />
            <div className="relative flex w-full min-w-0 flex-col items-stretch gap-3.5 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.35)_inset,0_24px_64px_-32px_rgba(0,0,0,0.65)] backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:rounded-3xl sm:p-5">
              <GlowButton
                href={`/${locale}#tjfit-lead`}
                variant="primary"
                reducedMotion={reduce}
                onPress={() => trackMarketingEvent("hero_cta_click", { cta: "roadmap", surface: "hero" })}
              >
                {copy.hero.ctaPrimary}
              </GlowButton>
              <GlowButton
                href={`/${locale}/signup`}
                variant="secondary"
                reducedMotion={reduce}
                onPress={() => trackMarketingEvent("hero_cta_click", { cta: "signup", surface: "hero" })}
              >
                {copy.hero.ctaSecondary}
              </GlowButton>
            </div>
          </div>

          <div className="mt-7 flex justify-center sm:mt-6 sm:block">
            <Link
              href={`/${locale}/programs`}
              className="inline-flex min-h-11 items-center text-sm font-medium text-zinc-500 underline-offset-[6px] transition duration-300 hover:text-cyan-200/95 hover:underline"
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "programs", surface: "hero" })}
            >
              {copy.hero.ctaBrowsePrograms}
            </Link>
          </div>

          <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-zinc-600 sm:mx-0 sm:mt-5 sm:text-[13px]">{copy.hero.ctaNote}</p>

          <LeadCaptureForm
            locale={locale}
            source="hero-inline"
            variant="minimal"
            className="mx-auto mt-11 max-w-xl sm:mx-0 sm:mt-12"
          />

          {trustItems.length > 0 ? (
            <div
              className="mt-11 flex flex-wrap items-center justify-center gap-2 sm:mt-14 sm:justify-start sm:gap-2.5"
              aria-label="Trust"
            >
              {trustItems.map((t, i) => (
                <span
                  key={`trust-${i}-${t}`}
                  className="inline-flex max-w-full items-center rounded-full border border-white/[0.09] bg-white/[0.03] px-3.5 py-2 text-left text-[12px] font-medium leading-snug text-zinc-400 shadow-[0_0_0_1px_rgba(0,0,0,0.25)_inset] backdrop-blur-sm transition hover:border-white/[0.12] hover:bg-white/[0.05] sm:text-[13px]"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Social proof */}
      <section className="lux-section-crest border-t border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent py-24 sm:py-28 lg:py-[7.5rem]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl sm:tracking-tight">
              {copy.social.title}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-500 sm:mt-4 sm:text-[15px] sm:leading-[1.65]">
              {copy.social.subtitle}
            </p>
          </Reveal>

          <Reveal className="mt-14 sm:mt-16" delay={0.04}>
            <div className="grid grid-cols-1 gap-12 border-t border-white/[0.06] pt-12 sm:grid-cols-3 sm:gap-8 sm:pt-14">
              {socialStats.map((s, i) => (
                <div
                  key={`stat-${i}-${s.label}`}
                  className="relative rounded-2xl border border-white/[0.05] bg-white/[0.02] px-5 py-6 shadow-[0_0_0_1px_rgba(0,0,0,0.2)_inset] transition duration-300 hover:border-cyan-500/15 hover:shadow-[0_0_40px_-20px_rgba(34,211,238,0.12)] sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:hover:shadow-none"
                >
                  <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-white sm:text-4xl">{s.value}</p>
                  <p className="mt-2.5 text-sm leading-snug text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-20 max-w-3xl space-y-16 sm:space-y-[4.5rem]">
            {testimonials.map((t, i) => (
              <Reveal key={`testimonial-${i}-${t.author}`} delay={0.06 + i * 0.04}>
                <blockquote className="relative border-s-2 border-cyan-400/25 ps-6 sm:ps-8">
                  <p className="text-lg font-light leading-[1.65] text-zinc-200 sm:text-xl sm:leading-[1.6]">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-6 text-sm text-zinc-600">
                    <span className="font-medium text-zinc-400">{t.author}</span>
                    <span className="text-zinc-700"> · </span>
                    <span>{t.role}</span>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lead magnet — primary free value */}
      <section
        id="tjfit-lead"
        className="lux-section-crest scroll-mt-24 border-t border-white/[0.06] bg-gradient-to-b from-transparent via-white/[0.015] to-transparent py-24 sm:py-28 lg:py-[7.5rem]"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-[1.35rem] border border-white/[0.1] bg-gradient-to-br from-surface/55 via-[#0d0d10]/95 to-surface/45 p-6 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-11 lg:rounded-3xl lg:p-12">
              <span className="lux-badge inline-flex">{copy.leadMagnet.badge}</span>
              <h2 className="mt-8 font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
                {copy.leadMagnet.title}
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-[1.65] text-zinc-500 sm:mt-4 sm:text-[15px]">
                {copy.leadMagnet.sub}
              </p>
              <ul className="mt-9 max-w-xl space-y-3.5 text-sm leading-relaxed text-zinc-400">
                {leadBullets.map((b, i) => (
                  <li key={`bullet-${i}`} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-600 shadow-[0_0_12px_-2px_rgba(34,211,238,0.6)]" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-11 max-w-xl">
                <LeadCaptureForm locale={locale} source="free-roadmap" variant="panel" />
              </div>
              <div className="mt-11 border-t border-white/[0.08] pt-11">
                <span className="lux-badge inline-flex">{copy.leadMagnet.tjaiBadge}</span>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">{copy.leadMagnet.tjaiSub}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Features */}
      <section className="lux-section-crest border-t border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent py-24 sm:py-28 lg:py-[7.5rem]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              {copy.features.title}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-[1.65] text-zinc-500 sm:mt-4 sm:text-[15px]">{copy.features.subtitle}</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-3 sm:mt-11 sm:gap-px sm:overflow-hidden sm:rounded-2xl sm:border sm:border-white/[0.08] sm:bg-white/[0.05] sm:shadow-[0_0_0_1px_rgba(0,0,0,0.35)_inset] sm:grid-cols-2 lg:grid-cols-4">
            {featureItems.map((item, i) => {
              const Icon = featureIcons[i] ?? Sparkles;
              return (
                <Reveal key={`feature-${i}-${item.title}`} delay={i * 0.04} className="h-full bg-[#0A0A0B]">
                  <div className="group flex h-full flex-col rounded-2xl border border-white/[0.07] bg-[#0A0A0B] p-6 transition duration-300 max-sm:min-h-0 sm:rounded-none sm:border-0 sm:p-7 sm:hover:bg-white/[0.025] sm:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-500 shadow-[0_0_24px_-12px_rgba(34,211,238,0.15)] transition duration-300 group-hover:border-cyan-400/20 group-hover:text-cyan-200/90">
                      <Icon className="h-5 w-5" strokeWidth={1.35} aria-hidden />
                    </span>
                    <h3 className="mt-5 font-display text-base font-medium tracking-tight text-white sm:mt-4 sm:text-[15px]">{item.title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-500 sm:text-sm sm:leading-[1.65]">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mid-page capture */}
      <section className="lux-section-crest border-t border-white/[0.06] py-24 sm:py-28 lg:py-[7rem]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
                {copy.midCta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-zinc-500 sm:text-[15px] sm:leading-[1.65]">{copy.midCta.sub}</p>
            </div>
            <div className="mx-auto mt-11 max-w-xl">
              <LeadCaptureForm locale={locale} source="mid-page" variant="panel" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Programs */}
      <section className="border-t border-white/[0.05] bg-surface/[0.25] py-28 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {copy.programs.title}
              </h2>
              <p className="mt-3 max-w-md text-sm text-zinc-500 sm:text-[15px]">{copy.programs.subtitle}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <Link
                href={`/${locale}/programs`}
                className="lux-btn-secondary inline-flex w-fit rounded-full px-5 py-2.5 text-sm font-medium text-zinc-200"
              >
                {copy.programs.viewAll}
              </Link>
            </Reveal>
          </div>

          <div className="mt-12 grid w-full grid-cols-1 items-stretch gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((p, i) => {
              const tierLabel =
                p.slug.includes("advanced") || p.slug.includes("hardcore")
                  ? tierHome.elite
                  : p.slug.includes("pro") || p.slug.includes("shred")
                    ? tierHome.popular
                    : p.slug.includes("starter") || p.slug.includes("beginner")
                      ? tierHome.fresh
                      : tierHome.signature;
              return (
                <Reveal key={p.slug} delay={i * 0.04}>
                  <HomeProgramPreviewCard
                    program={p}
                    href={`/${locale}/programs/${p.slug}`}
                    priceFormatted={formatMoney(locale, p.price)}
                    fromLabel={copy.programs.from}
                    tierLabel={tierLabel}
                    reducedMotion={reduce}
                    ctaLabel={programCardCta}
                    onNavigate={() => trackMarketingEvent("program_view", { slug: p.slug, surface: "home" })}
                  />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <ClientErrorBoundary
        fallback={
          <section className="border-t border-white/[0.05] py-20">
            <div className="mx-auto max-w-6xl px-4 text-sm text-zinc-500 sm:px-6 lg:px-8">
              Membership preview is temporarily unavailable.
            </div>
          </section>
        }
      >
        <PricingPreviewHome locale={locale} copy={copy.pricingPreview} />
      </ClientErrorBoundary>

      {/* Coaches */}
      <section className="lux-section-crest border-t border-white/[0.06] bg-gradient-to-b from-white/[0.015] to-transparent py-24 sm:py-28 lg:py-[7.5rem]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              {copy.coaches.title}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-[1.65] text-zinc-500 sm:mt-4 sm:text-[15px]">{copy.coaches.subtitle}</p>
          </Reveal>

          {coaches.length === 0 ? (
            <Reveal className="mt-14" delay={0.06}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-12">
                <h3 className="text-xl font-medium text-white">{copy.coaches.emptyTitle}</h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">{copy.coaches.emptyDesc}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <div
                    className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.02] px-6 py-2.5 text-sm text-zinc-400"
                    role="group"
                    aria-disabled="true"
                    aria-label={`${copy.coaches.applyComingSoonBadge}: ${copy.coaches.cta}`}
                  >
                    <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90">
                      {copy.coaches.applyComingSoonBadge}
                    </span>
                    <span>{copy.coaches.cta}</span>
                  </div>
                  <Link
                    href={`/${locale}/coaches`}
                    className="lux-btn-secondary inline-flex rounded-full px-6 py-2.5 text-sm font-medium text-zinc-200"
                  >
                    {copy.coaches.browse}
                  </Link>
                </div>
              </div>
            </Reveal>
          ) : (
            <div className="mt-12 grid w-full grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {coaches.map((c, i) => (
                <Reveal key={c.slug} delay={i * 0.04}>
                  <Link
                    href={`/${locale}/coaches/${c.slug}`}
                    className="group block h-full w-full min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-surface-elevated/40 shadow-[0_0_0_1px_rgba(0,0,0,0.25)_inset] transition duration-300 hover:border-cyan-400/15 hover:shadow-[0_24px_56px_-28px_rgba(0,0,0,0.65),0_0_40px_-24px_rgba(34,211,238,0.08)]"
                    onClick={() =>
                      trackMarketingEvent("coach_profile_view", { slug: c.slug, surface: "home" })
                    }
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-zinc-800/80 to-zinc-950/90" aria-hidden />
                    <div className="p-6">
                      <span className="inline-block rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-200/80">
                        {c.specialty}
                      </span>
                      <p className="mt-4 font-display text-lg font-semibold text-white">{c.name}</p>
                      <p className="mt-3 text-sm text-zinc-500 sm:text-xs">
                        ★{" "}
                        {typeof c.rating === "number" && Number.isFinite(c.rating) ? c.rating.toFixed(1) : "—"}
                        <span className="text-zinc-700"> · </span>
                        <span className="text-zinc-600 transition group-hover:text-zinc-400">
                          {copy.coaches.viewProfile}
                        </span>
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community / blog — isolated: bad API payloads or Image errors cannot take down the whole home */}
      <div className="border-t border-white/[0.05]">
        <ClientErrorBoundary
          fallback={
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
              <p className="text-sm text-zinc-500">Community highlights are temporarily unavailable.</p>
            </div>
          }
        >
          <HomeBlogsPreview locale={locale} sectionClassName="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8" />
        </ClientErrorBoundary>
      </div>

      {/* Final CTA */}
      <section className="relative px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-[7.5rem]">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-cyan-500/[0.04] via-transparent to-transparent opacity-70"
          aria-hidden
        />
        <Reveal>
          <div className="relative mx-auto max-w-2xl rounded-[1.35rem] border border-white/[0.1] bg-gradient-to-b from-surface/50 to-[#0a0a0c]/95 px-6 py-11 text-center shadow-[0_40px_100px_-55px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.05)_inset,0_0_80px_-40px_rgba(34,211,238,0.12)] sm:rounded-3xl sm:px-12 sm:py-14">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl">
              {copy.finalCta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-[1.65] text-zinc-500">{copy.finalCta.sub}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:flex-wrap sm:gap-4">
              <GlowButton
                href={`/${locale}/signup`}
                variant="primary"
                reducedMotion={reduce}
                onPress={() => trackMarketingEvent("hero_cta_click", { cta: "signup", surface: "final" })}
              >
                {copy.finalCta.primary}
              </GlowButton>
              <Link
                href={`/${locale}/membership`}
                className="lux-btn-secondary inline-flex min-h-[50px] items-center justify-center rounded-full px-8 py-3.5 text-sm font-medium tracking-tight text-zinc-100 sm:min-h-[52px] sm:text-[15px]"
                onClick={() => trackMarketingEvent("hero_cta_click", { cta: "membership", surface: "final" })}
              >
                {copy.finalCta.secondary}
              </Link>
            </div>
            <div className="mx-auto mt-11 max-w-md border-t border-white/[0.08] pt-9">
              <LeadCaptureForm locale={locale} source="final-cta" variant="minimal" />
            </div>
            <p className="mt-6 text-xs leading-relaxed text-zinc-600">{copy.finalCta.nudge}</p>
          </div>
        </Reveal>
      </section>

      {/* Mobile sticky CTA — appears after hero scroll (no exit animation — avoids Framer AnimatePresence edge cases) */}
      {stickyCta ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#0A0A0B]/88 px-4 py-3.5 shadow-[0_-12px_48px_-16px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <GlowButton
              href={`/${locale}#tjfit-lead`}
              variant="primary"
              reducedMotion={reduce}
              className="flex min-h-[44px] flex-1 justify-center text-sm"
              onPress={() => trackMarketingEvent("hero_cta_click", { cta: "roadmap", surface: "sticky" })}
            >
              {copy.hero.ctaPrimary}
            </GlowButton>
            <Link
              href={`/${locale}/signup`}
              className="inline-flex min-h-11 shrink-0 items-center px-2 py-2 text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-300"
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "signup", surface: "sticky" })}
            >
              {copy.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      ) : null}

      <ClientErrorBoundary fallback={null}>
        <HomeLeadNudge locale={locale} title={copy.leadNudge?.title ?? ""} sub={copy.leadNudge?.sub ?? ""} />
      </ClientErrorBoundary>
    </div>
  );
}
