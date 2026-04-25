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
      ? "lux-btn-primary group relative inline-flex min-h-[50px] items-center justify-center overflow-hidden rounded-full px-8 py-3.5 text-sm font-semibold tracking-tight text-[#05080a] shadow-none sm:min-h-[52px] sm:text-[15px]"
      : "lux-btn-secondary group relative inline-flex min-h-[50px] items-center justify-center overflow-hidden rounded-full px-8 py-3.5 text-sm font-medium tracking-tight text-bright sm:min-h-[52px] sm:text-[15px]";

  const motionCls =
    reducedMotion === true
      ? ""
      : "max-lg:motion-safe:transition-transform max-lg:motion-safe:duration-200 lg:motion-safe:duration-300 motion-safe:hover:scale-[1.015] motion-safe:active:scale-[0.99] lg:motion-safe:hover:scale-[1.025] lg:motion-safe:active:scale-[0.985]";

  return (
    <div className={cn("flex w-full justify-center sm:inline-flex sm:w-auto sm:justify-start", className)}>
      <Link href={href} className={cn(base, motionCls, "w-full max-w-md sm:max-w-none sm:w-auto")} onClick={() => onPress?.()}>
        {variant === "primary" && reducedMotion !== true ? (
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden>
            <span className="absolute inset-0 translate-x-[-120%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-[120%] group-hover:opacity-100" />
          </span>
        ) : null}
        {variant === "secondary" ? (
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.06] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
        <span className="relative z-10 max-w-[min(100%,22rem)] text-balance text-center leading-snug sm:max-w-[min(100%,28rem)]">
          {children}
        </span>
      </Link>
    </div>
  );
}
