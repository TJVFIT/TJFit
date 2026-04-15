"use client";

import { cn } from "@/lib/utils";

type ScrollTickerProps = {
  items: string[];
  speed?: number;
  direction?: "left" | "right";
  className?: string;
  separator?: string;
};

/**
 * Seamless horizontal ticker — CSS transform only, duplicates row for loop.
 */
export function ScrollTicker({
  items,
  speed = 40,
  direction = "left",
  className,
  separator = " · "
}: ScrollTickerProps) {
  if (!items.length) return null;

  const row = items.join(separator) + separator;
  const animName = direction === "left" ? "tj-ticker-left" : "tj-ticker-right";

  return (
    <div
      className={cn(
        "w-full overflow-hidden motion-reduce:[animation-play-state:paused]",
        className
      )}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)"
      }}
    >
      <div
        className={cn(
          "tj-ticker-track flex w-max flex-nowrap hover:[animation-play-state:paused]",
          "text-[12px] font-medium uppercase tracking-[0.15em] text-[#1E2028]"
        )}
        style={{
          animation: `${animName} ${speed}s linear infinite`
        }}
      >
        <span className="shrink-0 whitespace-nowrap px-2">{row}</span>
        <span className="shrink-0 whitespace-nowrap px-2" aria-hidden>
          {row}
        </span>
      </div>
    </div>
  );
}
