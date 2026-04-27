"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

// Aspect ratio of /brand/logo-main.png (wordmark + mark).
// Tweak if the asset is replaced.
const LOGO_ASPECT = 3.6;

export type LogoVariant = "icon" | "full" | "3d";
export type LogoSize =
  | "navbar"
  | "navFull"
  | "sidebar"
  | "mobile"
  | "hero"
  | "footer"
  | "auth"
  | "card"
  | "mini";

const HEIGHT_PX: Record<LogoSize, number> = {
  navbar: 26,
  navFull: 34,
  sidebar: 28,
  mobile: 22,
  hero: 56,
  footer: 38,
  auth: 40,
  card: 20,
  mini: 16
};

export type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  href?: string;
  /** Kept for backwards-compat. Subtle drop-shadow only — no neon glow. */
  glow?: boolean;
  /** Kept for backwards-compat; intentionally ignored. */
  animated?: boolean;
  className?: string;
  priority?: boolean;
  alt?: string;
  onNavigate?: () => void;
  suppressMinTouchTarget?: boolean;
  linked?: boolean;
  /** Kept for backwards-compat; ignored. The asset blends naturally on dark. */
  blendWithBackground?: boolean;
};

export function Logo({
  variant = "full",
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
  const h = HEIGHT_PX[size];
  const markOnly = variant === "icon" || variant === "3d";
  const w = markOnly ? h : Math.round(h * LOGO_ASPECT);
  const src = markOnly ? "/brand/logo-mark.png" : "/brand/logo-main.png";

  const wrapStyle: CSSProperties = {
    height: h,
    width: w,
    maxWidth: "100%",
    filter: glow ? "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" : undefined
  };

  const img = (
    <span
      role={linked ? "img" : undefined}
      aria-label={linked ? alt : undefined}
      aria-hidden={linked ? undefined : true}
      style={wrapStyle}
      className={cn("relative inline-flex select-none items-center", className)}
    >
      <Image
        src={src}
        alt=""
        width={w * 2}
        height={h * 2}
        priority={priority}
        sizes={`${w}px`}
        style={{ height: h, width: "auto", maxWidth: "100%" }}
        draggable={false}
      />
    </span>
  );

  if (!linked) {
    return (
      <span className="pointer-events-none inline-flex items-center justify-center" aria-hidden>
        {img}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={alt}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-md px-1 py-0.5",
        "transition-opacity duration-200 ease-out hover:opacity-90",
        !suppressMinTouchTarget && "min-h-[44px] min-w-[44px]"
      )}
    >
      {img}
    </Link>
  );
}
