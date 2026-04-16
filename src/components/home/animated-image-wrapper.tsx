"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AnimatedImageWrapperProps = {
  children: ReactNode;
  reduce: boolean;
  /** Hero uses stronger vignette + film grade */
  variant?: "hero" | "section";
  /** Hero applies vein pulse on outer stack instead */
  showVein?: boolean;
  className?: string;
};

/**
 * Wraps next/image (or any fill media): graded exposure, soft edge falloff,
 * bottom read fade — never raw img alone on the marketing surface.
 */
export function AnimatedImageWrapper({
  children,
  reduce,
  variant = "section",
  showVein = true,
  className,
}: AnimatedImageWrapperProps) {
  return (
    <div
      className={cn(
        "tj-animated-image-root relative h-full w-full overflow-hidden",
        variant === "hero" && "tj-animated-image-root--hero",
        className
      )}
    >
      <div className="relative h-full w-full">{children}</div>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[2]",
          variant === "hero" ? "tj-animated-image-fade--hero" : "tj-animated-image-fade--section"
        )}
        aria-hidden
      />
      {!reduce && showVein && (
        <div
          className="pointer-events-none absolute inset-0 z-[3] opacity-[0.4] mix-blend-soft-light tj-animated-image-vein"
          aria-hidden
        />
      )}
    </div>
  );
}
