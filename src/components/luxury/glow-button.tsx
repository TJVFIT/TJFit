"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const SPRING = { type: "spring" as const, stiffness: 420, damping: 24 };

type GlowButtonProps = {
  href: string;
  variant: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
  reducedMotion?: boolean | null;
};

/**
 * CTA with spring scale + optional shine sweep (primary).
 * Uses Link + motion wrapper instead of motion(Link) to avoid production ref/runtime issues with the App Router.
 */
export function GlowButton({ href, variant, className = "", children, reducedMotion }: GlowButtonProps) {
  const base =
    variant === "primary"
      ? "lux-btn-primary group relative inline-flex min-h-[48px] items-center justify-center overflow-hidden rounded-full px-8 py-3 text-sm font-semibold text-[#05080a] sm:text-[15px]"
      : "lux-btn-secondary group relative inline-flex min-h-[48px] items-center justify-center overflow-hidden rounded-full px-8 py-3 text-sm font-medium text-zinc-200 sm:text-[15px]";

  return (
    <motion.div
      className={`inline-flex ${className}`.trim()}
      whileHover={reducedMotion ? undefined : { scale: 1.03 }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      transition={SPRING}
    >
      <Link href={href} className={base}>
        {variant === "primary" ? (
          <span
            className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100"
            aria-hidden
          />
        ) : (
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 shadow-[0_0_36px_-8px_rgba(34,211,238,0.25)] transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden
          />
        )}
        <span className="relative z-10">{children}</span>
      </Link>
    </motion.div>
  );
}
