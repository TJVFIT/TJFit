import { cn } from "@/lib/utils";

type AmbientBackgroundProps = {
  /** "violet" = lighter violet-500 orb (top-left); "violetDeep" = darker violet-600 orb (bottom-right). */
  variant?: "violet" | "violetDeep" | "both";
  intensity?: "low" | "medium";
  className?: string;
};

/**
 * Fixed orbs behind page content. Animate opacity/transform only via parent if needed.
 */
export function AmbientBackground({
  variant = "both",
  intensity = "low",
  className
}: AmbientBackgroundProps) {
  const m = intensity === "medium" ? 2 : 1;
  const violetCore = 0.06 * m;
  const violetDeepCore = 0.05 * m;

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}
      aria-hidden
    >
      {(variant === "violet" || variant === "both") && (
        <div
          className="absolute will-change-transform"
          style={{
            width: 600,
            height: 600,
            top: -100,
            left: "20%",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(168,85,247,${violetCore}) 0%, transparent 70%)`,
            filter: "blur(40px)"
          }}
        />
      )}
      {(variant === "violetDeep" || variant === "both") && (
        <div
          className="absolute will-change-transform"
          style={{
            width: 500,
            height: 500,
            bottom: "10%",
            right: "10%",
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(124,58,237,${violetDeepCore}) 0%, transparent 70%)`,
            filter: "blur(40px)"
          }}
        />
      )}
    </div>
  );
}
