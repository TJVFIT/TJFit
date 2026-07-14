import { cn } from "@/lib/utils";

const NOISE_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23g)'/%3E%3C/svg%3E";

/**
 * Static film-grain + optional vignette finish layer. Absolutely positioned
 * (never fixed — fixed background layers get occluded by opaque wrappers in
 * this codebase), so the parent section must be position:relative.
 */
export function GrainOverlay({
  vignette = true,
  opacity = 0.05,
  className
}: {
  vignette?: boolean;
  opacity?: number;
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${NOISE_URI}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "140px 140px",
          opacity
        }}
      />
      {vignette ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 88% 78% at 50% 46%, transparent 52%, rgba(10,10,11,0.45) 100%)"
          }}
        />
      ) : null}
    </div>
  );
}
