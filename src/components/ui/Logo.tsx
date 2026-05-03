"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const LOGO_ASPECT = 3.15;

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

/** One scale: lockups stay sharp; touch targets stay on the Link, not by stretching art */
const HEIGHT_PX: Record<LogoSize, number> = {
  navbar: 30,
  navFull: 38,
  sidebar: 30,
  mobile: 25,
  hero: 58,
  footer: 42,
  auth: 44,
  card: 22,
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
  blendWithBackground?: boolean;
};

export function Logo({
  variant = "full",
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
  const markOnly = variant === "icon" || variant === "3d";
  const w = markOnly ? h : Math.round(h * LOGO_ASPECT);

  const [revealed, setRevealed] = useState(!animated);
  useEffect(() => {
    if (!animated) return;
    const t = window.setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, [animated]);

  const filterStyle = blendWithBackground
    ? [
        "drop-shadow(0 10px 28px rgba(0,0,0,0.34))",
        "drop-shadow(0 0 18px rgba(34,211,238,0.14))",
      ].join(" ")
    : glow
      ? "drop-shadow(0 0 16px rgba(34,211,238,0.22))"
      : undefined;

  const artStyle: CSSProperties = {
    height: h,
    width: w,
    maxWidth: "100%",
    filter: filterStyle,
    opacity: animated && !revealed ? 0 : 1,
    transition: animated ? "opacity 400ms ease, filter 400ms ease, transform 400ms ease" : undefined,
    ...(animated && revealed ? { animation: "logoReveal 1.1s cubic-bezier(0.16,1,0.3,1) forwards" } : {})
  };

  const img = (
    <span
      role={linked ? "img" : undefined}
      aria-label={linked ? alt : undefined}
      aria-hidden={linked ? undefined : true}
      style={artStyle}
      className={cn(
        "tj-logo-lockup inline-flex select-none items-center",
        blendWithBackground && "mix-blend-screen",
        className
      )}
    >
      <svg
        viewBox="0 0 72 72"
        width={h}
        height={h}
        aria-hidden="true"
        className="shrink-0 overflow-visible"
      >
        <defs>
          <linearGradient id="tj-logo-stroke" x1="8" y1="8" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F6F3ED" />
            <stop offset="0.46" stopColor="#67E8F9" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <rect x="7" y="7" width="58" height="58" rx="13" fill="rgba(246,243,237,0.035)" />
        <rect x="7.5" y="7.5" width="57" height="57" rx="12.5" fill="none" stroke="rgba(246,243,237,0.13)" />
        <path
          d="M18 24H42M30 24V53M49 20V45C49 52 45 56 38 56C33 56 29 54 27 50"
          fill="none"
          stroke="url(#tj-logo-stroke)"
          strokeWidth="6.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        <path
          d="M18 24H42M30 24V53M49 20V45C49 52 45 56 38 56C33 56 29 54 27 50"
          fill="none"
          stroke="rgba(34,211,238,0.24)"
          strokeWidth="12"
          opacity="0.42"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </svg>
      {!markOnly ? (
        <span className="ms-2.5 flex items-center leading-none">
          <span className="font-display text-[1.05em] font-black tracking-[0.18em] text-[#F6F3ED]">
            TJFIT
          </span>
        </span>
      ) : null}
      {priority ? <span className="sr-only">Priority brand asset</span> : null}
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
        "inline-flex cursor-pointer items-center justify-center rounded-lg px-1.5 py-1",
        "transition-opacity duration-200 ease-out hover:opacity-90",
        !suppressMinTouchTarget && "min-h-[44px] min-w-[44px]"
      )}
    >
      {img}
    </Link>
  );
}
