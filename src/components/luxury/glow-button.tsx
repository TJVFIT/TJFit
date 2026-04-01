"use client";

import Link from "next/link";

type GlowButtonProps = {
  href: string;
  variant: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
  reducedMotion?: boolean | null;
  /** Fires on click (e.g. analytics) before navigation */
  onPress?: () => void;
};

/**
 * CTA with CSS hover/tap scale (no Framer Motion — avoids hydration/runtime issues in production).
 */
export function GlowButton({ href, variant, className = "", children, reducedMotion, onPress }: GlowButtonProps) {
  const base =
    variant === "primary"
      ? "lux-btn-primary group relative inline-flex min-h-[48px] items-center justify-center overflow-hidden rounded-full px-8 py-3 text-sm font-semibold text-[#05080a] sm:text-[15px]"
      : "lux-btn-secondary group relative inline-flex min-h-[48px] items-center justify-center overflow-hidden rounded-full px-8 py-3 text-sm font-medium text-zinc-200 sm:text-[15px]";

  const motionCls =
    reducedMotion === true
      ? ""
      : "motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.98]";

  return (
    <div className={`inline-flex ${className}`.trim()}>
      <Link href={href} className={`${base} ${motionCls}`} onClick={() => onPress?.()}>
        {variant === "secondary" ? (
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-white/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
        <span className="relative z-10">{children}</span>
      </Link>
    </div>
  );
}
