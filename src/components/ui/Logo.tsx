"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Official lockup raster (transparent PNG) — source artwork, unchanged. */
const LOCKUP = {
  src: "/logo/tjfit-brand.png",
  width: 348,
  height: 506
} as const;

const SRC = {
  icon: LOCKUP.src,
  full: LOCKUP.src
} as const;

export type LogoVariant = "icon" | "full";
export type LogoSize = "navbar" | "navFull" | "sidebar" | "mobile" | "hero" | "footer" | "auth" | "card" | "mini";

/** Pixel heights — width always auto, aspect preserved */
const HEIGHT_PX: Record<LogoSize, number> = {
  navbar: 32,
  navFull: 46,
  sidebar: 36,
  mobile: 28,
  hero: 60,
  footer: 40,
  auth: 44,
  card: 20,
  mini: 16
};

export type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  href?: string;
  glow?: boolean;
  className?: string;
  priority?: boolean;
  alt?: string;
  onNavigate?: () => void;
  suppressMinTouchTarget?: boolean;
  linked?: boolean;
};

/**
 * Site logo: official TJ FIT lockup PNG (`/public/logo/tjfit-brand.png`).
 */
export function Logo({
  variant = "icon",
  size = "navbar",
  href = "/",
  glow = false,
  className,
  priority = false,
  alt = "TJFit",
  onNavigate,
  suppressMinTouchTarget = false,
  linked = true
}: LogoProps) {
  const src = SRC[variant];
  const h = HEIGHT_PX[size];
  const builtInGlow = src === LOCKUP.src;

  const img = (
    <Image
      src={src}
      alt={linked ? alt : ""}
      width={LOCKUP.width}
      height={LOCKUP.height}
      priority={priority}
      unoptimized
      draggable={false}
      role="img"
      style={{
        height: h,
        width: "auto",
        // Lockup already includes cyan glow in the artwork
        ...(glow && !builtInGlow ? { filter: "drop-shadow(0 0 14px rgba(34, 211, 238, 0.35))" } : {})
      }}
      className={cn(
        "bg-transparent object-contain object-left [image-rendering:auto]",
        className
      )}
    />
  );

  if (!linked) {
    return (
      <span className="inline-flex items-center justify-center pointer-events-none" aria-hidden>
        {img}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label="TJFit — Go to homepage"
      className={cn(
        "inline-flex cursor-pointer items-center justify-center",
        "transition-opacity duration-150 ease-out hover:opacity-80",
        !suppressMinTouchTarget && "min-h-[44px] min-w-[44px]",
        variant === "full" && !suppressMinTouchTarget && "px-0.5"
      )}
    >
      {img}
    </Link>
  );
}
