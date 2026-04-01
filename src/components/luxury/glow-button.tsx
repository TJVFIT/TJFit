"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

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
      : "max-lg:motion-safe:transition-transform max-lg:motion-safe:duration-150 lg:motion-safe:duration-200 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.99] lg:motion-safe:hover:scale-[1.03] lg:motion-safe:active:scale-[0.98]";

  return (
    <div className={cn("flex w-full justify-center sm:inline-flex sm:w-auto sm:justify-start", className)}>
      <Link href={href} className={cn(base, motionCls, "w-full max-w-md sm:max-w-none sm:w-auto")} onClick={() => onPress?.()}>
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
