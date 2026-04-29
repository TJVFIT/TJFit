"use client";

import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { useMagneticButton } from "@/hooks/useMagneticButton";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex cursor-pointer select-none items-center justify-center font-medium tracking-[0.01em] transition-[transform,box-shadow,background-color,border-color,opacity,color] duration-180 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/90 focus-visible:ring-offset-[3px] focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100";

const variants: Record<ButtonVariant, string> = {
  primary:
    "rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] font-bold text-background shadow-lux-glow hover:-translate-y-px hover:opacity-95 hover:shadow-[0_0_28px_rgba(34,211,238,0.35)] active:scale-[0.98]",
  secondary:
    "rounded-[10px] border border-divider bg-transparent text-white hover:-translate-y-px hover:border-white/15 hover:bg-white/5 active:scale-[0.98] active:bg-white/[0.06]",
  ghost:
    "rounded-[10px] border-0 bg-transparent text-muted hover:-translate-y-px hover:text-white active:scale-[0.98] active:bg-white/5",
  danger:
    "rounded-[10px] border border-danger/30 bg-danger/10 text-danger hover:-translate-y-px hover:bg-danger/20 active:scale-[0.98] active:bg-danger/25",
  link: "rounded-none border-0 bg-transparent p-0 text-muted underline-offset-4 hover:text-white hover:underline hover:-translate-y-0 active:translate-y-0"
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 py-2 text-[13px]",
  md: "min-h-[44px] px-6 py-3 text-sm",
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
  const cls = cn(base, variants[variant], variant !== "link" && sizes[size], variant === "primary" && "btn-primary-shimmer", className);
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
