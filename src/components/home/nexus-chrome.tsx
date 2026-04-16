"use client";

import { cn } from "@/lib/utils";

type NexusChromeProps = {
  reduce: boolean;
  parallaxY: number;
};

/** Shimmer + depth parallax plane above plate, below SVG network */
export function NexusChrome({ reduce, parallaxY }: NexusChromeProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden mix-blend-screen"
      style={{
        transform: reduce ? undefined : `translate3d(0, ${parallaxY * 0.32}px, 0)`,
        transition: "transform 0.14s linear",
      }}
      aria-hidden
    >
      <div className={cn("tj-nexus-shimmer absolute -inset-[20%] h-[140%] w-[140%]", reduce && "opacity-0")} />
    </div>
  );
}
