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
          background: "linear-gradient(180deg, #0A0A0B 0%, #0C0D10 38%, #111215 100%)",
        }}
      />
      <div className={cn("tj-ambient-noise absolute inset-0", reduce && "opacity-0")} />
      <div className={cn("tj-ambient-grid absolute inset-0", reduce && "opacity-0")} />
    </div>
  );
}
