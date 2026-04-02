"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const SRC = {
  icon: "/logo/tj-icon.svg",
  full: "/logo/tj-full.svg"
} as const;

const INTRINSIC = {
  icon: { width: 64, height: 64 },
  full: { width: 236, height: 64 }
} as const;

const SIZE_CLASS = {
  navbar: "h-8 w-auto max-w-none",
  mobile: "h-7 w-auto max-w-none",
  hero: "h-14 w-auto max-w-none",
  footer: "h-10 w-auto max-w-none",
  auth: "h-11 w-auto max-w-none",
  card: "h-5 w-auto max-w-none"
} as const;

export type LogoProps = {
  variant?: "icon" | "full";
  size?: keyof typeof SIZE_CLASS;
  href?: string;
  className?: string;
  glow?: boolean;
  /** Navbar only — eager load */
  priority?: boolean;
  alt?: string;
  /** Fires after the home link is activated (e.g. close mobile drawer). */
  onNavigate?: () => void;
  /** Inline chips / pills where 44px target would break layout; keep default in nav, auth, footer. */
  suppressMinTouchTarget?: boolean;
  /** When false, render the mark only (e.g. inside another `Link`). */
  linked?: boolean;
};

/**
 * Canonical TJFit logo entry points. Uses SVG marks under /public/logo; height-only sizing (width auto).
 */
export function Logo({
  variant = "icon",
  size = "navbar",
  href = "/",
  className,
  glow = false,
  priority = false,
  alt = "TJFit",
  onNavigate,
  suppressMinTouchTarget = false,
  linked = true
}: LogoProps) {
  const src = SRC[variant];
  const dim = INTRINSIC[variant];

  const img = (
    <Image
      src={src}
      alt={linked ? alt : ""}
      width={dim.width}
      height={dim.height}
      priority={priority}
      draggable={false}
      className={cn(
        "bg-transparent object-contain object-left [image-rendering:auto]",
        SIZE_CLASS[size],
        glow && "logo-glow",
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
      className={cn(
        "inline-flex cursor-pointer items-center justify-center",
        !suppressMinTouchTarget && "min-h-11 min-w-11",
        "transition-opacity duration-150 ease-out hover:opacity-80",
        variant === "full" && !suppressMinTouchTarget && "min-w-[min(100%,12rem)]"
      )}
      aria-label={alt === "TJFit" ? "TJFit home" : alt}
    >
      {img}
    </Link>
  );
}
