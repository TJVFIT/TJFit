"use client";

import { Check, FileDown, Share2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // One-frame delay so the initial scale (1.28) paints before we animate
    // to the resting scale (1.15). Without this the transition would skip.
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  return (
    <div
      ref={ref}
      className="relative mt-6 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-cyan-400/20 shadow-[0_0_44px_rgba(34,211,238,0.08)]"
      style={{ "--parallax-y": "0px" } as React.CSSProperties}
      aria-hidden
    >
      <div
        className="absolute inset-0 bg-cover bg-center will-change-transform motion-safe:transition-transform"
        style={{
          backgroundImage: `url(${image})`,
          transform: `translate3d(0, var(--parallax-y), 0) scale(${mounted ? 1.15 : 1.28})`,
          transitionDuration: "1800ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      />
      {/* Top-right cyan glow that stays put while the image drifts */}
      <div
        className="pointer-events-none absolute inset-0 motion-safe:transition-opacity motion-safe:duration-[1800ms]"
        style={{
          background:
            "radial-gradient(50% 60% at 82% 18%, rgba(34,211,238,0.22), transparent 70%)",
          opacity: mounted ? 1 : 0.4
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(8,8,11,0)_0%,rgba(8,8,11,0.85)_100%)]" />
    </div>
  );
}

/**
 * Animated phase strip: 3 cards with pointer 3D tilt, staggered scroll
 * reveal, a connecting hairline that DRAWS IN left→right when the strip
 * enters view, and a cyan tracer dot that travels along the line once.
 */
export function PhaseStrip({
  phases
}: {
  phases: Array<{ name: string; focus: string }>;
}) {
  const reveal = useReveal<HTMLDivElement>({ threshold: 0.25 });

  return (
    <div ref={reveal.ref} className="relative mt-6 grid gap-4 sm:grid-cols-3">
      {/* Hairline connector — drawn left→right via scaleX once revealed */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 origin-left rtl:origin-right sm:block"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(34,211,238,0.18) 12%, rgba(34,211,238,0.32) 50%, rgba(34,211,238,0.18) 88%, transparent)",
          transform: reveal.shown ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 1100ms cubic-bezier(0.2, 1, 0.3, 1) 100ms"
        }}
      />
      {/* Cyan tracer dot — travels along the connector left→right once on reveal */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 sm:block"
      >
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
          style={{
            // Logical inset so the tracer travels start→end — left→right in
            // LTR, right→left in RTL — without needing the locale here.
            insetInlineStart: reveal.shown ? "calc(100% - 10px)" : "0px",
            background:
              "radial-gradient(circle, rgba(165,243,252,1) 0%, rgba(34,211,238,0.9) 50%, transparent 70%)",
            boxShadow:
              "0 0 18px rgba(34,211,238,0.9), 0 0 36px rgba(34,211,238,0.5)",
            opacity: reveal.shown ? 0 : 1,
            transition: reveal.shown
              ? "inset-inline-start 1400ms cubic-bezier(0.2, 1, 0.3, 1) 200ms, opacity 700ms ease-out 1500ms"
              : "none"
          }}
        />
      </div>
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
 * Tilted "At a glance" aside — pointer-tracked 3D rotation with a cyan
 * cursor-following glare and a soft ambient ring that pulses behind the card.
 */
export function AtAGlance({
  rows,
  title
}: {
  rows: Array<{ label: string; value: string }>;
  title: string;
}) {
  const tiltRef = useTilt<HTMLDivElement>({ maxX: 4, maxY: 5 });

  return (
    <aside className="relative" style={{ perspective: "1000px" }}>
      {/* Ambient cyan halo behind the card — slow pulse */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 hidden motion-safe:block"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(34,211,238,0.10), transparent 70%)",
          filter: "blur(28px)",
          animation: "tj-chip-pulse 6s ease-in-out infinite"
        }}
      />
      <div
        ref={tiltRef}
        className="relative rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.05),rgba(34,211,238,0.01))] p-5 transition-[border-color,box-shadow] duration-300 hover:border-cyan-300/40 hover:shadow-[0_0_44px_rgba(34,211,238,0.16)]"
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
              "transform 260ms cubic-bezier(0.2,1,0.3,1), border-color 220ms, box-shadow 260ms"
          } as React.CSSProperties
        }
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-screen"
          style={{
            background:
              "radial-gradient(160px circle at var(--glare-x) var(--glare-y), rgba(34,211,238,0.18), transparent 70%)",
            opacity: "var(--glare-opacity)",
            transition: "opacity 220ms ease-out"
          }}
        />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200/80">
          {title}
        </p>
        <dl className="relative mt-4 space-y-3 text-sm">
          {rows.map((row, i) => {
            const isLast = i === rows.length - 1;
            return (
              <div
                key={row.label}
                className={`flex items-baseline justify-between gap-3 ${isLast ? "" : "border-b border-white/[0.06] pb-3"}`}
              >
                <dt className="text-faint">{row.label}</dt>
                <dd className="text-right font-semibold text-white">{row.value}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </aside>
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
  label,
  ariaLabel,
  className = "",
  full = false
}: {
  href: string;
  label: string;
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
      className={`tj-cta-sheen relative inline-flex min-h-[48px] ${full ? "w-full" : ""} items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-5 py-2.5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.22)] hover:brightness-110 hover:shadow-[0_0_36px_rgba(34,211,238,0.36)] motion-safe:active:scale-[0.97] ${full ? "sm:w-auto" : ""} ${className}`}
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
      <span className="relative">{label}</span>
    </a>
  );
}

/**
 * Share button — Web Share API on supporting devices, copy-to-clipboard
 * fallback elsewhere. Brief "Copied!" affordance shown on success.
 */
export function ShareButton({
  title,
  ariaLabel,
  labels
}: {
  title: string;
  ariaLabel?: string;
  labels: { idle: string; shared: string; copied: string };
}) {
  const [state, setState] = useState<"idle" | "shared" | "copied">("idle");

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title, url });
        setState("shared");
      } else if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(url);
        setState("copied");
      } else {
        // Last-resort fallback: select an input and document.execCommand("copy").
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setState("copied");
      }
    } catch {
      /* user dismissed share sheet or denied clipboard — no-op */
      return;
    }
    window.setTimeout(() => setState("idle"), 1800);
  };

  const label =
    state === "copied" ? labels.copied : state === "shared" ? labels.shared : labels.idle;
  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={ariaLabel ?? `Share ${title}`}
      className={`tj-cta-sheen inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition-[border-color,color,box-shadow] motion-safe:active:scale-[0.97] ${
        state === "idle"
          ? "border-white/15 text-bright hover:border-cyan-300/35 hover:text-cyan-100 hover:shadow-[0_0_24px_rgba(34,211,238,0.16)]"
          : "border-cyan-300/45 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.22)]"
      }`}
    >
      {state === "idle" ? (
        <Share2 className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Check className="h-3.5 w-3.5" aria-hidden />
      )}
      {label}
    </button>
  );
}

