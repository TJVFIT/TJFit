"use client";

import { cn } from "@/lib/utils";

/** “Engine” chrome: slow ring, rays, data lines — sits above plate, below brain */
export function TjaiEngineChrome({ active, reduce }: { active: boolean; reduce: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center" aria-hidden>
      <div className="relative h-[min(88vw,640px)] w-[min(88vw,640px)] max-lg:opacity-40">
        {!reduce && (
          <>
            <div className="tj-tjai-ray absolute inset-[4%] rounded-full opacity-[0.12]" />
            <div className="tj-tjai-ring absolute inset-[6%] rounded-full border border-accent/15" />
            <div className="tj-tjai-ring-inner absolute inset-[14%] rounded-full border border-white/[0.06]" />
          </>
        )}
        <svg
          className="absolute inset-[18%] text-accent/25"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden
        >
          <path
            d="M100 20v160M20 100h160M40 40l120 120M160 40L40 160"
            stroke="currentColor"
            strokeWidth="0.35"
            className={cn(!reduce && "tj-tjai-data-lines")}
          />
        </svg>
        <div
          className="absolute left-1/2 top-1/2 h-[min(42vw,280px)] w-[min(42vw,280px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.22) 0%, rgba(167,139,250,0.08) 42%, transparent 70%)",
          }}
        />
        {!reduce && <div className="tj-tjai-core-pulse absolute left-1/2 top-1/2 h-[min(28vw,200px)] w-[min(28vw,200px)] -translate-x-1/2 -translate-y-1/2 rounded-full" />}
      </div>
    </div>
  );
}
