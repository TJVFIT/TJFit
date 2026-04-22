"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { useMagneticButton } from "@/hooks/useMagneticButton";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex cursor-pointer select-none items-center justify-center font-medium tracking-[0.01em] transition-[transform,filter,box-shadow,background-color,border-color,color] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] disabled:pointer-events-none disabled:opacity-50 active:duration-[80ms]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] font-bold text-[#09090B] shadow-[0_12px_32px_-6px_rgba(34,211,238,0.3),0_0_0_1px_rgba(255,255,255,0.08)_inset] hover:-translate-y-[1px] hover:brightness-110 hover:shadow-[0_16px_40px_-6px_rgba(34,211,238,0.45),0_0_0_1px_rgba(255,255,255,0.18)_inset] active:translate-y-0 active:scale-[0.985]",
  secondary:
    "rounded-[12px] border border-[#1E2028] bg-transparent text-white hover:-translate-y-[1px] hover:border-[rgba(34,211,238,0.35)] hover:bg-[rgba(34,211,238,0.06)] hover:shadow-[0_10px_28px_-14px_rgba(34,211,238,0.45)] active:translate-y-0 active:scale-[0.99]",
  ghost: "rounded-[10px] border-0 bg-transparent text-[#A1A1AA] hover:text-white",
  danger:
    "rounded-[12px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.12)] text-[#EF4444] hover:-translate-y-[1px] hover:border-[rgba(239,68,68,0.5)] hover:bg-[rgba(239,68,68,0.2)] hover:shadow-[0_10px_26px_-14px_rgba(239,68,68,0.5)] active:translate-y-0",
  link: "rounded-none border-0 bg-transparent p-0 text-[#A1A1AA] underline-offset-4 hover:text-white hover:underline"
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 py-2 text-[13px]",
  md: "min-h-11 px-6 py-3 text-sm",
  lg: "min-h-[52px] px-8 py-4 text-base"
};

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  href?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, children, href, type = "button", ...props },
  ref
) {
  const cls = cn(
    base,
    variants[variant],
    variant !== "link" && sizes[size],
    variant === "primary" && "tj-shine overflow-hidden",
    className
  );
  const magneticLinkRef = useMagneticButton<HTMLAnchorElement>(0.3);

  if (href) {
    return (
      <Link href={href} className={cls} ref={variant === "primary" ? magneticLinkRef : undefined}>
        {children}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} className={cls} {...props}>
      {children}
    </button>
  );
});
