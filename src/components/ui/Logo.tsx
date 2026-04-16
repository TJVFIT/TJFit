"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const SRC = {
  icon: "/logo/tj-icon.svg",
  full: "/logo/tj-full.svg",
  "3d": "/assets/hero/logo-tjfit-3d.png"
} as const;

const DIMS = {
  icon: { width: 100, height: 92 },
  full: { width: 144, height: 118 },
  "3d": { width: 400, height: 320 }
} as const;

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
  animated?: boolean;
  className?: string;
  priority?: boolean;
  alt?: string;
  onNavigate?: () => void;
  suppressMinTouchTarget?: boolean;
  linked?: boolean;
};

export function Logo({
  variant = "icon",
  size = "navbar",
  href = "/",
  glow = false,
  animated = false,
  className,
  priority = false,
  alt = "TJFit",
  onNavigate,
  suppressMinTouchTarget = false,
  linked = true
}: LogoProps) {
  const src = SRC[variant];
  const dims = DIMS[variant];
  const h = HEIGHT_PX[size];

  // Task 1 — animated entrance (only plays once per session)
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!animated || variant !== "3d") return;
    const timer = window.setTimeout(() => setRevealed(true), 100);
    return () => window.clearTimeout(timer);
  }, [animated, variant]);

  const is3D = variant === "3d";

  const img = (
    <span
      className={cn(
        "inline-flex items-center",
        is3D && animated && "relative"
      )}
    >
      <Image
        src={src}
        alt={linked ? alt : ""}
        width={dims.width}
        height={dims.height}
        priority={priority}
        unoptimized={!is3D}
        draggable={false}
        role="img"
        style={{
          height: h,
          width: "auto",
          ...(glow
            ? { filter: "drop-shadow(0 0 14px rgba(34, 211, 238, 0.45))" }
            : {}),
          ...(is3D && animated
            ? { animation: revealed ? "logoReveal 1.1s cubic-bezier(0.16,1,0.3,1) forwards" : "none", opacity: revealed ? undefined : 0 }
            : {})
        }}
        className={cn(
          "bg-transparent object-contain object-left [image-rendering:auto]",
          className
        )}
      />
      {/* Glow ring that fades out — only on animated 3D logos */}
      {is3D && animated && revealed && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-cyan-400/40"
          style={{
            animation: "logoGlowFade 1.5s ease-out forwards",
            transformOrigin: "center"
          }}
          aria-hidden
        />
      )}
    </span>
  );

  if (!linked) {
    return (
      <span
        className="pointer-events-none inline-flex items-center justify-center"
        aria-hidden
      >
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
        !suppressMinTouchTarget && "min-h-[44px] min-w-[44px]",
        variant === "full" && !suppressMinTouchTarget && "px-0.5"
      )}
    >
      {img}
    </Link>
  );
}
