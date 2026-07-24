"use client";

import { useRef, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

type GlareVariables = CSSProperties & {
  "--glare-x": string;
  "--glare-y": string;
  "--rotate-x": string;
  "--rotate-y": string;
  "--glare-opacity": string;
};

export function GlareCard({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  const updateFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = elementRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty("--glare-x", `${x}%`);
    element.style.setProperty("--glare-y", `${y}%`);
    element.style.setProperty("--rotate-x", `${(50 - y) * 0.08}deg`);
    element.style.setProperty("--rotate-y", `${(x - 50) * 0.08}deg`);
    element.style.setProperty("--glare-opacity", "0.72");
  };

  const reset = () => {
    const element = elementRef.current;
    if (!element) return;
    element.style.setProperty("--rotate-x", "0deg");
    element.style.setProperty("--rotate-y", "0deg");
    element.style.setProperty("--glare-opacity", "0");
  };

  const variables: GlareVariables = {
    "--glare-x": "50%",
    "--glare-y": "50%",
    "--rotate-x": "0deg",
    "--rotate-y": "0deg",
    "--glare-opacity": "0"
  };

  return (
    <div className="[perspective:900px]">
      <div
        ref={elementRef}
        onPointerMove={updateFromPointer}
        onPointerLeave={reset}
        style={variables}
        className={cn(
          "group relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#091329] shadow-inset transition-transform duration-300 ease-out will-change-transform [transform:rotateX(var(--rotate-x))_rotateY(var(--rotate-y))]",
          className
        )}
      >
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[var(--glare-opacity)] transition-opacity duration-300 [background:radial-gradient(circle_at_var(--glare-x)_var(--glare-y),rgba(170,197,255,0.36),rgba(75,112,206,0.10)_25%,transparent_58%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-px rounded-[calc(1.75rem-1px)] border border-white/[0.06]"
        />
      </div>
    </div>
  );
}
