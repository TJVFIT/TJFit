"use client";

import { useEffect, useState } from "react";

type IntroStage = "init" | "t" | "j" | "fit" | "glow" | "exit";

export function LogoIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<IntroStage>("init");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = window.setTimeout(() => onComplete(), 500);
      return () => window.clearTimeout(t);
    }
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStage("t"), 0));
    timers.push(window.setTimeout(() => setStage("j"), 300));
    timers.push(window.setTimeout(() => setStage("fit"), 600));
    timers.push(window.setTimeout(() => setStage("glow"), 900));
    timers.push(window.setTimeout(() => setStage("exit"), 1600));
    timers.push(
      window.setTimeout(() => {
        setHidden(true);
        onComplete();
      }, 2000)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onComplete]);

  if (hidden) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#09090B] transition-opacity duration-200 ${stage === "exit" ? "opacity-0" : "opacity-100"}`}>
      <div
        className={`select-none text-center transition-[transform,opacity,filter] duration-400 ${
          stage === "exit" ? "scale-[0.6] opacity-0 blur-[8px]" : "scale-100 opacity-100 blur-0"
        }`}
      >
        <div className="flex items-end justify-center gap-3">
          <span
            className={`text-[72px] font-extrabold leading-none transition-[transform,opacity,color,filter] duration-400 ${
              stage === "t" || stage === "j" || stage === "fit" || stage === "glow" || stage === "exit" ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
            } ${stage === "glow" || stage === "exit" ? "text-[#22D3EE] [filter:drop-shadow(0_0_20px_rgba(34,211,238,0.8))]" : "text-white"}`}
          >
            T
          </span>
          <span
            className={`text-[72px] font-extrabold leading-none transition-[transform,opacity,color,filter] duration-400 ${
              stage === "j" || stage === "fit" || stage === "glow" || stage === "exit" ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            } ${stage === "glow" || stage === "exit" ? "text-[#22D3EE] [filter:drop-shadow(0_0_20px_rgba(34,211,238,0.8))]" : "text-white"}`}
            style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            J
          </span>
        </div>
        <div
          className={`mt-1 text-[28px] font-semibold tracking-[0.28em] transition-[opacity,transform,color] duration-300 ${
            stage === "fit" || stage === "glow" || stage === "exit" ? "scale-100 opacity-100" : "scale-90 opacity-0"
          } ${stage === "glow" || stage === "exit" ? "text-[rgba(34,211,238,0.7)]" : "text-[#A1A1AA]"}`}
        >
          FIT
        </div>
      </div>
    </div>
  );
}

