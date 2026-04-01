"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ClientErrorBoundary } from "@/components/client-error-boundary";
import type { HeroMouseRef } from "@/components/luxury/luxury-hero-3d-canvas";

function Hero3DBackdropSkeleton() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] bg-[#0A0A0B]" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.09),transparent),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(167,139,250,0.06),transparent)]" />
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-cyan-500/[0.07] via-transparent to-violet-500/[0.07]" />
    </div>
  );
}

function Hero3DBackdropFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,211,238,0.07),transparent),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(167,139,250,0.04),transparent)]" />
    </div>
  );
}

const LuxuryHero3DCanvas = dynamic(
  () => import("@/components/luxury/luxury-hero-3d-canvas").then((m) => m.LuxuryHero3DCanvas),
  {
    ssr: false,
    loading: () => <Hero3DBackdropSkeleton />
  }
);

/**
 * Client-only WebGL hero backdrop. Heavy chunk loads only when this tree mounts.
 * Parent should only mount on lg+ and when reduced-motion is off.
 */
export function LuxuryHero3DExperience({ mouseRef }: { mouseRef: HeroMouseRef }) {
  return (
    <ClientErrorBoundary sentryScope="home-hero-3d" fallback={<Hero3DBackdropFallback />}>
      <Suspense fallback={<Hero3DBackdropSkeleton />}>
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <LuxuryHero3DCanvas mouseRef={mouseRef} />
        </div>
      </Suspense>
    </ClientErrorBoundary>
  );
}
