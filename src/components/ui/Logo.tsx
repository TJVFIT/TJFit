"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const SRC = {
  icon: "/logo/tj-icon.svg",
  full: "/logo/tj-full.svg"
} as const;

const WIDTH_HINT = {
  icon: 100,
  full: 120
} as const;

export type LogoVariant = "icon" | "full";
export type LogoSize = "navbar" | "mobile" | "hero" | "footer" | "auth" | "card" | "mini";

/** Pixel heights — width always auto, aspect preserved */
const HEIGHT_PX: Record<LogoSize, number> = {
  navbar: 32,
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
 * Single source of truth for TJFit SVG marks (`/public/logo/*`).
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
  const wHint = WIDTH_HINT[variant];

  const img = (
    <Image
      src={src}
      alt={linked ? alt : ""}
      width={wHint}
      height={h}
      priority={priority}
      unoptimized
      draggable={false}
      role="img"
      style={{
        height: h,
        width: "auto",
        maxWidth: "none",
        ...(glow ? { filter: "drop-shadow(0 0 14px rgba(34, 211, 238, 0.35))" } : {})
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
        variant === "full" && !suppressMinTouchTarget && "min-w-[min(100%,12rem)]"
      )}
    >
      {img}
    </Link>
  );
}
