"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, FileDown } from "lucide-react";

import { useReveal, useTilt } from "@/components/effects/use-3d";
import { useMagnetic, useMergedRef, useRipple } from "@/components/effects/use-magnetic";
import type { Bundle, BundleGoal } from "@/lib/bundles";
import { getBundlesCopy, type BundlesCopy } from "@/lib/bundles-copy";
import { localizeBundleCard } from "@/lib/bundle-localization";

type FilterKey = "all" | BundleGoal;

const FILTER_KEYS: FilterKey[] = [
  "all",
  "fat-loss",
  "muscle-gain",
  "recomp",
  "strength",
  "conditioning",
  "foundation"
];

export function BundleGrid({
  bundles,
  locale
}: {
  bundles: Bundle[];
  locale: string;
}) {
  const [active, setActive] = useState<FilterKey>("all");
  const copy = useMemo(() => getBundlesCopy(locale), [locale]);
  const filtered = useMemo(
    () => (active === "all" ? bundles : bundles.filter((b) => b.goal === active)),
    [active, bundles]
  );
  const counts = useMemo(() => {
    const map: Partial<Record<FilterKey, number>> = { all: bundles.length };
    for (const b of bundles) map[b.goal] = (map[b.goal] ?? 0) + 1;
    return map;
  }, [bundles]);

  return (
    <>
      <div
        className="mt-10 flex flex-wrap gap-2"
        role="tablist"
        aria-label={copy.filterAria}
      >
        {FILTER_KEYS.map((key) => {
          const count = counts[key] ?? 0;
          if (key !== "all" && count === 0) return null;
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(key)}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-[color,border-color,background-color] motion-safe:transition-all ${
                isActive
                  ? "tj-chip-active border-cyan-300/60 bg-cyan-300/[0.12] text-cyan-50"
                  : "border-white/[0.08] bg-white/[0.02] text-bright/80 hover:border-cyan-300/30 hover:text-cyan-100"
              }`}
            >
              {copy.filterLabels[key]}
              <span
                className={`tabular-nums text-[10px] ${
                  isActive ? "text-cyan-200/80" : "text-faint"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        role="tabpanel"
        aria-live="polite"
      >
        {filtered.map((bundle, i) => (
          <BundleCard key={bundle.slug} bundle={bundle} locale={locale} index={i} copy={copy} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted">{copy.emptyFilter}</p>
      ) : null}
    </>
  );
}

function BundleCard({
  bundle,
  locale,
  index,
  copy
}: {
  bundle: Bundle;
  locale: string;
  index: number;
  copy: BundlesCopy;
}) {
  const detailHref = `/${locale}/bundles/${bundle.slug}`;
  const downloadHref = `/api/bundles/download/${bundle.slug}`;
  const isFree = bundle.save.toLowerCase() === "free";
  const card = localizeBundleCard(bundle, locale);
  const tiltRef = useTilt();
  const reveal = useReveal();
  const dlMagnetic = useMagnetic<HTMLAnchorElement>({ strength: 6, max: 8 });
  const dlRipple = useRipple<HTMLAnchorElement>();
  const dlRef = useMergedRef<HTMLAnchorElement>(dlMagnetic, dlRipple);

  // Stagger the reveal so cards cascade into place rather than all popping at once.
  const revealDelay = `${Math.min(index * 60, 360)}ms`;

  return (
    <div
      ref={reveal.ref}
      style={{
        opacity: reveal.shown ? 1 : 0,
        transform: reveal.shown ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 620ms cubic-bezier(0.2,1,0.3,1) ${revealDelay}, transform 620ms cubic-bezier(0.2,1,0.3,1) ${revealDelay}`,
        perspective: "1100px"
      }}
    >
      <article
        ref={tiltRef}
        className="bundle-card-tilt group relative flex h-full flex-col overflow-hidden rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,8,11,0.92),rgba(8,8,11,0.55))] shadow-[0_0_32px_rgba(34,211,238,0.06)] hover:border-cyan-300/45 hover:shadow-[0_0_56px_rgba(34,211,238,0.18)]"
        style={
          {
            "--tilt-x": "0deg",
            "--tilt-y": "0deg",
            "--glare-x": "50%",
            "--glare-y": "50%",
            "--glare-opacity": "0",
            transform:
              "perspective(1100px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))",
            transformStyle: "preserve-3d",
            transition:
              "transform 260ms cubic-bezier(0.2,1,0.3,1), box-shadow 260ms cubic-bezier(0.2,1,0.3,1), border-color 200ms"
          } as React.CSSProperties
        }
      >
        {/* Cursor-following glare layer — pure CSS, no JS per frame after rAF. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[3] rounded-2xl mix-blend-screen"
          style={{
            background:
              "radial-gradient(180px circle at var(--glare-x) var(--glare-y), rgba(34,211,238,0.22), transparent 70%)",
            opacity: "var(--glare-opacity)",
            transition: "opacity 220ms ease-out"
          }}
        />

        <div
          className="relative aspect-[16/10] w-full overflow-hidden bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(14,165,233,0.06)_45%,rgba(8,8,11,0.9))]"
          aria-hidden
        >
          {/* <img> instead of CSS background so the SVG's embedded
              animations (cyan beam sweep + numeral breathe) actually fire. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bundle.heroImage}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-[opacity,transform] duration-500 group-hover:opacity-100 motion-safe:group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
          />
          {/* Subtle inner glow that intensifies on hover */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(60% 70% at 80% 20%, rgba(34,211,238,0.18), transparent 70%)"
            }}
          />
          <div className="absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-4">
            <span
              className="rounded-full border border-cyan-300/30 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur"
              aria-label={copy.goalAria(card.goalLabel)}
            >
              {card.goalLabel}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur ${
                isFree
                  ? "border border-white/20 bg-white/[0.08] text-white/85"
                  : "border border-cyan-300/40 bg-cyan-300/[0.12] text-cyan-50"
              }`}
              aria-label={copy.priceAria(bundle.save)}
            >
              {bundle.save}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-[1] h-24 bg-[linear-gradient(180deg,rgba(8,8,11,0)_0%,rgba(8,8,11,0.85)_100%)]" />
        </div>

        <div className="relative z-[2] flex flex-1 flex-col p-5">
          <h2 className="text-lg font-bold leading-tight text-white">{card.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-bright/85">{card.hook}</p>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
              <dt className="text-faint">{copy.duration}</dt>
              <dd className="mt-0.5 font-semibold text-white tabular-nums">
                {copy.weeksValue(bundle.weeks)}
              </dd>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
              <dt className="text-faint">{copy.sessions}</dt>
              <dd className="mt-0.5 font-semibold text-white tabular-nums">
                {copy.sessionsValue(bundle.sessionsPerWeek)}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-muted">
            {bundle.programTitle} <span className="text-faint">+</span> {bundle.dietTitle}
          </p>

          <div className="mt-auto flex items-center gap-3 pt-5">
            <a
              ref={dlRef}
              href={downloadHref}
              aria-label={copy.downloadAria(card.name)}
              className="tj-cta-sheen relative inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-4 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.22)] hover:brightness-110 hover:shadow-[0_0_32px_rgba(34,211,238,0.32)] motion-safe:active:scale-[0.97]"
              style={
                {
                  "--mag-x": "0px",
                  "--mag-y": "0px",
                  transform: "translate3d(var(--mag-x), var(--mag-y), 0)",
                  transition:
                    "transform 220ms cubic-bezier(0.2,1,0.3,1), filter 150ms, box-shadow 220ms"
                } as React.CSSProperties
              }
            >
              <FileDown className="relative h-4 w-4" aria-hidden />
              <span className="relative">{copy.download}</span>
            </a>
            <Link
              href={detailHref}
              aria-label={copy.detailsAria(card.name)}
              className="tj-cta-sheen inline-flex min-h-[44px] items-center gap-1 rounded-full border border-cyan-300/20 px-3.5 py-2.5 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-300/40 hover:text-cyan-100"
            >
              {copy.details}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform rtl:rotate-180 motion-safe:group-hover:translate-x-0.5 rtl:motion-safe:group-hover:-translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>

          <p className="mt-3 text-[10px] text-faint">
            {isFree ? copy.footnoteFree : copy.footnotePaid}
          </p>
        </div>
      </article>
    </div>
  );
}
