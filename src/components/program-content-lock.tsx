"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { cn } from "@/lib/utils";

export function ProgramContentLock({
  locked,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  children,
  className
}: {
  locked: boolean;
  title: string;
  subtitle?: string;
  ctaHref: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!locked) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative rounded-[24px] border border-white/10", className)}>
      <div
        className="pointer-events-none max-h-[min(70vh,36rem)] select-none overflow-hidden blur-[4px] opacity-[0.42] sm:max-h-[min(75vh,40rem)]"
        aria-hidden
      >
        {children}
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center bg-[rgba(9,9,11,0.7)] px-4 py-10 backdrop-blur-[4px]"
        role="region"
        aria-label={title}
      >
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <Lock className="h-5 w-5 text-[var(--color-text-muted)]" aria-hidden />
          </div>
          <p className="mt-4 text-base font-semibold text-white">{title}</p>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-zinc-400">{subtitle}</p> : null}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={ctaHref}
              className="lux-btn-primary inline-flex w-full min-w-[10rem] min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold text-[#09090B] sm:w-auto"
            >
              {ctaLabel}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5 sm:w-auto"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
