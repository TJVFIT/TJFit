"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex cursor-pointer select-none items-center justify-center font-medium tracking-[0.01em] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] font-bold text-[#09090B] shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:scale-[1.02] hover:opacity-90 hover:shadow-[0_0_28px_rgba(34,211,238,0.35)] active:scale-[0.97]",
  secondary:
    "rounded-[10px] border border-[#1E2028] bg-transparent text-white hover:border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.04)] active:bg-[rgba(255,255,255,0.07)]",
  ghost: "rounded-[10px] border-0 bg-transparent text-[#A1A1AA] hover:text-white",
  danger:
    "rounded-[10px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.12)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)]",
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
  const cls = cn(base, variants[variant], variant !== "link" && sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={cls}>
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
