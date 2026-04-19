"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
};

export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(hover: none)").matches;
    const particleCount = mobile ? 20 : 80;
    const lineDistance = 120;
    const enableLines = !mobile && !reducedMotion;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;
    let resizeTimer: number | null = null;

    const random = (min: number, max: number) => min + Math.random() * (max - min);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    for (let i = 0; i < particleCount; i += 1) {
      particles.push({
        x: random(0, window.innerWidth),
        y: random(0, window.innerHeight),
        vx: random(-0.6, 0.6),
        vy: random(-0.6, 0.6),
        radius: random(1, 2.5),
        alpha: random(0.1, 0.4)
      });
    }

    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 200);
    };
    const onMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (!reducedMotion) {
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 100 && dist > 0.001) {
            const repel = (100 - dist) / 100;
            p.x += (dx / dist) * repel * 0.3;
            p.y += (dy / dist) * repel * 0.3;
          }

          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -5) p.x = window.innerWidth + 5;
          if (p.x > window.innerWidth + 5) p.x = -5;
          if (p.y < -5) p.y = window.innerHeight + 5;
          if (p.y > window.innerHeight + 5) p.y = -5;
        }
      }

      if (enableLines) {
        for (let i = 0; i < particles.length; i += 1) {
          for (let j = i + 1; j < particles.length; j += 1) {
            const a = particles[i];
            const b = particles[j];
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (dist > lineDistance) continue;
            const opacity = (1 - dist / lineDistance) * 0.15;
            ctx.strokeStyle = `rgba(34,211,238,${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = `rgba(34,211,238,${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotion) {
        raf = window.requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
  }, []);

  return <canvas ref={canvasRef} className={className ?? "pointer-events-none fixed inset-0 z-0"} aria-hidden />;
}

