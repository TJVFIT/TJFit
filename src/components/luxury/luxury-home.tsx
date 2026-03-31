"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bot, Dumbbell, Sparkles, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { CursorGlow } from "@/components/luxury/cursor-glow";
import { GlowButton } from "@/components/luxury/glow-button";
import { InteractiveCard } from "@/components/luxury/interactive-card";
import { useHero3DEnabled } from "@/components/luxury/use-hero-3d-enabled";
import { WebGLErrorBoundary } from "@/components/luxury/webgl-error-boundary";
import type { HomeLuxuryCopy } from "@/lib/home-luxury-copy";
import type { Locale } from "@/lib/i18n";

const LUX_EASE = [0.16, 1, 0.3, 1] as const;

const HeroScene3D = dynamic(
  () => import("@/components/luxury/hero-scene-3d").then((m) => m.HeroScene3D),
  { ssr: false, loading: () => null }
);

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
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px", amount: 0.2 }}
      transition={{ duration: 0.74, delay, ease: LUX_EASE }}
    >
      {children}
    </motion.div>
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
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const [stickyCta, setStickyCta] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const showHero3d = useHero3DEnabled(reduce === true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return;
        setStickyCta(!e.isIntersecting);
      },
      { threshold: 0, rootMargin: "-10% 0px 0px 0px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!showHero3d) setSceneReady(false);
  }, [showHero3d]);

  const trustLine = Array.isArray(copy?.hero?.trust) ? copy.hero.trust.join(" · ") : "";

  return (
    <div className={`overflow-x-hidden ${stickyCta ? "pb-24 lg:pb-0" : ""}`}>
      {/* Hero — 3D canvas (desktop only) + readable overlay */}
      <section
        ref={heroRef}
        className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28"
      >
        <div className="pointer-events-none absolute inset-0 z-0 mesh-grid opacity-[0.12]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-10%,rgba(34,211,238,0.06),transparent),radial-gradient(ellipse_50%_35%_at_100%_40%,rgba(139,92,246,0.05),transparent)]"
          aria-hidden
        />
        {showHero3d ? (
          <div
            className={`pointer-events-none absolute inset-0 z-0 touch-none transition-opacity duration-1000 ease-out ${
              sceneReady ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden
          >
            <WebGLErrorBoundary>
              <HeroScene3D className="h-full w-full" onReady={() => setSceneReady(true)} />
            </WebGLErrorBoundary>
          </div>
        ) : null}
        {!showHero3d && !reduce ? (
          <>
            <div
              className="hero-orb hero-orb--drift-a pointer-events-none absolute -left-40 top-1/3 z-0 h-80 w-80 bg-cyan-400/12"
              aria-hidden
            />
            <div
              className="hero-orb hero-orb--drift-b pointer-events-none absolute -right-32 bottom-1/3 z-0 h-96 w-96 bg-violet-500/10"
              aria-hidden
            />
          </>
        ) : null}
        {showHero3d && reduce !== true ? <CursorGlow /> : null}
        <div
          className="pointer-events-none absolute inset-0 z-[4] bg-gradient-to-b from-[#0A0A0B]/65 via-[#0A0A0B]/25 to-[#0A0A0B]/93"
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <span className="lux-badge inline-flex">{copy.hero.badge}</span>

          <h1 className="mt-10 font-display text-[clamp(2.25rem,5.5vw,3.75rem)] font-semibold leading-[1.08] tracking-tight">
            <span className="block text-white">{copy.hero.headline}</span>
            <span className="mt-1 block font-normal text-zinc-400">{copy.hero.headlineLine2}</span>
          </h1>

          <p className="mt-8 max-w-lg text-[15px] leading-relaxed text-zinc-500 sm:text-base">{copy.hero.sub}</p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <GlowButton href={`/${locale}/signup`} variant="primary" reducedMotion={reduce}>
              {copy.hero.ctaPrimary}
            </GlowButton>
            <GlowButton href={`/${locale}/programs`} variant="secondary" reducedMotion={reduce}>
              {copy.hero.ctaSecondary}
            </GlowButton>
          </div>

          <p className="mt-6 max-w-md text-xs leading-relaxed text-zinc-600 sm:text-[13px]">{copy.hero.ctaNote}</p>

          {trustLine ? <p className="mt-12 text-sm text-zinc-600">{trustLine}</p> : null}
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-white/[0.05] py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {copy.social.title}
            </h2>
            <p className="mt-3 max-w-md text-sm text-zinc-500 sm:text-[15px]">{copy.social.subtitle}</p>
          </Reveal>

          <Reveal className="mt-16" delay={0.04}>
            <div className="grid grid-cols-1 gap-10 border-t border-white/[0.05] pt-14 sm:grid-cols-3 sm:gap-6">
              {copy.social.stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-semibold tabular-nums text-white sm:text-4xl">{s.value}</p>
                  <p className="mt-2 text-sm leading-snug text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="mt-20 max-w-3xl space-y-14">
            {copy.social.testimonials.map((t, i) => (
              <Reveal key={t.author} delay={0.06 + i * 0.04}>
                <blockquote>
                  <p className="text-lg font-light leading-relaxed text-zinc-300 sm:text-xl">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-5 text-sm text-zinc-600">
                    <span className="text-zinc-500">{t.author}</span>
                    <span className="text-zinc-700"> · </span>
                    <span>{t.role}</span>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/[0.05] py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {copy.features.title}
            </h2>
            <p className="mt-3 max-w-md text-sm text-zinc-500 sm:text-[15px]">{copy.features.subtitle}</p>
          </Reveal>

          <div className="mt-4 divide-y divide-white/[0.06]">
            {copy.features.items.map((item, i) => {
              const Icon = featureIcons[i] ?? Sparkles;
              return (
                <Reveal key={item.title} delay={i * 0.05}>
                  <div className="flex gap-5 py-12 sm:gap-8">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-zinc-600" strokeWidth={1.25} aria-hidden />
                    <div className="min-w-0">
                      <h3 className="text-lg font-medium text-white">{item.title}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="border-t border-white/[0.05] bg-surface/[0.35] py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
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

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.04}>
                <Link href={`/${locale}/programs/${p.slug}`} className="block h-full">
                  <InteractiveCard
                    reducedMotion={reduce}
                    className="group flex h-full flex-col rounded-xl border border-white/[0.06] bg-surface-elevated/60 p-6 transition-colors hover:border-white/[0.12]"
                  >
                    <div className="h-px w-10 rounded-full bg-cyan-400/50 transition group-hover:bg-cyan-400/70" />
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{p.category}</p>
                    <h3 className="mt-2 line-clamp-2 text-base font-medium leading-snug text-white">{p.title}</h3>
                    <p className="mt-2 text-xs text-zinc-600">{p.duration}</p>
                    <p className="mt-auto pt-8 text-sm text-zinc-500">
                      {copy.programs.from}{" "}
                      <span className="font-medium text-zinc-200">{formatMoney(locale, p.price)}</span>
                    </p>
                  </InteractiveCard>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section className="border-t border-white/[0.05] py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {copy.coaches.title}
            </h2>
            <p className="mt-3 max-w-md text-sm text-zinc-500 sm:text-[15px]">{copy.coaches.subtitle}</p>
          </Reveal>

          {coaches.length === 0 ? (
            <Reveal className="mt-14" delay={0.06}>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-12">
                <h3 className="text-xl font-medium text-white">{copy.coaches.emptyTitle}</h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">{copy.coaches.emptyDesc}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <GlowButton
                    href={`/${locale}/become-a-coach`}
                    variant="primary"
                    reducedMotion={reduce}
                    className="min-h-0 px-6 py-2.5 text-sm"
                  >
                    {copy.coaches.cta}
                  </GlowButton>
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
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {coaches.map((c, i) => (
                <Reveal key={c.slug} delay={i * 0.04}>
                  <Link
                    href={`/${locale}/coaches`}
                    className="block h-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-white/[0.1]"
                  >
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{c.specialty}</p>
                    <p className="mt-4 text-xs text-zinc-600">★ {c.rating.toFixed(1)}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Community / blog — isolated: bad API payloads or Image errors cannot take down the whole home */}
      <div className="border-t border-white/[0.05] bg-surface/[0.2]">
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
      <section className="px-4 py-24 sm:px-6 lg:py-32 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/[0.08] bg-surface-elevated/40 px-8 py-12 sm:px-12 sm:py-14">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {copy.finalCta.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-500 sm:text-[15px]">{copy.finalCta.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <GlowButton href={`/${locale}/signup`} variant="primary" reducedMotion={reduce}>
                {copy.finalCta.primary}
              </GlowButton>
              <Link
                href={`/${locale}/membership`}
                className="lux-btn-secondary inline-flex min-h-[48px] items-center justify-center rounded-full px-8 py-3 text-sm font-medium text-zinc-200 sm:text-[15px]"
              >
                {copy.finalCta.secondary}
              </Link>
            </div>
            <p className="mt-8 text-xs leading-relaxed text-zinc-600 sm:text-sm">{copy.finalCta.nudge}</p>
          </div>
        </Reveal>
      </section>

      {/* Mobile sticky CTA — appears after hero scroll (no exit animation — avoids Framer AnimatePresence edge cases) */}
      {stickyCta ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#0A0A0B]/88 px-4 py-3 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <GlowButton
              href={`/${locale}/signup`}
              variant="primary"
              reducedMotion={reduce}
              className="flex min-h-[44px] flex-1 justify-center text-sm"
            >
              {copy.hero.ctaPrimary}
            </GlowButton>
            <Link
              href={`/${locale}/programs`}
              className="shrink-0 py-2 text-xs font-medium text-zinc-500 underline-offset-4 hover:text-zinc-300"
            >
              {copy.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
