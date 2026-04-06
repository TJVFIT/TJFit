"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Activity, Target, UtensilsCrossed } from "lucide-react";
import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { GlowButton } from "@/components/luxury/glow-button";
import { HomeProgramPreviewCard } from "@/components/program-card";
import { Logo } from "@/components/ui/Logo";
import { HomeLeadNudge } from "@/components/marketing/home-lead-nudge";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { PricingPreviewHome } from "@/components/marketing/pricing-preview-home";
import { trackMarketingEvent } from "@/lib/analytics-events";
import { getDietsMarketplaceCopy } from "@/lib/diets-marketplace-copy";
import type { HomeLuxuryCopy } from "@/lib/home-luxury-copy";
import { getProgramUiCopy } from "@/lib/program-localization";
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
  phase?: "cutting" | "bulking";
  is_free?: boolean;
};

export type HomeCoachPreview = {
  slug: string;
  name: string;
  specialty: string;
  rating: number;
};

const featureIcons = [Activity, UtensilsCrossed, Target] as const;

const EXPLORE_DIETS_CTA: Record<Locale, string> = {
  en: "View All Diets →",
  tr: "Diyetleri keşfet",
  ar: "استكشف الأنظمة الغذائية",
  es: "Explorar dietas",
  fr: "Voir les programmes repas"
};

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
  diets = [],
  coaches
}: {
  locale: Locale;
  copy: HomeLuxuryCopy;
  programs: HomeProgramPreview[];
  diets?: HomeProgramPreview[];
  coaches: HomeCoachPreview[];
}) {
  const reduce = usePrefersReducedMotion();

  const programUi = getProgramUiCopy(locale);

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
  const [scrollParallax, setScrollParallax] = useState(0);
  const [stickyCta, setStickyCta] = useState(false);
  const [programFilter, setProgramFilter] = useState<"all" | "fat" | "muscle" | "home" | "gym">("all");
  const [dietFilter, setDietFilter] = useState<"all" | "cutting" | "bulking">("all");

  useEffect(() => {
    if (reduce || typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!mq.matches) {
          setScrollParallax(0);
          return;
        }
        setScrollParallax(window.scrollY);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduce]);

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
  const headlineAccentWord = copy.hero.headlineLine2Accent;
  const headlineAccentRest = copy.hero.headlineLine2Rest;

  const filteredPrograms = useMemo(() => {
    const list = programs.filter((p) => {
      const cat = p.category.toLowerCase();
      const slug = p.slug.toLowerCase();
      switch (programFilter) {
        case "all":
          return true;
        case "fat":
          return cat.includes("fat");
        case "muscle":
          return cat.includes("muscle") || cat.includes("strength");
        case "home":
          return slug.includes("home");
        case "gym":
          return !slug.includes("home");
        default:
          return true;
      }
    });
    const slice = list.slice(0, 4);
    return slice.length > 0 ? slice : programs.slice(0, 4);
  }, [programs, programFilter]);

  const filteredDiets = useMemo(() => {
    const list = diets.filter((p) => {
      if (dietFilter === "all") return true;
      return p.phase === dietFilter;
    });
    const slice = list.slice(0, 4);
    return slice.length > 0 ? slice : diets.slice(0, 4);
  }, [diets, dietFilter]);

  const parallaxY = reduce ? 0 : scrollParallax * 0.15;

  const dietSectionCopy = useMemo(() => {
    const d = getDietsMarketplaceCopy(locale);
    if (copy.dietsTeaser) {
      return {
        title: copy.dietsTeaser.title,
        subtitle: copy.dietsTeaser.subtitle,
        cta: copy.dietsTeaser.cta,
        filterAll: copy.dietsTeaser.filterAll ?? d.all,
        filterCut: copy.dietsTeaser.filterCut ?? d.cutting,
        filterBulk: copy.dietsTeaser.filterBulk ?? d.bulking
      };
    }
    return {
      title: d.title,
      subtitle: d.body,
      cta: EXPLORE_DIETS_CTA[locale],
      filterAll: d.all,
      filterCut: d.cutting,
      filterBulk: d.bulking
    };
  }, [copy.dietsTeaser, locale]);

  const socialStats = Array.isArray(copy.social?.stats) ? copy.social.stats : [];
  const testimonials = Array.isArray(copy.social?.testimonials) ? copy.social.testimonials : [];
  const leadBullets = Array.isArray(copy.leadMagnet?.bullets) ? copy.leadMagnet.bullets : [];
  const featureItems = Array.isArray(copy.features?.items) ? copy.features.items : [];

  return (
    <div className={`overflow-x-hidden ${stickyCta ? "pb-24 lg:pb-0" : ""}`}>
      {/* Hero — CSS mesh + GPU orbs (no WebGL) */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100dvh] flex-col justify-center overflow-x-hidden overflow-y-visible px-6 pb-16 pt-[max(5rem,env(safe-area-inset-top,0px)+3rem)] lg:px-8 lg:pb-24 lg:pt-24"
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[var(--gradient-hero)]" aria-hidden />
        <div
          className="lux-hero-mesh mesh-grid pointer-events-none absolute inset-0 z-[1] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_25%,transparent_72%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[-200px] z-0"
          style={{
            transform: reduce ? "translateX(-50%)" : `translateX(-50%) translateY(${parallaxY}px)`
          }}
        >
          <div className="tj-hero-orb-cyan tj-hero-orb-cyan--float" aria-hidden />
        </div>
        <div
          className="pointer-events-none absolute bottom-0 right-[-100px] z-0"
          style={{
            transform: reduce ? "none" : `translateY(${parallaxY * 0.85}px)`
          }}
        >
          <div className="tj-hero-orb-violet tj-hero-orb-violet--float" aria-hidden />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(ellipse_72%_58%_at_50%_42%,transparent_0%,rgba(9,9,11,0.45)_58%,#09090B_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-b from-[#09090B]/45 via-transparent via-40% to-[#09090B]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[1200px] flex-col items-center text-center">
          <div className="mb-8 flex justify-center">
            <Logo variant="full" size="hero" glow href={`/${locale}`} />
          </div>
          {copy.hero.eyebrow ? (
            <span className="inline-flex items-center rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.06)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#22D3EE]">
              {copy.hero.eyebrow}
            </span>
          ) : (
            <span className="lux-badge inline-flex">{copy.hero.badge}</span>
          )}

          <h1 className="tj-display-xl font-display mt-8 max-w-[min(100%,42rem)] text-[var(--color-text-primary)]">
            <span className="block text-balance">{copy.hero.headline}</span>
            {headlineAccent ? (
              <span className="mt-2 block text-balance sm:mt-3">
                {headlineAccentWord && headlineAccentRest ? (
                  <>
                    <span className="bg-gradient-to-br from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">
                      {headlineAccentWord}
                    </span>
                    <span>{headlineAccentRest}</span>
                  </>
                ) : (
                  <span className="text-[var(--color-text-secondary)]">{headlineAccent}</span>
                )}
              </span>
            ) : null}
          </h1>

          <p className="mt-6 max-w-[30rem] text-base leading-[1.7] text-[var(--color-text-secondary)] sm:text-lg">
            {copy.hero.sub}
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href={`/${locale}/start`}
              className="lux-btn-primary inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-4 text-base font-bold text-[#09090B] sm:min-h-[52px]"
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "hero" })}
            >
              {copy.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${locale}/programs`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[var(--color-border)] px-8 py-4 text-base font-semibold text-white transition-colors duration-150 hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)] sm:min-h-[52px]"
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "programs", surface: "hero" })}
            >
              {copy.hero.ctaSecondary}
            </Link>
          </div>

          {copy.hero.trustLine ? (
            <p className="mt-8 text-[13px] font-medium tracking-wide text-[var(--color-text-muted)]">{copy.hero.trustLine}</p>
          ) : null}

          {copy.hero.ctaNote ? (
            <p className="mt-4 max-w-md text-xs text-[var(--color-text-muted)] sm:text-[13px]">{copy.hero.ctaNote}</p>
          ) : null}

          {trustItems.length > 0 && !copy.hero.trustLine ? (
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
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

      <div className="tj-gradient-divider" aria-hidden />

      {/* What you get */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em] text-white">{copy.features.title}</h2>
            <p className="mt-4 max-w-[34rem] text-lg leading-[1.7] text-[var(--color-text-secondary)]">{copy.features.subtitle}</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {featureItems.slice(0, 3).map((item, i) => {
              const Icon = featureIcons[i] ?? Activity;
              return (
                <Reveal key={`feature-${i}-${item.title}`} delay={i * 0.04} className="h-full">
                  <div className="tj-card-premium-hover tj-card-aura flex h-full flex-col rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4),0_0_0_1px_var(--color-border)]">
                    <Icon className="h-7 w-7 shrink-0 text-[#22D3EE]" strokeWidth={1.35} aria-hidden />
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.005em] text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="tj-gradient-divider" aria-hidden />

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
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em] text-white">
              {copy.programs.title}
            </h2>
            <p className="mt-3 max-w-md text-base leading-[1.7] text-[var(--color-text-secondary)]">
              {copy.programs.subtitle}
            </p>
          </Reveal>

          <div className="mt-8 flex flex-wrap gap-2">
            {(
              [
                ["all", copy.programs.filterAll ?? "All"],
                ["fat", copy.programs.filterFat ?? "Fat Loss"],
                ["muscle", copy.programs.filterMuscle ?? "Muscle Gain"],
                ["home", copy.programs.filterHome ?? "Home"],
                ["gym", copy.programs.filterGym ?? "Gym"]
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setProgramFilter(id)}
                className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  programFilter === id
                    ? "border border-[var(--color-border)] bg-[rgba(255,255,255,0.08)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-10 grid w-full grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredPrograms.map((p, i) => {
              const tierLabel =
                p.slug.includes("advanced") || p.slug.includes("hardcore")
                  ? tierHome.elite
                  : p.slug.includes("pro") || p.slug.includes("shred")
                    ? tierHome.popular
                    : p.slug.includes("starter") || p.slug.includes("beginner")
                      ? tierHome.fresh
                      : tierHome.signature;
              return (
                <Reveal key={`${p.slug}-${programFilter}`} delay={i * 0.04}>
                  <HomeProgramPreviewCard
                    program={p}
                    href={`/${locale}/programs/${p.slug}`}
                    priceFormatted={formatMoney(locale, p.price)}
                    fromLabel={copy.programs.from}
                    tierLabel={tierLabel}
                    reducedMotion={reduce}
                    ctaLabel={p.is_free ? programUi.viewProgram : programUi.getFullAccess}
                    onNavigate={() => trackMarketingEvent("program_view", { slug: p.slug, surface: "home" })}
                  />
                </Reveal>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">{programUi.trustProgramsGrid}</p>

          <div className="mt-8 flex justify-center">
            <Link
              href={`/${locale}/programs`}
              className="lux-btn-primary inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-3 text-sm font-bold text-[#09090B]"
              onClick={() => trackMarketingEvent("hero_cta_click", { cta: "programs_all", surface: "home_programs" })}
            >
              {copy.programs.viewAll}
            </Link>
          </div>
        </div>
      </section>

      {diets.length > 0 ? (
        <>
          <div className="tj-gradient-divider" aria-hidden />
          <section className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-16 lg:py-24">
            <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <Reveal>
                  <h2 className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em] text-white">
                    {dietSectionCopy.title}
                  </h2>
                  <p className="mt-3 max-w-md text-base leading-[1.7] text-[var(--color-text-secondary)]">
                    {dietSectionCopy.subtitle}
                  </p>
                </Reveal>
                <Reveal delay={0.05}>
                  <Link
                    href={`/${locale}/diets`}
                    className="lux-btn-secondary inline-flex w-fit rounded-full px-5 py-2.5 text-sm font-medium text-zinc-200"
                  >
                    {dietSectionCopy.cta}
                  </Link>
                </Reveal>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {(
                  [
                    ["all", dietSectionCopy.filterAll],
                    ["cutting", dietSectionCopy.filterCut],
                    ["bulking", dietSectionCopy.filterBulk]
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDietFilter(id)}
                    className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                      dietFilter === id
                        ? "border border-[var(--color-border)] bg-[rgba(255,255,255,0.08)] text-white"
                        : "text-[var(--color-text-muted)] hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredDiets.map((p, i) => (
                  <Reveal key={`${p.slug}-${dietFilter}`} delay={i * 0.04}>
                    <HomeProgramPreviewCard
                      program={p}
                      href={`/${locale}/programs/${p.slug}`}
                      priceFormatted={formatMoney(locale, p.price)}
                      fromLabel={copy.programs.from}
                      tierLabel={tierHome.signature}
                      reducedMotion={reduce}
                      ctaLabel={p.is_free ? programUi.viewDiet : programUi.getFullAccess}
                      onNavigate={() => trackMarketingEvent("program_view", { slug: p.slug, surface: "home_diets" })}
                    />
                  </Reveal>
                ))}
              </div>
              <p className="mt-8 text-center text-xs text-[var(--color-text-muted)]">{programUi.trustDietsGrid}</p>
              <div className="mt-8 flex justify-center">
                <Link
                  href={`/${locale}/diets`}
                  className="text-sm font-semibold text-[#22D3EE] transition-colors duration-150 hover:text-white"
                  onClick={() => trackMarketingEvent("hero_cta_click", { cta: "diets_all", surface: "home_diets" })}
                >
                  {dietSectionCopy.cta}
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {copy.systemProof ? (
        <>
          <div className="tj-gradient-divider" aria-hidden />
          <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-16 lg:py-24">
            <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
              <Reveal>
                <h2 className="font-display text-[32px] font-bold leading-tight tracking-[-0.015em] text-white">
                  {copy.systemProof.title}
                </h2>
              </Reveal>
              <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
                {copy.systemProof.stats.map((s, i) => (
                  <Reveal key={`${s.label}-${i}`} delay={i * 0.05}>
                    <div>
                      <p className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-[#22D3EE] lg:text-[56px]">
                        {s.value}
                      </p>
                      <p className="mt-3 text-lg font-semibold tracking-[-0.005em] text-[var(--color-text-muted)]">
                        {s.label}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}

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
                    <span className="rounded border border-violet-400/25 bg-violet-400/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-200/90">
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
              href={`/${locale}/start`}
              variant="primary"
              reducedMotion={reduce}
              className="flex min-h-[44px] flex-1 justify-center text-sm"
              onPress={() => trackMarketingEvent("hero_cta_click", { cta: "start", surface: "sticky" })}
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
