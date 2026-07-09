"use client";

import { useEffect, useState } from "react";

import Warp from "@/components/ui/warp";

/**
 * Site-wide animated shader backdrop. Fixed behind every page, brand
 * black/violet/purple only. Renders a still frame (speed 0) when the user
 * asks for reduced motion, and carries a dark veil so foreground copy keeps
 * contrast over the moving field.
 */
export function WarpBackground() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#09090b]" aria-hidden>
      {mounted && (
        <Warp
        style={{ width: "100%", height: "100%" }}
        colors={["#09090b", "#7c3aed", "#0a0a12", "#a855f7"]}
        proportion={0.5}
        softness={1}
        distortion={0.18}
        swirl={0.7}
        swirlIterations={8}
        shape="checks"
        shapeScale={0.08}
        scale={1.1}
        rotation={0}
        speed={reduced ? 0 : 0.6}
      />
      )}
      <div className="absolute inset-0 bg-[#09090b]/40" />
    </div>
  );
}

export default WarpBackground;
