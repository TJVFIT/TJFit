"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; size: number; createdAt: number; life: number };

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastEmitRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastEmitRef.current < 16) return;
      lastEmitRef.current = now;
      const rand = (a: number, b: number) => a + Math.random() * (b - a);
      particlesRef.current.push({
        x: e.clientX + rand(-4, 4),
        y: e.clientY + rand(-4, 4),
        size: rand(2, 5),
        createdAt: now,
        life: 400
      });
      if (particlesRef.current.length > 20) particlesRef.current.splice(0, particlesRef.current.length - 20);
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particlesRef.current = particlesRef.current.filter((p) => now - p.createdAt <= p.life);
      for (const p of particlesRef.current) {
        const age = now - p.createdAt;
        const progress = Math.min(1, age / p.life);
        const opacity = 0.6 * (1 - progress);
        const y = p.y - progress * 2;
        const size = p.size * (1 - progress * 0.5);
        ctx.beginPath();
        ctx.arc(p.x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${opacity})`;
        ctx.fill();
      }
      rafRef.current = window.requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(render);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[9998] will-change-contents" aria-hidden />;
}

