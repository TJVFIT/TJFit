"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { BRAND_LOGO_SRC } from "@/lib/brand-assets";

type Phase = "hidden" | "materialize" | "glow" | "hold" | "exit";

export function LogoIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  // Polygon network particle animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase === "hidden" || phase === "exit") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Spawn nodes like the polygon mesh in the logo
    const nodeCount = 28;
    type Node = { x: number; y: number; vx: number; vy: number; alpha: number };
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: W * 0.2 + Math.random() * W * 0.6,
      y: H * 0.15 + Math.random() * H * 0.7,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: 0.1 + Math.random() * 0.4
    }));

    const maxDist = 200;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // Draw connecting lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(34,211,238,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw node dots
      for (const n of nodes) {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + n.x);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${n.alpha * pulse})`;
        ctx.fill();
      }

      frame++;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = window.setTimeout(() => { setDone(true); onComplete(); }, 400);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];
    // Logo materializes up from below
    timers.push(window.setTimeout(() => setPhase("materialize"), 60));
    // Glow intensifies
    timers.push(window.setTimeout(() => setPhase("glow"), 900));
    // Hold at peak
    timers.push(window.setTimeout(() => setPhase("hold"), 1600));
    // Exit — scale up + fade out
    timers.push(window.setTimeout(() => setPhase("exit"), 2200));
    // Done
    timers.push(window.setTimeout(() => { setDone(true); onComplete(); }, 2750));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onComplete]);

  if (done) return null;

  const isVisible = phase !== "hidden";
  const isGlowing = phase === "glow" || phase === "hold";
  const isExiting = phase === "exit";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#09090B]"
      style={{
        opacity: isExiting ? 0 : 1,
        transition: isExiting ? "opacity 550ms cubic-bezier(0.4,0,1,1)" : "none"
      }}
    >
      {/* Polygon network canvas background */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{ opacity: isGlowing ? 1 : 0.4, transition: "opacity 600ms ease" }}
      />

      {/* Radial glow behind logo — matches the logo's own glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: isGlowing
            ? "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(34,211,238,0.15) 0%, rgba(34,211,238,0.04) 50%, transparent 70%)"
            : "transparent",
          transition: "background 700ms ease"
        }}
      />

      {/* The logo — materializes from below with a scale + fade */}
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible
            ? isExiting
              ? "translateY(-8px) scale(1.08)"
              : "translateY(0) scale(1)"
            : "translateY(30px) scale(0.92)",
          transition: isExiting
            ? "opacity 550ms ease-in, transform 550ms ease-in"
            : "opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1)"
        }}
      >
        <Image
          src={BRAND_LOGO_SRC}
          alt="TJFit"
          width={1024}
          height={836}
          priority
          style={{
            height: "clamp(160px, 28vw, 280px)",
            width: "auto",
            filter: isGlowing
              ? [
                  "drop-shadow(0 0 8px rgba(34,211,238,1))",
                  "drop-shadow(0 0 25px rgba(34,211,238,0.8))",
                  "drop-shadow(0 0 60px rgba(34,211,238,0.45))",
                  "drop-shadow(0 0 100px rgba(34,211,238,0.2))"
                ].join(" ")
              : "drop-shadow(0 0 12px rgba(34,211,238,0.5))",
            transition: "filter 700ms ease"
          }}
        />
      </div>

      {/* Scan line — sweeps once */}
      {isVisible && !isExiting && (
        <div
          className="pointer-events-none absolute left-0 h-[2px] w-full animate-scanline"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.9) 50%, transparent 100%)"
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
