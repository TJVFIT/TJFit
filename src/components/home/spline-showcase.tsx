"use client";

import { useEffect, useRef, useState } from "react";

import { TJHeroStage } from "@/components/3d/hero-stage";

// Spline integration temporarily stubbed (2026-05-02). The
// `@splinetool/react-spline` 4.x `package.json` exports field exposes
// only `import` (ESM) conditions, and the Next 14.2 webpack resolver
// rejects both the root `.` and `./next` subpaths at build time
// ("Package path X is not exported"). Adding the package to
// `transpilePackages` did not help.
//
// Until the package ships a CJS export or we move to a bundler that
// honors ESM-only exports here, the section renders the TJHeroStage
// dumbbell variant unconditionally — visitors still see a polished
// interactive 3D moment, and the `sceneUrl`/`NEXT_PUBLIC_SPLINE_HERO_SCENE`
// API is preserved for future re-enable.
//
// To re-enable, restore the dynamic import + the conditional render:
//   const Spline = dynamic(
//     () => import("@splinetool/react-spline/next").then((m) => m.default),
//     { ssr: false, loading: () => null }
//   );
//   const useSpline = Boolean(sceneUrl ?? process.env.NEXT_PUBLIC_SPLINE_HERO_SCENE);

type Props = {
  /** Reserved for future Spline re-enable; ignored while the integration is stubbed. */
  sceneUrl?: string;
};

/**
 * Interactive 3D showcase — the third wow moment of the homepage.
 * Currently renders the TJHeroStage dumbbell variant in all cases
 * (Spline integration stubbed; see top-of-file comment).
 */
export function SplineShowcase(_props: Props) {
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
      aria-labelledby="spline-showcase-headline"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_40%,rgba(56,189,248,0.10),transparent_60%)]"
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/85">
          Touch the system
        </p>
        <h2
          id="spline-showcase-headline"
          className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-[60px]"
        >
          Move your cursor.
          <br />
          <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            The system responds.
          </span>
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          TJAI reads your inputs the same way this 3D coach reads your cursor —
          every signal you give shapes the plan that comes back.
        </p>
      </div>
    </section>
  );
}
