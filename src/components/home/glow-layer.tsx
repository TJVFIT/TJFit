"use client";

import { cn } from "@/lib/utils";

type GlowLayerProps = {
  className?: string;
  /** e.g. "72% 48%" */
  center?: string;
  cyanOpacity?: number;
  violetHint?: boolean;
};

/** Soft cyan radial — diffused only, never harsh */
export function GlowLayer({
  className,
  center = "70% 45%",
  cyanOpacity = 0.12,
  violetHint = false,
}: GlowLayerProps) {
  const v = violetHint ? `, radial-gradient(ellipse 40% 45% at 85% 60%, rgba(246,243,237,${cyanOpacity * 0.18}) 0%, transparent 50%)` : "";
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background: `radial-gradient(ellipse 58% 72% at ${center}, rgba(34,211,238,${cyanOpacity}) 0%, transparent 58%)${v}`,
      }}
      aria-hidden
    />
  );
}
