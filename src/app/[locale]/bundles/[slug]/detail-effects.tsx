"use client";

import { FileDown } from "lucide-react";
import type { ReactNode } from "react";

import { useParallax, useReveal, useTilt } from "@/components/effects/use-3d";
import { useMagnetic, useMergedRef, useRipple } from "@/components/effects/use-magnetic";

/**
 * Hero banner with scroll-linked parallax: the background image shifts up to
 * ~25% of the viewport height as the user scrolls past, creating depth
 * without the lag of fixed-position backgrounds. The cyan inner-glow + the
 * bottom-fade gradient stay anchored to the frame so the content edge stays
 * crisp.
 */
export function DetailHero({ image }: { image: string }) {
  const ref = useParallax<HTMLDivElement>({ strength: 0.18 });

  return (
    <div
      ref={ref}
      className="relative mt-6 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-cyan-400/20 shadow-[0_0_44px_rgba(34,211,238,0.08)]"
      style={{ "--parallax-y": "0px" } as React.CSSProperties}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: `url(${image})`,
          transform: "translate3d(0, var(--parallax-y), 0) scale(1.15)"
        }}
      />
      {/* Top-right cyan glow that stays put while the image drifts */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 60% at 82% 18%, rgba(34,211,238,0.22), transparent 70%)"
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(8,8,11,0)_0%,rgba(8,8,11,0.85)_100%)]" />
    </div>
  );
}

/**
 * Animated phase strip: 3 cards with pointer 3D tilt, staggered scroll
 * reveal, and a vertical connecting hairline that fills as cards enter view.
 * The connector lives behind the cards so it feels like one continuous arc
 * binding the three phases together.
 */
export function PhaseStrip({
  phases
}: {
  phases: Array<{ name: string; focus: string }>;
}) {
  return (
    <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
      {/* Connector — visible on sm+ where cards sit side-by-side */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 sm:block"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(34,211,238,0.18) 12%, rgba(34,211,238,0.32) 50%, rgba(34,211,238,0.18) 88%, transparent)"
        }}
      />
      {phases.map((phase, i) => (
        <PhaseCard key={phase.name} phase={phase} index={i} />
      ))}
    </div>
  );
}

function PhaseCard({
  phase,
  index
}: {
  phase: { name: string; focus: string };
  index: number;
}) {
  const reveal = useReveal<HTMLDivElement>();
  const tiltRef = useTilt<HTMLDivElement>({ maxX: 5, maxY: 6 });
  const revealDelay = `${index * 110}ms`;

  return (
    <div
      ref={reveal.ref}
      style={{
        opacity: reveal.shown ? 1 : 0,
        transform: reveal.shown ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 540ms cubic-bezier(0.2,1,0.3,1) ${revealDelay}, transform 540ms cubic-bezier(0.2,1,0.3,1) ${revealDelay}`,
        perspective: "1000px"
      }}
    >
      <div
        ref={tiltRef}
        className="relative h-full overflow-hidden rounded-2xl border border-divider bg-surface/40 p-4 transition-[border-color,box-shadow] duration-300 hover:border-cyan-300/40 hover:shadow-[0_0_36px_rgba(34,211,238,0.12)]"
        style={
          {
            "--tilt-x": "0deg",
            "--tilt-y": "0deg",
            "--glare-x": "50%",
            "--glare-y": "50%",
            "--glare-opacity": "0",
            transform:
              "perspective(1000px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))",
            transformStyle: "preserve-3d",
            transition:
              "transform 240ms cubic-bezier(0.2,1,0.3,1), border-color 200ms, box-shadow 240ms"
          } as React.CSSProperties
        }
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-screen"
          style={{
            background:
              "radial-gradient(150px circle at var(--glare-x) var(--glare-y), rgba(34,211,238,0.18), transparent 70%)",
            opacity: "var(--glare-opacity)",
            transition: "opacity 220ms ease-out"
          }}
        />

        {/* Phase number watermark */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-2 font-display text-5xl font-extrabold leading-none tracking-tight text-cyan-200/[0.06]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
          {phase.name}
        </p>
        <p className="relative mt-3 text-sm leading-relaxed text-bright/85">
          {phase.focus}
        </p>
      </div>
    </div>
  );
}

/**
 * Magnetic + ripple Download PDF button. Two flavors:
 *   variant="primary"   — main hero CTA, wider with metric label
 *   variant="compact"   — same gradient, sized for inline use
 *
 * Both use the same gradient pill shape; the magnetic pull, cyan ripple,
 * and active-scale are identical so the button feels consistent everywhere.
 */
export function DownloadButton({
  href,
  ariaLabel,
  className = "",
  full = false
}: {
  href: string;
  ariaLabel?: string;
  className?: string;
  full?: boolean;
}) {
  const magnetic = useMagnetic<HTMLAnchorElement>({ strength: 6, max: 9 });
  const ripple = useRipple<HTMLAnchorElement>();
  const ref = useMergedRef<HTMLAnchorElement>(magnetic, ripple);

  return (
    <a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      className={`relative inline-flex min-h-[48px] ${full ? "w-full" : ""} items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-5 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.22)] hover:brightness-110 hover:shadow-[0_0_36px_rgba(34,211,238,0.36)] motion-safe:active:scale-[0.97] ${full ? "sm:w-auto" : ""} ${className}`}
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
      <span className="relative">Download PDF</span>
    </a>
  );
}

/**
 * Generic reveal wrapper — used to fade-up sections (nutrition, sample,
 * footer CTA) as the user scrolls.
 */
export function RevealSection({
  children,
  delay = 0
}: {
  children: ReactNode;
  delay?: number;
}) {
  const reveal = useReveal<HTMLDivElement>({ threshold: 0.1 });
  return (
    <div
      ref={reveal.ref}
      style={{
        opacity: reveal.shown ? 1 : 0,
        transform: reveal.shown ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 620ms cubic-bezier(0.2,1,0.3,1) ${delay}ms, transform 620ms cubic-bezier(0.2,1,0.3,1) ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
