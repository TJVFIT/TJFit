"use client";

import { useEffect, useRef, useState } from "react";

type Stage = "init" | "t" | "j" | "f" | "i" | "t2" | "glow" | "burst" | "exit";

function GlowParticles({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const particles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number; color: string }[] = [];
    const colors = ["#22D3EE", "#67E8F9", "#A78BFA", "#38BDF8", "#ffffff"];

    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.3;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha -= 0.022;
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    />
  );
}

export function LogoIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>("init");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = window.setTimeout(() => onComplete(), 400);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];
    // T fades in
    timers.push(window.setTimeout(() => setStage("t"), 50));
    // J slides in from right
    timers.push(window.setTimeout(() => setStage("j"), 550));
    // FIT types: F
    timers.push(window.setTimeout(() => setStage("f"), 1000));
    // I
    timers.push(window.setTimeout(() => setStage("i"), 1120));
    // T
    timers.push(window.setTimeout(() => setStage("t2"), 1240));
    // Full glow blast
    timers.push(window.setTimeout(() => setStage("glow"), 1500));
    // Particle burst
    timers.push(window.setTimeout(() => setStage("burst"), 1600));
    // Exit
    timers.push(window.setTimeout(() => setStage("exit"), 2200));
    // Done
    timers.push(window.setTimeout(() => {
      setHidden(true);
      onComplete();
    }, 2700));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onComplete]);

  if (hidden) return null;

  const isGlowing = stage === "glow" || stage === "burst" || stage === "exit";
  const isExiting = stage === "exit";

  const glowFilter = isGlowing
    ? "drop-shadow(0 0 24px rgba(34,211,238,0.9)) drop-shadow(0 0 60px rgba(34,211,238,0.5))"
    : "none";

  const tVisible = stage !== "init";
  const jVisible = stage === "j" || stage === "f" || stage === "i" || stage === "t2" || isGlowing || isExiting;
  const fVisible = stage === "f" || stage === "i" || stage === "t2" || isGlowing || isExiting;
  const iVisible = stage === "i" || stage === "t2" || isGlowing || isExiting;
  const t2Visible = stage === "t2" || isGlowing || isExiting;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#09090B]"
      style={{
        opacity: isExiting ? 0 : 1,
        transition: isExiting ? "opacity 500ms cubic-bezier(0.4,0,1,1)" : "none"
      }}
    >
      <GlowParticles active={stage === "burst"} />

      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isGlowing
            ? "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,211,238,0.12), transparent 70%)"
            : "transparent",
          transition: "background 400ms ease"
        }}
        aria-hidden
      />

      <div
        className="relative select-none text-center"
        style={{
          transform: isExiting ? "scale(1.06)" : "scale(1)",
          transition: isExiting ? "transform 500ms ease-in" : "none"
        }}
      >
        {/* TJ row */}
        <div className="flex items-end justify-center" style={{ gap: "0.15em" }}>
          {/* T — fades in */}
          <span
            className="font-display font-extrabold leading-none"
            style={{
              fontSize: "clamp(72px, 14vw, 108px)",
              color: isGlowing ? "#22D3EE" : "#ffffff",
              filter: glowFilter,
              opacity: tVisible ? 1 : 0,
              transform: tVisible ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.92)",
              transition: "opacity 500ms cubic-bezier(0,0,0.2,1), transform 500ms cubic-bezier(0,0,0.2,1), color 300ms ease, filter 300ms ease"
            }}
          >
            T
          </span>
          {/* J — slides in from right */}
          <span
            className="font-display font-extrabold leading-none"
            style={{
              fontSize: "clamp(72px, 14vw, 108px)",
              color: isGlowing ? "#22D3EE" : "#ffffff",
              filter: glowFilter,
              opacity: jVisible ? 1 : 0,
              transform: jVisible ? "translateX(0)" : "translateX(48px)",
              transition: "opacity 400ms cubic-bezier(0.34,1.56,0.64,1), transform 400ms cubic-bezier(0.34,1.56,0.64,1), color 300ms ease, filter 300ms ease"
            }}
          >
            J
          </span>
        </div>

        {/* FIT row — types letter by letter */}
        <div
          className="flex items-center justify-center"
          style={{
            marginTop: "0.08em",
            gap: "0.06em",
            letterSpacing: "0.28em"
          }}
        >
          {[
            { char: "F", visible: fVisible },
            { char: "I", visible: iVisible },
            { char: "T", visible: t2Visible }
          ].map(({ char, visible }) => (
            <span
              key={char}
              className="font-display font-semibold"
              style={{
                fontSize: "clamp(26px, 5vw, 38px)",
                color: isGlowing ? "rgba(34,211,238,0.85)" : "#A1A1AA",
                filter: isGlowing ? "drop-shadow(0 0 12px rgba(34,211,238,0.6))" : "none",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 180ms ease-out, transform 180ms ease-out, color 300ms ease, filter 300ms ease",
                display: "inline-block"
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
