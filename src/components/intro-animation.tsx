"use client";

import { useEffect, useState } from "react";

import { subscribeToMediaQueryChange } from "@/lib/media-query-list";

/**
 * Premium intro — editorial, not arcade.
 *
 * Sequence (reduce-motion: everything collapses to a 400ms dissolve):
 *   000ms  Obsidian + radial champagne wash fades in
 *   220ms  "TJ" monogram strokes draw in (stroke-dasharray sweep, champagne)
 *  1000ms  Monogram fills with champagne→roseGold gradient
 *  1300ms  Wordmark "TJFIT" fades up, letters tracked apart
 *  1700ms  Eyebrow "AI FITNESS INTELLIGENCE" slides in, champagne hairline
 *  2100ms  Champagne shimmer wipes diagonally across wordmark
 *  2800ms  Whole overlay fades out
 *  3300ms  onComplete — hero takes over
 */

const CHAMPAGNE = "#d4a574";
const CHAMPAGNE_HI = "#e8c79c";
const ROSE_GOLD = "#f0b89a";
const OBSIDIAN = "#08080a";

type Phase = "enter" | "draw" | "fill" | "settled" | "shimmer" | "exit";

function useReduceMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(mq.matches);
    return subscribeToMediaQueryChange(mq, () => setR(mq.matches));
  }, []);
  return r;
}

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const reduce = useReduceMotion();
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    if (reduce) {
      const t1 = window.setTimeout(() => setPhase("settled"), 60);
      const t2 = window.setTimeout(() => setPhase("exit"), 260);
      const t3 = window.setTimeout(() => onComplete(), 720);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
      };
    }
    const timers = [
      window.setTimeout(() => setPhase("draw"), 220),
      window.setTimeout(() => setPhase("fill"), 1000),
      window.setTimeout(() => setPhase("settled"), 1300),
      window.setTimeout(() => setPhase("shimmer"), 2100),
      window.setTimeout(() => setPhase("exit"), 2800),
      window.setTimeout(() => onComplete(), 3300)
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduce, onComplete]);

  const strokeReady = phase !== "enter";
  const filled = phase === "fill" || phase === "settled" || phase === "shimmer" || phase === "exit";
  const wordVisible = phase === "settled" || phase === "shimmer" || phase === "exit";
  const shimmerOn = phase === "shimmer";
  const exiting = phase === "exit";

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: OBSIDIAN,
        overflow: "hidden",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {/* Champagne radial wash */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 46%, rgba(212,165,116,0.14) 0%, transparent 62%)"
        }}
      />
      {/* Editorial hairlines */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "16%",
          width: 1,
          height: 96,
          background: "linear-gradient(180deg, transparent, rgba(212,165,116,0.36))",
          transform: "translateX(-50%)",
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 0.6s ease 0.1s"
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "18%",
          width: 1,
          height: 96,
          background: "linear-gradient(0deg, transparent, rgba(212,165,116,0.36))",
          transform: "translateX(-50%)",
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 0.6s ease 0.1s"
        }}
      />

      {/* Stage */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/* Monogram: stroke-draw then gradient fill */}
        <svg
          width="124"
          height="124"
          viewBox="0 0 200 200"
          style={{
            transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1)",
            transform: strokeReady ? "scale(1)" : "scale(0.82)"
          }}
        >
          <defs>
            <linearGradient id="intro-champagne" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={CHAMPAGNE_HI} />
              <stop offset="55%" stopColor={CHAMPAGNE} />
              <stop offset="100%" stopColor={ROSE_GOLD} />
            </linearGradient>
          </defs>

          {/* Outer frame */}
          <rect
            x="14"
            y="14"
            width="172"
            height="172"
            rx="4"
            fill="none"
            stroke={CHAMPAGNE}
            strokeWidth="1"
            strokeOpacity={strokeReady ? 0.35 : 0}
            style={{ transition: "stroke-opacity 0.6s ease 0.3s" }}
          />

          {/* T — vertical + crossbar */}
          <path
            d="M 62 54 L 138 54 M 100 54 L 100 150"
            fill="none"
            stroke="url(#intro-champagne)"
            strokeWidth={filled ? 10 : 3}
            strokeLinecap="square"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: strokeReady ? 0 : 300,
              transition:
                "stroke-dashoffset 0.85s cubic-bezier(0.22,1,0.36,1), stroke-width 0.4s ease"
            }}
          />

          {/* J — descender hook */}
          <path
            d="M 132 54 L 132 130 Q 132 150 112 150 Q 96 150 96 134"
            fill="none"
            stroke="url(#intro-champagne)"
            strokeWidth={filled ? 10 : 3}
            strokeLinecap="square"
            strokeLinejoin="miter"
            style={{
              strokeDasharray: 260,
              strokeDashoffset: strokeReady ? 0 : 260,
              transition:
                "stroke-dashoffset 0.95s cubic-bezier(0.22,1,0.36,1) 0.12s, stroke-width 0.4s ease"
            }}
          />

          {/* Subtle cyan accent dot at the J hook */}
          <circle
            cx="96"
            cy="134"
            r="2.2"
            fill="#22D3EE"
            opacity={filled ? 1 : 0}
            style={{ transition: "opacity 0.4s ease 0.2s", filter: "drop-shadow(0 0 4px #22D3EE)" }}
          />
        </svg>

        {/* Wordmark */}
        <div
          style={{
            marginTop: 18,
            position: "relative",
            opacity: wordVisible ? 1 : 0,
            transform: wordVisible ? "translateY(0)" : "translateY(12px)",
            transition:
              "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)"
          }}
        >
          <div
            style={{
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: "0.24em",
              lineHeight: 1,
              backgroundImage: `linear-gradient(90deg, #F6F3ED 0%, ${CHAMPAGNE_HI} 45%, #F6F3ED 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              position: "relative"
            }}
          >
            TJFIT
            {/* Shimmer overlay */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.65) 48%, transparent 66%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                transform: shimmerOn ? "translateX(120%)" : "translateX(-120%)",
                transition: shimmerOn ? "transform 0.9s cubic-bezier(0.22,1,0.36,1)" : "none",
                pointerEvents: "none"
              }}
            >
              TJFIT
            </span>
          </div>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            marginTop: 14,
            fontSize: 10,
            fontWeight: 600,
            color: CHAMPAGNE,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            opacity: wordVisible ? 0.9 : 0,
            transform: wordVisible ? "translateY(0)" : "translateY(6px)",
            transition:
              "opacity 0.6s ease 0.12s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.12s"
          }}
        >
          AI · FITNESS · INTELLIGENCE
        </div>
      </div>

      {/* Bottom wordmark credit */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 28,
          transform: "translateX(-50%)",
          fontSize: 9,
          letterSpacing: "0.3em",
          color: "rgba(246,243,237,0.4)",
          textTransform: "uppercase",
          opacity: wordVisible ? 1 : 0,
          transition: "opacity 0.6s ease 0.3s"
        }}
      >
        Est · tjfit.com
      </div>
    </div>
  );
}
