"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type TrailPoint = { x: number; y: number };

export default function TubesCursor({
  className,
  interactive = true
}: {
  className?: string;
  interactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let pointer = { x: 0.67, y: 0.42 };
    const trails: TrailPoint[][] = Array.from({ length: 4 }, () => []);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer = {
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),
        y: (event.clientY - rect.top) / Math.max(rect.height, 1)
      };
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      trails.forEach((trail, index) => {
        const phase = time * 0.00045 + index * 1.45;
        const target = {
          x: width * (pointer.x + Math.sin(phase) * (0.07 + index * 0.012)),
          y: height * (pointer.y + Math.cos(phase * 1.2) * (0.12 + index * 0.018))
        };
        trail.unshift(target);
        if (trail.length > 42) trail.pop();
        if (trail.length < 3) return;

        context.beginPath();
        context.moveTo(trail[0].x, trail[0].y);
        for (let pointIndex = 1; pointIndex < trail.length - 1; pointIndex += 1) {
          const point = trail[pointIndex];
          const next = trail[pointIndex + 1];
          context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
        }

        context.strokeStyle = `rgba(${index === 0 ? "109,151,255" : "61,112,236"},${0.34 - index * 0.045})`;
        context.lineWidth = Math.max(1.5, 9 - index * 1.45);
        context.lineCap = "round";
        context.shadowBlur = 24;
        context.shadowColor = "rgba(62,112,238,0.35)";
        context.stroke();
      });

      context.globalCompositeOperation = "source-over";
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (interactive) window.addEventListener("pointermove", onPointerMove, { passive: true });
    frame = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [interactive]);

  return <canvas ref={canvasRef} aria-hidden className={cn("h-full w-full", className)} />;
}