/**
 * Sticky mobile purchase bar. On the long bundle detail page the hero
 * Download CTA scrolls away while the visitor reads phases / sample day /
 * nutrition — this keeps the action one tap away. Slides up once the user
 * has scrolled past the hero, and tucks away near the footer so it never
 * fights the in-page "Ready to start" CTA. Mobile only (md:hidden); the
 * slide is motion-safe gated (reduced-motion users get an instant snap).
 */
export function StickyBuyBar({
  name,
  href,
  label,
  ariaLabel
}: {
  name: string;
  href: string;
  label: string;
  ariaLabel: string;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const nearFooter = window.innerHeight + y > docHeight - 280;
      setShown(y > 560 && !nearFooter);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-400/20 bg-[#0A0A0B]/92 backdrop-blur-md ease-[cubic-bezier(0.2,1,0.3,1)] motion-safe:transition-[transform,opacity] motion-safe:duration-300 md:hidden"
      style={{
        paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))",
        transform: shown ? "translateY(0)" : "translateY(110%)",
        opacity: shown ? 1 : 0,
        pointerEvents: shown ? "auto" : "none"
      }}
      aria-hidden={!shown}
    >
      <div className="flex items-center gap-3 px-4 pt-2.5">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{name}</p>
        <a
          href={href}
          aria-label={ariaLabel}
          tabIndex={shown ? 0 : -1}
          className="tj-cta-sheen inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_24px_rgba(34,211,238,0.26)] hover:brightness-110 motion-safe:active:scale-[0.97]"
        >
          <FileDown className="h-4 w-4" aria-hidden />
          {label}
        </a>
      </div>
    </div>
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
