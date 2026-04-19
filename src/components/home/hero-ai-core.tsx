"use client";

import { cn } from "@/lib/utils";

function FloatCard({
  label,
  value,
  className,
  reduce,
}: {
  label: string;
  value: string;
  className?: string;
  reduce: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-panel absolute z-[2] rounded-lg px-3 py-2 text-start shadow-none",
        !reduce && "tj-hero-float-card",
        className
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#22D3EE]">{label}</p>
      <p className="mt-0.5 text-[11px] font-medium text-[#A1A1AA]">{value}</p>
    </div>
  );
}

type Layout = "hero" | "embedded";

function AiCoreRings({
  reduce,
  layout,
}: {
  reduce: boolean;
  layout: Layout;
}) {
  const embed = layout === "embedded";
  const outerMax = embed ? 300 : 400;
  const midMax = embed ? 210 : 280;
  const innerMax = embed ? 130 : 180;
  const coreMax = embed ? 70 : 104;
  const spinOuter = embed ? "tj-hero-spin-embed-slow" : "tj-hero-spin-slow";
  const spinMid = embed ? "tj-hero-spin-embed-mid" : "tj-hero-spin-mid";
  const spinInner = embed ? "tj-hero-spin-embed-fast" : "tj-hero-spin-fast";

  return (
    <div
      className={cn(
        "relative aspect-square",
        embed ? "w-[min(72vw,300px)]" : "w-[min(88vw,420px)] max-lg:translate-y-8"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 m-auto rounded-full border border-[rgba(34,211,238,0.14)]",
          !reduce && `${spinOuter} will-change-transform`
        )}
        style={{ width: "100%", height: "100%", maxWidth: outerMax, maxHeight: outerMax }}
      />
      <div
        className={cn(
          "absolute inset-0 m-auto rounded-full border border-[rgba(34,211,238,0.2)]",
          !reduce && `${spinMid} will-change-transform`
        )}
        style={{ width: "70%", height: "70%", maxWidth: midMax, maxHeight: midMax }}
      />
      <div
        className={cn(
          "absolute inset-0 m-auto rounded-full border border-[rgba(34,211,238,0.28)]",
          !reduce && `${spinInner} will-change-transform`
        )}
        style={{ width: "45%", height: "45%", maxWidth: innerMax, maxHeight: innerMax }}
      />
      <div
        className={cn(
          "absolute inset-0 m-auto flex items-center justify-center rounded-full",
          "bg-[radial-gradient(circle,rgba(34,211,238,0.35)_0%,rgba(34,211,238,0.08)_45%,transparent_72%)]",
          !reduce && "tj-hero-core-pulse will-change-transform"
        )}
        style={{ width: "26%", height: "26%", maxWidth: coreMax, maxHeight: coreMax }}
      >
        <span
          className={cn(
            "font-display font-black tracking-tight text-[#22D3EE]",
            embed ? "text-sm sm:text-base" : "text-lg sm:text-xl"
          )}
        >
          {embed ? "AI" : "TJ"}
        </span>
      </div>

      {embed ? (
        <>
          <FloatCard reduce={reduce} label="BMR" value="1,847 kcal" className="-end-[4%] -top-[2%] max-lg:hidden" />
          <FloatCard reduce={reduce} label="Protein" value="165g" className="-end-[8%] top-[38%] max-lg:hidden" />
          <FloatCard reduce={reduce} label="Training" value="4× / week" className="-end-[2%] bottom-[18%] max-lg:hidden" />
          <FloatCard reduce={reduce} label="Duration" value="12 weeks" className="start-[0%] bottom-[8%] max-lg:hidden" />
        </>
      ) : (
        <>
          <FloatCard reduce={reduce} label="BMR" value="1,847 kcal" className="start-[4%] top-[8%] max-lg:hidden" />
          <FloatCard reduce={reduce} label="Protein" value="165g daily" className="-end-[2%] top-[32%] max-lg:hidden" />
          <FloatCard reduce={reduce} label="Block" value="Week 6 · 68%" className="start-[0%] bottom-[14%] max-lg:hidden" />
        </>
      )}

      {!reduce && (
        <div
          className={cn(
            "absolute start-1/2 w-[72%] max-w-[280px] -translate-x-1/2 max-lg:hidden",
            embed ? "-bottom-5" : "-bottom-6"
          )}
        >
          <p className="mb-1 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-[#52525B]">
            TJAI computing…
          </p>
          <div className="h-1 overflow-hidden rounded-full bg-[rgba(34,211,238,0.1)]">
            <div className="tj-hero-proc-bar h-full w-1/3 rounded-full bg-[rgba(34,211,238,0.55)]" />
          </div>
        </div>
      )}
    </div>
  );
}

/** CSS ring “AI core” + micro data panels — desktop primary, mobile decorative */
export function HeroAiCore({ reduce, layout = "hero" }: { reduce: boolean; layout?: Layout }) {
  if (layout === "embedded") {
    return (
      <div
        className={cn(
          "pointer-events-none relative z-[2] flex w-full items-center justify-center",
          "max-lg:py-4 max-lg:opacity-90"
        )}
        aria-hidden
      >
        <AiCoreRings reduce={reduce} layout="embedded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 end-0 z-[2] flex w-full max-w-[min(92vw,520px)] items-center justify-center lg:end-[2%] lg:w-[46%]",
        "max-lg:opacity-[0.28] max-lg:scale-[0.72]"
      )}
      aria-hidden
    >
      <AiCoreRings reduce={reduce} layout="hero" />
    </div>
  );
}
