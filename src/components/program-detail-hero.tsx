"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import type { Locale } from "@/lib/i18n";

const SPEC_LABELS: Record<Locale, { goal: string; type: string; setup: string; level: string }> = {
  en: { goal: "Goal", type: "Type", setup: "Setup", level: "Level" },
  tr: { goal: "Hedef", type: "Tür", setup: "Yer", level: "Seviye" },
  ar: { goal: "الهدف", type: "النوع", setup: "المكان", level: "المستوى" },
  es: { goal: "Objetivo", type: "Tipo", setup: "Lugar", level: "Nivel" },
  fr: { goal: "Objectif", type: "Type", setup: "Lieu", level: "Niveau" }
};

type ProgramDetailHeroProps = {
  locale: Locale;
  programTitle: string;
  isDiet: boolean;
  programCategory: string;
  breadcrumbHome: string;
  breadcrumbPrograms: string;
  breadcrumbDiets: string;
  goalLabel: string;
  locationOrTypeLabel: string;
  levelLabel: string;
  metaLine: string;
  imageLabels?: string[];
};

export function ProgramDetailHero({
  locale,
  programTitle,
  isDiet,
  programCategory,
  breadcrumbHome,
  breadcrumbPrograms,
  breadcrumbDiets,
  goalLabel,
  locationOrTypeLabel,
  levelLabel,
  metaLine,
  imageLabels = []
}: ProgramDetailHeroProps) {
  const visualRef = useRef<HTMLDivElement>(null);
  const listHref = isDiet ? `/${locale}/diets` : `/${locale}/programs`;
  const listLabel = isDiet ? breadcrumbDiets : breadcrumbPrograms;
  const letters = useMemo(() => Array.from(programTitle), [programTitle]);
  const frameLabels = imageLabels.length > 0 ? imageLabels.slice(0, 3) : [programCategory, goalLabel, levelLabel];
  const specLabels = SPEC_LABELS[locale] ?? SPEC_LABELS.en;

  useEffect(() => {
    const node = visualRef.current;
    if (!node) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = node.getBoundingClientRect();
      const y = Math.max(-120, Math.min(120, rect.top * -0.15));
      node.style.setProperty("--hero-y", `${y}px`);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="relative -mx-4 overflow-hidden border-b border-white/[0.06] bg-[#08080A] sm:-mx-6 lg:mx-[calc(-50vw+50%)] lg:w-screen lg:max-w-[100vw]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 82% 0%, rgba(34,211,238,0.13), transparent 64%), linear-gradient(180deg, rgba(8,8,10,0) 0%, rgba(8,8,10,0.82) 100%)"
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-20 sm:px-6 md:pt-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-12 lg:px-8 lg:pb-16">
        <div className="min-w-0 lg:pb-4">
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-white/45">
            <Link href={`/${locale}`} className="transition-colors duration-150 hover:text-white">
              {breadcrumbHome}
            </Link>
            <span aria-hidden>/</span>
            <Link href={listHref} className="transition-colors duration-150 hover:text-white">
              {listLabel}
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-white/65">{programTitle}</span>
          </nav>

          <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">
            {programCategory}
          </p>

          <h1 className="mt-3 max-w-4xl font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.02em] text-white sm:text-[52px] lg:text-[54px] xl:text-[58px]">
            {letters.map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className="inline-block translate-y-3 opacity-0 [animation:program-letter-in_560ms_cubic-bezier(0.2,0.8,0.2,1)_forwards] motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:[animation:none]"
                style={{ animationDelay: `${Math.min(index, 34) * 18}ms` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-white/58">{metaLine}</p>

          <dl className="mt-8 grid grid-cols-1 gap-x-4 gap-y-3 border-t border-white/[0.06] pt-5 text-[12px] sm:grid-cols-3 sm:max-w-xl">
            <Spec label={specLabels.goal} value={goalLabel} />
            <Spec label={isDiet ? specLabels.type : specLabels.setup} value={locationOrTypeLabel} />
            <Spec label={specLabels.level} value={levelLabel} />
          </dl>
        </div>

        <div
          ref={visualRef}
          className="relative min-h-[280px] overflow-hidden rounded-[18px] border border-cyan-300/15 bg-[#0B0D10] shadow-[0_34px_90px_-52px_rgba(34,211,238,0.55)] [transform:translate3d(0,var(--hero-y,0px),0)] motion-reduce:transform-none sm:min-h-[380px]"
          aria-label={programTitle}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.20),rgba(14,165,233,0.05)_36%,rgba(0,0,0,0)_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_24%,rgba(255,255,255,0.18),transparent_16%),radial-gradient(circle_at_36%_62%,rgba(34,211,238,0.16),transparent_24%)]" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.72))]" />
          <div className="absolute inset-5 grid grid-cols-[0.72fr_1fr] gap-3 sm:inset-6">
            {frameLabels.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className={`relative overflow-hidden rounded-[12px] border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-sm ${
                  index === 0 ? "row-span-2" : ""
                }`}
              >
                <span className="absolute inset-0 bg-[linear-gradient(145deg,rgba(34,211,238,0.14),rgba(255,255,255,0.02))]" />
                <span className="relative font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="relative mt-3 max-w-[12rem] text-sm font-semibold leading-5 text-white">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes program-letter-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">{label}</dt>
      <dd className="mt-1.5 text-[13px] font-medium text-white/90">{value}</dd>
    </div>
  );
}
