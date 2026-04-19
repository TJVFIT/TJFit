"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { BRAND } from "@/lib/brand-assets";
import { subscribeToMediaQueryChange } from "@/lib/media-query-list";

type IntroPhase = "enter" | "hold" | "exit";

const BACKDROP = "#09090B";
const CYAN = "#22D3EE";

function useMediaFlags() {
  const [flags, setFlags] = useState({ reduceMotion: false, compact: false });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactMq = window.matchMedia("(max-width: 479px)");

    const apply = () => {
      setFlags({
        reduceMotion: reduceMq.matches,
        compact: compactMq.matches
      });
    };

    apply();
    const offReduce = subscribeToMediaQueryChange(reduceMq, apply);
    const offCompact = subscribeToMediaQueryChange(compactMq, apply);

    return () => {
      offReduce();
      offCompact();
    };
  }, []);

  return flags;
}

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const { reduceMotion, compact } = useMediaFlags();
  const [phase, setPhase] = useState<IntroPhase>("enter");

  useEffect(() => {
    const holdAt = reduceMotion ? 40 : 1200;
    const exitAt = reduceMotion ? 80 : 2800;
    const completeAt = reduceMotion ? 120 : 3600;

    const holdTimer = window.setTimeout(() => setPhase("hold"), holdAt);
    const exitTimer = window.setTimeout(() => setPhase("exit"), exitAt);
    const completeTimer = window.setTimeout(() => onComplete(), completeAt);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, reduceMotion]);

  const ringSizes = useMemo(
    () => ({
      outer: compact ? 200 : 320,
      middle: compact ? 160 : 220,
      inner: compact ? 110 : 140
    }),
    [compact]
  );

  const sharedRingStyle: CSSProperties = {
    position: "absolute",
    borderRadius: "50%",
    inset: "50% auto auto 50%",
    transform: "translate(-50%, -50%)",
    willChange: "transform, opacity"
  };

  const ghostTextStyle = (position: "top" | "bottom"): CSSProperties => ({
    position: "absolute",
    fontSize: position === "top" ? "clamp(80px, 15vw, 160px)" : "clamp(60px, 10vw, 120px)",
    fontWeight: 900,
    color: "#ffffff",
    opacity: position === "top" ? 0.025 : 0.02,
    letterSpacing: "-0.05em",
    userSelect: "none",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    display: compact ? "none" : "block",
    ...(position === "top" ? { top: "20%", left: "-5%" } : { bottom: "15%", right: "-3%" })
  });

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: BACKDROP,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        opacity: phase === "exit" ? 0 : 1,
        transition: phase === "exit" ? "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          position: "absolute",
          width: compact ? 420 : 600,
          height: compact ? 420 : 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "orb-pulse 3s ease-in-out infinite",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          ...sharedRingStyle,
          width: ringSizes.outer,
          height: ringSizes.outer,
          border: "1px solid rgba(34,211,238,0.12)",
          animation: "spin-slow 20s linear infinite",
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 1s ease 0.3s"
        }}
      >
        {[0, 120, 240].map((deg, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: CYAN,
              boxShadow: "0 0 8px #22D3EE",
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translateX(${ringSizes.outer / 2 - 1}px) translate(-50%, -50%)`
            }}
          />
        ))}
      </div>

      <div
        style={{
          ...sharedRingStyle,
          width: ringSizes.middle,
          height: ringSizes.middle,
          border: "1px solid rgba(34,211,238,0.18)",
          animation: "spin-reverse 12s linear infinite",
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 1s ease 0.5s"
        }}
      >
        {[60, 200].map((deg, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: CYAN,
              boxShadow: "0 0 6px #22D3EE",
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translateX(${ringSizes.middle / 2 - 1}px) translate(-50%, -50%)`
            }}
          />
        ))}
      </div>

      <div
        style={{
          ...sharedRingStyle,
          width: ringSizes.inner,
          height: ringSizes.inner,
          border: "1px solid rgba(34,211,238,0.25)",
          animation: "spin-slow 7s linear infinite",
          opacity: phase === "enter" ? 0 : 1,
          transition: "opacity 1s ease 0.7s"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.35) 0%, rgba(34,211,238,0.08) 50%, transparent 70%)",
          boxShadow: "0 0 40px rgba(34,211,238,0.4), 0 0 80px rgba(34,211,238,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "core-pulse 2s ease-in-out infinite",
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "scale(0.6)" : "scale(1)",
          transition: "opacity 0.6s ease 0.2s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s"
        }}
      >
        <img
          src={BRAND.logoIcon}
          alt="TJFit"
          style={{
            width: 44,
            height: 44,
            objectFit: "contain",
            filter: "drop-shadow(0 0 16px rgba(34,211,238,0.32))"
          }}
          draggable={false}
        />
      </div>

      <div style={ghostTextStyle("top")}>INTELLIGENCE</div>
      <div style={ghostTextStyle("bottom")}>KINETIC</div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: 28,
          textAlign: "center",
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "translateY(16px)" : "translateY(0)",
          transition: "opacity 0.8s ease 0.6s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.6s"
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1
          }}
        >
          TJFit
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: CYAN,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginTop: 6
          }}
        >
          AI FITNESS PLATFORM
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)",
          animation: "scan-line 2s ease-in-out infinite",
          opacity: phase === "enter" ? 0 : 0.6,
          transition: "opacity 0.5s ease 1s"
        }}
      />

      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: phase === "enter" ? 0 : compact ? 0.2 : 0.4,
          transition: "opacity 1.2s ease 0.8s",
          pointerEvents: "none"
        }}
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {[
          [150, 120], [650, 100], [720, 320],
          [600, 480], [200, 450], [80, 300],
          [400, 150], [400, 450]
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="3" fill={CYAN} opacity="0.5" />
            <circle cx={cx} cy={cy} r="3" fill="none" stroke={CYAN} strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="3;15" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
              <animate attributeName="opacity" values="0.3;0" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" begin={`${i * 0.4}s`} />
            </circle>
          </g>
        ))}

        {[
          [150, 120, 400, 150],
          [400, 150, 650, 100],
          [650, 100, 720, 320],
          [720, 320, 600, 480],
          [600, 480, 400, 450],
          [400, 450, 200, 450],
          [200, 450, 80, 300],
          [80, 300, 150, 120],
          [400, 150, 400, 450],
          [150, 120, 600, 480]
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(34,211,238,0.12)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      <style>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes core-pulse {
          0%, 100% {
            box-shadow: 0 0 40px rgba(34,211,238,0.4), 0 0 80px rgba(34,211,238,0.15);
          }
          50% {
            box-shadow: 0 0 60px rgba(34,211,238,0.6), 0 0 120px rgba(34,211,238,0.25);
          }
        }
        @keyframes scan-line {
          0% { transform: translateY(-50vh); }
          100% { transform: translateY(50vh); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
