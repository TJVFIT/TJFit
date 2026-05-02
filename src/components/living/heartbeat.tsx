"use client";

import { useEffect, useRef, useState } from "react";

import { useDevice } from "@/lib/device/DeviceContext";

// The site's heartbeat — a 1-2px ECG line at the very top of every
// page. Per master upgrade prompt v3, Phase 3:
//   - cyan, very low opacity (≈10%)
//   - default rhythm 60 BPM (= 1.0s per beat)
//   - active state briefly speeds to 80 BPM after a workout-set complete
//   - hidden on `prefers-reduced-motion: reduce`
//   - static line on Low tier (no animation)
//   - travels left→right LTR, right→left in RTL
//
// The line is rendered as an SVG path and animated via stroke-dashoffset.
// Variable rhythm by listening for a custom DOM event:
//   `tjfit:heartbeat-pulse` — speeds up briefly (8 seconds) then settles
//
// Consumers fire it like:
//   window.dispatchEvent(new CustomEvent("tjfit:heartbeat-pulse"))
// after meaningful actions (set complete, plan saved, milestone hit).

type Rhythm = "rest" | "active";

const REST_BPM = 60;
const ACTIVE_BPM = 80;
const ACTIVE_HOLD_MS = 8000;

// Tiny ECG path — flat baseline with one QRS-style spike. Each
// "beat" loops the dash offset across the path so the spike
// appears to scroll across the screen.
const ECG_PATH =
  "M0 8 L 60 8 L 64 8 L 70 4 L 76 13 L 80 6 L 84 8 L 200 8";
const PATH_LENGTH = 200;

export function Heartbeat() {
  const { prefersReducedMotion, tier } = useDevice();
  const [rhythm, setRhythm] = useState<Rhythm>("rest");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = () => {
      setRhythm("active");
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setRhythm("rest");
      }, ACTIVE_HOLD_MS);
    };
    window.addEventListener("tjfit:heartbeat-pulse", handler);
    return () => {
      window.removeEventListener("tjfit:heartbeat-pulse", handler);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  if (prefersReducedMotion) return null;

  const isLow = tier === "low";
  const bpm = rhythm === "active" ? ACTIVE_BPM : REST_BPM;
  const beatDurationMs = (60 / bpm) * 1000;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] overflow-hidden mix-blend-screen"
      style={{ opacity: 0.45 }}
    >
      <svg
        viewBox={`0 0 ${PATH_LENGTH} 16`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        // RTL flip — heartbeat travels right→left when document is RTL.
        // CSS's `[dir="rtl"]` selector on a parent reaches this via
        // a logical scaleX, set per [dir] attribute.
        className="block h-full w-full rtl:[transform:scaleX(-1)]"
      >
        <path
          d={ECG_PATH}
          fill="none"
          stroke="#22D3EE"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          // The stroke-dasharray + offset is what creates the
          // "scrolling pulse" feel. On Low tier we skip the
          // animation entirely and render a flat dim line.
          style={
            isLow
              ? { opacity: 0.4 }
              : {
                  strokeDasharray: `${PATH_LENGTH * 0.18} ${PATH_LENGTH}`,
                  strokeDashoffset: 0,
                  animation: `tj-heartbeat ${beatDurationMs}ms linear infinite`
                }
          }
        />
      </svg>
      {/* Inline keyframes — kept here so the component is fully
          self-contained and can be dropped into any layout without
          editing globals.css. */}
      <style>{`
        @keyframes tj-heartbeat {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -${PATH_LENGTH}; }
        }
      `}</style>
    </div>
  );
}
