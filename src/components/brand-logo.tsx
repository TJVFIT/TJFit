"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand-assets";

type BrandLogoProps = {
  /**
   * `mark` — monogram only (nav/toolbars/badges/small cards). Matches favicon source.
   * `full` — monogram + FIT lockup; use only when layout has space (footer, login hero, etc.).
   */
  variant?: "full" | "mark";
  /** `center` for stacked / modal headers; `left` for inline bars. */
  align?: "left" | "center";
  className?: string;
  /** When true, loads sooner (e.g. nav). */
  priority?: boolean;
  alt?: string;
};

/**
 * Official TJFit brand marks. Prefer `mark` in compact UI; `full` where width/height allow (~lg+ header, footers, auth panels).
 */
export function BrandLogo({
  variant = "full",
  align = "left",
  className,
  priority = false,
  alt = "TJFit"
}: BrandLogoProps) {
  const src = variant === "mark" ? BRAND.logoMark : BRAND.logoFull;
  const intrinsic = variant === "mark" ? { width: 128, height: 128 } : { width: 512, height: 512 };

  return (
    <Image
      src={src}
      alt={alt}
      width={intrinsic.width}
      height={intrinsic.height}
      priority={priority}
      unoptimized
      className={cn(
        "object-contain",
        align === "center" ? "object-center" : "object-left",
        className
      )}
      sizes={
        variant === "mark"
          ? "(max-width: 1023px) 40px, 48px"
          : "(max-width: 1024px) 160px, 200px"
      }
    />
  );
}
