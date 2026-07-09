"use client";

import { useEffect, useState } from "react";

import Warp from "@/components/ui/warp";

/**
 * Site-wide backdrop, layered for resilience:
 *  1. CSS dark-violet nebula wash — always visible (SSR, no JS/WebGL needed)
 *  2. Warp shader — slow dark swirl, progressive enhancement over the wash
 *  3. Gradient veil — darkest at nav/footer for readability, luminous mid-page
 * Brand black/violet only. Shader freezes under reduced motion.
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
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#08070d]" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 90% 60% at 70% 8%, rgba(109,40,217,0.30) 0%, transparent 55%)",
            "radial-gradient(ellipse 70% 55% at 12% 70%, rgba(139,92,246,0.17) 0%, transparent 60%)",
            "radial-gradient(ellipse 55% 45% at 88% 88%, rgba(88,28,135,0.22) 0%, transparent 60%)",
            "#08070d"
          ].join(", ")
        }}
      />
      {mounted && (
        <Warp
          // opacity < 1 is load-bearing: it creates the stacking context that
          // keeps the shader above the nebula sibling. Do not remove.
          style={{ width: "100%", height: "100%", opacity: 0.9 }}
          colors={["#0a0912", "#4c1d95", "#120a1f", "#7c3aed"]}
          proportion={0.45}
          softness={1}
          distortion={0.12}
          swirl={0.8}
          swirlIterations={8}
          shape="checks"
          shapeScale={0.06}
          scale={1.6}
          rotation={0}
          speed={reduced ? 0 : 0.25}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,7,13,0.55) 0%, rgba(8,7,13,0.12) 28%, rgba(8,7,13,0.12) 72%, rgba(8,7,13,0.6) 100%)"
        }}
      />
    </div>
  );
}

export default WarpBackground;
