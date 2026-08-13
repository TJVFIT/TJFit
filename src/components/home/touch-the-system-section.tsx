"use client";

import { useEffect, useRef, useState } from "react";

import { TJHeroStage } from "@/components/3d/hero-stage";

/**
 * Interactive 3D showcase — the third wow moment of the homepage.
 * Renders the TJHeroStage dumbbell variant once scrolled near the viewport.
 */
export function TouchTheSystemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "260px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[80vh] overflow-hidden border-y border-white/[0.05] bg-[#08090d] px-6 py-24 sm:py-32 lg:px-12"
      aria-labelledby="touch-the-system-headline"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_40%,rgba(167,139,250,0.10),transparent_60%)]"
        aria-hidden
      />

      <div className="absolute inset-0 z-[1]" aria-hidden>
        {inView ? (
          <TJHeroStage variant="dumbbell" pointerReactive intensity={0.95} speed={0.7} />
        ) : null}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(8,9,13,0.0)_0%,rgba(8,9,13,0.0)_55%,rgba(8,9,13,0.78)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-start">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.28em] text-purple-200/85 motion-safe:animate-[tj-fade-up_520ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
          style={{ animationDelay: "80ms" }}
        >
          Touch the system
        </p>
        <h2
          id="touch-the-system-headline"
          className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-[60px] motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
          style={{ animationDelay: "180ms" }}
        >
          Move your cursor.
          <br />
          <span className="bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent">
            The system responds.
          </span>
        </h2>
        <p
          className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg motion-safe:animate-[tj-fade-up_620ms_cubic-bezier(0.2,1,0.3,1)_forwards] motion-safe:opacity-0"
          style={{ animationDelay: "320ms" }}
        >
          TJAI reads your inputs the same way this 3D coach reads your cursor —
          every signal you give shapes the plan that comes back.
        </p>
      </div>
    </section>
  );
}
