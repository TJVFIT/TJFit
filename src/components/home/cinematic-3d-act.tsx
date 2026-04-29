"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Cinematic3DSceneImpl = dynamic(
  () => import("./cinematic-3d-impl").then((m) => m.Cinematic3DSceneImpl),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.18),transparent_60%)]"
        aria-hidden
      />
    )
  }
);

/**
 * Cinematic 3D act — second wow moment after the hero.
 * R3F scene lazy-loads the first time the section enters the viewport (or close to it),
 * so the homepage's first paint cost is unaffected.
 */
export function Cinematic3DAct() {
  const ref = useRef<HTMLElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldRender(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "320px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative isolate min-h-[80vh] overflow-hidden border-y border-white/[0.05] bg-[#06080d] px-6 py-24 sm:py-32 lg:px-12"
      aria-labelledby="cinematic-3d-headline"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_55%_at_70%_40%,rgba(34,211,238,0.08),transparent_65%)]"
        aria-hidden
      />
      <div className="absolute inset-0 z-[1]" aria-hidden>
        {shouldRender ? <Cinematic3DSceneImpl /> : null}
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(0,0,0,0.62)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/85">
          Engineered intelligence
        </p>
        <h2
          id="cinematic-3d-headline"
          className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-[64px]"
        >
          Your transformation,
          <br />
          <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
            computed in real time.
          </span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          25 signals. 12-week periodization. Adaptive macros. TJAI runs the math
          so every set, meal, and recovery beat lands at the moment your body can
          absorb it.
        </p>
      </div>
    </section>
  );
}
