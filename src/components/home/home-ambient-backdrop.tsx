"use client";

import { cn } from "@/lib/utils";

/**
 * Continuous page canvas: deep gradient, film noise, faint grid drift.
 * Fixed under content — keeps scroll feeling like one system.
 */
export function HomeAmbientBackdrop({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 42% at 70% 12%, rgba(34,211,238,0.055), transparent 62%), radial-gradient(ellipse 48% 34% at 18% 74%, rgba(246,243,237,0.035), transparent 66%), linear-gradient(180deg, #09090A 0%, #0C0D10 42%, #111215 100%)",
        }}
      />
      <div className={cn("tj-ambient-noise absolute inset-0", reduce && "opacity-0")} />
      <div className={cn("tj-ambient-grid absolute inset-0", reduce && "opacity-0")} />
    </div>
  );
}
