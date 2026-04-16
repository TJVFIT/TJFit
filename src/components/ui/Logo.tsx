"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

// The one and only logo — the 3D TJFIT logo
const LOGO_SRC = "/assets/hero/logo-tjfit-3d.png";
const LOGO_WIDTH = 1024;
const LOGO_HEIGHT = 836;

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

/** Pixel heights — width always auto, aspect preserved */
const HEIGHT_PX: Record<LogoSize, number> = {
  navbar: 36,
  navFull: 46,
  sidebar: 36,
  mobile: 28,
  hero: 64,
  footer: 56,
  auth: 48,
  card: 24,
  mini: 18
};

export type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  href?: string;
  glow?: boolean;
  animated?: boolean;
  className?: string;
  priority?: boolean;
  alt?: string;
  onNavigate?: () => void;
  suppressMinTouchTarget?: boolean;
  linked?: boolean;
  /** Lets the 3D PNG’s dark plate blend into dark glass UI (sidebar / nav) instead of a visible rectangle */
  blendWithBackground?: boolean;
};

export function Logo({
  variant: _variant,       // accepted but ignored — always uses 3D logo
  size = "navbar",
  href = "/",
  glow = false,
  animated = false,
  className,
  priority = false,
  alt = "TJFit",
  onNavigate,
  suppressMinTouchTarget = false,
  linked = true,
  blendWithBackground = false
}: LogoProps) {
  const h = HEIGHT_PX[size];

  const [revealed, setRevealed] = useState(!animated);
  useEffect(() => {
    if (!animated) return;
    const t = window.setTimeout(() => setRevealed(true), 100);
    return () => window.clearTimeout(t);
  }, [animated]);

  const baseGlow = glow || true; // always glow — it's the brand
  const glowIntensity = size === "hero" || size === "auth" ? "0 0 20px rgba(34,211,238,0.55)" : "0 0 10px rgba(34,211,238,0.4)";

  const filterStyle =
    blendWithBackground
      ? [
          "drop-shadow(0 0 14px rgba(34,211,238,0.42))",
          "drop-shadow(0 0 28px rgba(34,211,238,0.12))",
          "contrast(1.08)",
          "saturate(1.06)"
        ].join(" ")
      : baseGlow
        ? `drop-shadow(${glowIntensity})`
        : undefined;

  const blendMask: CSSProperties | undefined = blendWithBackground
    ? {
        maskImage:
          "radial-gradient(ellipse 88% 82% at 50% 50%, black 18%, black 82%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 88% 82% at 50% 50%, black 18%, black 82%, transparent 100%)"
      }
    : undefined;

  const img = (
    <span className="inline-flex items-center justify-center" style={blendMask}>
      <Image
        src={LOGO_SRC}
        alt={linked ? alt : ""}
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        priority={priority}
        draggable={false}
        role="img"
        quality={95}
        style={{
          height: h,
          width: "auto",
          filter: filterStyle,
          opacity: animated && !revealed ? 0 : 1,
          transition: animated ? "opacity 400ms ease, filter 400ms ease" : undefined,
          ...(animated && revealed ? { animation: "logoReveal 1.1s cubic-bezier(0.16,1,0.3,1) forwards" } : {})
        }}
        className={cn(
          "bg-transparent object-contain [image-rendering:auto]",
          blendWithBackground && "mix-blend-screen",
          className
        )}
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
        "inline-flex cursor-pointer items-center justify-center",
        "transition-opacity duration-150 ease-out hover:opacity-80",
        !suppressMinTouchTarget && "min-h-[44px] min-w-[44px]"
      )}
    >
      {img}
    </Link>
  );
}
