"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, type MutableRefObject } from "react";

export type HeroStageVariant = "scarab" | "dumbbell" | "nutrient" | "neural";

type Props = {
  variant?: HeroStageVariant;
  pointerReactive?: boolean;
  intensity?: number;
  speed?: number;
  className?: string;
};

const HeroStageImpl = dynamic(() => import("./hero-stage-impl").then((m) => m.HeroStageImpl), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_65%_40%,rgba(212,165,116,0.16),transparent_60%)]"
      aria-hidden
    />
  )
});

/**
 * Drop-in hero 3D stage. Wraps the canvas impl with lazy client load and pointer tracking.
 * Safe to use on any page — renders nothing on SSR, zero cost if the client never loads.
 */
export function TJHeroStage({ variant = "scarab", pointerReactive = true, intensity = 1, speed = 1, className }: Props) {
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!pointerReactive) return;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointerRef.current.x = nx;
      pointerRef.current.y = -ny;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerReactive]);

  return (
    <div className={className ?? "absolute inset-0"} aria-hidden>
      <HeroStageImpl variant={variant} intensity={intensity} speed={speed} pointerRef={pointerRef} />
    </div>
  );
}

export type HeroPointer = MutableRefObject<{ x: number; y: number }>;
