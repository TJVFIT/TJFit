"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type MutableRefObject } from "react";

import { ClientErrorBoundary } from "@/components/client-error-boundary";

export type HeroStageVariant = "scarab" | "dumbbell" | "nutrient" | "neural" | "curl-athlete";

type Props = {
  variant?: HeroStageVariant;
  pointerReactive?: boolean;
  intensity?: number;
  speed?: number;
  className?: string;
};

/**
 * The one visual every non-canvas path falls back to: loading, no WebGL, and
 * a thrown error all land here, so a failed stage is indistinguishable from a
 * stage that simply hasn't loaded yet.
 */
function StageFallback() {
  return (
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_65%_40%,rgba(168,85,247,0.16),transparent_60%)]"
      aria-hidden
    />
  );
}

const HeroStageImpl = dynamic(() => import("./hero-stage-impl").then((m) => m.HeroStageImpl), {
  ssr: false,
  loading: () => <StageFallback />
});

/**
 * WebGL availability, probed once per page load.
 *
 * react-three-fiber throws during render if it cannot get a WebGL context —
 * no WebGL at all, a blacklisted driver, too many live contexts, or a GPU
 * process that has crashed. Unguarded, that takes the whole route down. This
 * is the failure class that broke production on 2026-07-24.
 *
 * `null` = not yet probed (server, or first client render).
 */
let webglSupported: boolean | null = null;

function probeWebgl(): boolean {
  if (webglSupported !== null) return webglSupported;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    webglSupported = Boolean(gl);
    // Release the probe context immediately — browsers cap concurrent
    // contexts (~16), and leaking one per mount would starve the real stage.
    if (gl && "getExtension" in gl) {
      (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webglSupported = false;
  }
  return webglSupported;
}

/**
 * Drop-in hero 3D stage. Wraps the canvas impl with lazy client load and pointer tracking.
 * Safe to use on any page — renders nothing on SSR, zero cost if the client never loads.
 */
export function TJHeroStage({ variant = "scarab", pointerReactive = true, intensity = 1, speed = 1, className }: Props) {
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  // Starts false so the very first client render matches the server's markup
  // (which never has a canvas); the probe promotes it in an effect.
  const [canRender3d, setCanRender3d] = useState(false);

  useEffect(() => {
    setCanRender3d(probeWebgl());
  }, []);

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

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show3d = inView && canRender3d;

  return (
    <div ref={wrapRef} className={className ?? "absolute inset-0"} aria-hidden>
      {show3d ? (
        // A thrown scene must degrade to the gradient, never blank the route.
        <ClientErrorBoundary fallback={<StageFallback />} sentryScope="hero-stage-3d">
          <HeroStageImpl variant={variant} intensity={intensity} speed={speed} pointerRef={pointerRef} />
        </ClientErrorBoundary>
      ) : (
        <StageFallback />
      )}
    </div>
  );
}

export type HeroPointer = MutableRefObject<{ x: number; y: number }>;
