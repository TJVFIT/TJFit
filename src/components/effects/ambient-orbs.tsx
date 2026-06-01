/**
 * Two drifting cyan/sky radial orbs anchored behind page content. Same
 * vocabulary used on /bundles, /404, /coming-soon, /auth/*, /calculator.
 *
 * Mount as a direct child of a `relative` parent — the orbs are absolute /
 * z -10 / pointer-events-none and only render when `motion-safe` matches.
 *
 *   <section className="relative">
 *     <AmbientOrbs />
 *     ...rest of the page...
 *   </section>
 */
export function AmbientOrbs({ variant = "default" }: { variant?: "default" | "compact" }) {
  const a = variant === "compact"
    ? { w: 460, h: 460, blur: 60, alphaA: 0.10, alphaB: 0.03 }
    : { w: 560, h: 560, blur: 80, alphaA: 0.14, alphaB: 0.04 };
  const b = variant === "compact"
    ? { w: 480, h: 480, blur: 70, alphaA: 0.08, alphaB: 0.02 }
    : { w: 640, h: 640, blur: 90, alphaA: 0.12, alphaB: 0.03 };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute hidden motion-safe:block"
        style={{
          top: "8%",
          left: "-10%",
          width: `${a.w}px`,
          height: `${a.h}px`,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(168,85,247,${a.alphaA}) 0%, rgba(168,85,247,${a.alphaB}) 40%, transparent 70%)`,
          filter: `blur(${a.blur}px)`,
          animation: "tj-orb-drift-a 38s ease-in-out infinite"
        }}
      />
      <div
        className="absolute hidden motion-safe:block"
        style={{
          top: "40%",
          right: "-10%",
          width: `${b.w}px`,
          height: `${b.h}px`,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(124,58,237,${b.alphaA}) 0%, rgba(124,58,237,${b.alphaB}) 45%, transparent 70%)`,
          filter: `blur(${b.blur}px)`,
          animation: "tj-orb-drift-b 46s ease-in-out infinite"
        }}
      />
    </div>
  );
}
