"use client";

import { cn } from "@/lib/utils";

type SectionTransitionProps = {
  variant?: "soft" | "glow" | "violet";
  className?: string;
};

/** Bleeds sections together so the page reads as one canvas */
export function SectionTransition({ variant = "soft", className }: SectionTransitionProps) {
  const bg =
    variant === "glow"
      ? "linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.04) 50%, transparent 100%)"
      : variant === "violet"
        ? "linear-gradient(180deg, transparent 0%, rgba(167,139,250,0.05) 45%, transparent 100%)"
        : "linear-gradient(180deg, #0A0A0B 0%, rgba(17,18,21,0.85) 50%, #0A0A0B 100%)";

  return (
    <div
      className={cn("pointer-events-none relative -mt-px h-16 w-full shrink-0", className)}
      style={{ background: bg }}
      aria-hidden
    />
  );
}
