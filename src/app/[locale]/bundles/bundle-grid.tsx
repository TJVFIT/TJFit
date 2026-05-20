"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, FileDown } from "lucide-react";

import type { Bundle, BundleGoal } from "@/lib/bundles";

type FilterKey = "all" | BundleGoal;

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "fat-loss", label: "Cut" },
  { key: "muscle-gain", label: "Build" },
  { key: "recomp", label: "Recomp" },
  { key: "strength", label: "Strength" },
  { key: "conditioning", label: "Conditioning" },
  { key: "foundation", label: "Start" }
];

export function BundleGrid({
  bundles,
  locale
}: {
  bundles: Bundle[];
  locale: string;
}) {
  const [active, setActive] = useState<FilterKey>("all");
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
        aria-label="Filter bundles by goal"
      >
        {FILTERS.map((f) => {
          const count = counts[f.key] ?? 0;
          if (f.key !== "all" && count === 0) return null;
          const isActive = active === f.key;
          return (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(f.key)}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-cyan-300/60 bg-cyan-300/[0.12] text-cyan-50"
                  : "border-white/[0.08] bg-white/[0.02] text-bright/80 hover:border-cyan-300/30 hover:text-cyan-100"
              }`}
            >
              {f.label}
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
          <BundleCard key={bundle.slug} bundle={bundle} locale={locale} index={i} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          No bundles match this filter yet.
        </p>
      ) : null}
    </>
  );
}

/**
 * Pointer-tracked 3D tilt + cursor-following glare. Direct-DOM updates (no
 * React re-render per pixel) and gated by motion-safe so OS reduced-motion
 * fully disables the effect.
 */
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (!el) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (0.5 - y) * 7;
        const tiltY = (x - 0.5) * 9;
        el.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
        el.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`);
        el.style.setProperty("--glare-opacity", "1");
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
      el.style.setProperty("--glare-opacity", "0");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return ref;
}

/**
 * Fade + lift in when the card scrolls into view. Uses IntersectionObserver
 * once per card. Triggers when 18% visible — far enough that the user is
 * looking, close enough to feel responsive.
 */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, shown };
}

function BundleCard({
  bundle,
  locale,
  index
}: {
  bundle: Bundle;
  locale: string;
  index: number;
}) {
  const detailHref = `/${locale}/bundles/${bundle.slug}`;
  const downloadHref = `/api/bundles/download/${bundle.slug}`;
  const isFree = bundle.save.toLowerCase() === "free";
  const tiltRef = useTilt();
  const reveal = useReveal();

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
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70 transition-[opacity,transform] duration-500 group-hover:opacity-100 motion-safe:group-hover:scale-[1.04]"
            style={{ backgroundImage: `url(${bundle.heroImage})` }}
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
              aria-label={`Goal: ${bundle.goalLabel}`}
            >
              {bundle.goalLabel}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur ${
                isFree
                  ? "border border-white/20 bg-white/[0.08] text-white/85"
                  : "border border-cyan-300/40 bg-cyan-300/[0.12] text-cyan-50"
              }`}
              aria-label={`Price: ${bundle.save}`}
            >
              {bundle.save}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-[1] h-24 bg-[linear-gradient(180deg,rgba(8,8,11,0)_0%,rgba(8,8,11,0.85)_100%)]" />
        </div>

        <div className="relative z-[2] flex flex-1 flex-col p-5">
          <h2 className="text-lg font-bold leading-tight text-white">{bundle.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-bright/85">{bundle.hook}</p>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
              <dt className="text-faint">Duration</dt>
              <dd className="mt-0.5 font-semibold text-white">{bundle.weeks} weeks</dd>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
              <dt className="text-faint">Sessions</dt>
              <dd className="mt-0.5 font-semibold text-white">
                {bundle.sessionsPerWeek}×/wk
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-muted">
            {bundle.programTitle} <span className="text-faint">+</span> {bundle.dietTitle}
          </p>

          <div className="mt-auto flex items-center gap-3 pt-5">
            <a
              href={downloadHref}
              aria-label={`Download ${bundle.name} PDF`}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-4 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.22)] transition-[transform,filter,box-shadow] duration-150 hover:brightness-110 hover:shadow-[0_0_32px_rgba(34,211,238,0.32)] motion-safe:active:scale-[0.97]"
            >
              <FileDown className="h-4 w-4" aria-hidden />
              Download PDF
            </a>
            <Link
              href={detailHref}
              aria-label={`Open ${bundle.name} details`}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-full border border-cyan-300/20 px-3.5 py-2.5 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-300/40 hover:text-cyan-100"
            >
              Details
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>

          <p className="mt-3 text-[10px] text-faint">
            {isFree
              ? "Free with sign-in · branded dossier · A4 print-ready"
              : "Sign in required · branded dossier · A4 print-ready"}
          </p>
        </div>
      </article>
    </div>
  );
}
