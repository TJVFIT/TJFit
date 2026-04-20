"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Reusable glass-friendly skeleton bar — pairs with `.tj-shimmer` in `globals.css`. */
export function PremiumSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("tj-skeleton tj-shimmer rounded-lg", className)} aria-hidden {...props} />;
}
