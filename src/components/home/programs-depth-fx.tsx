"use client";

import { cn } from "@/lib/utils";

/**
 * Simulates floating card depth over the programs plate — no extra image decode.
 */
export function ProgramsDepthFx({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[4] overflow-hidden" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "absolute rounded-lg border border-white/[0.04] bg-gradient-to-b from-white/[0.03] to-transparent shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_40px_rgba(34,211,238,0.06)]",
            "tj-program-card-float",
            i === 0 && "left-[8%] top-[18%] h-[22%] w-[28%] max-md:left-[4%] max-md:top-[22%] max-md:h-[18%] max-md:w-[40%]",
            i === 1 && "left-[38%] top-[12%] h-[26%] w-[30%] max-md:left-[30%] max-md:top-[16%] max-md:h-[20%] max-md:w-[52%]",
            i === 2 && "right-[6%] top-[24%] h-[24%] w-[26%] max-md:right-[4%] max-md:top-[28%] max-md:h-[18%] max-md:w-[44%]"
          )}
          style={{ animationDelay: `${i * 1.2}s` }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A0A0B]/90 to-transparent" />
    </div>
  );
}
