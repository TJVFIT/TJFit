"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type MobileCtaBarProps = {
  ariaLabel: string;
  eyebrow: string;
  priceCopy: string;
  href: string;
  label: string;
};

export function MobileCtaBar({ ariaLabel, eyebrow, priceCopy, href, label }: MobileCtaBarProps) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    lastY.current = window.scrollY;
    const onScroll = () => {
      const nextY = window.scrollY;
      const delta = nextY - lastY.current;
      if (Math.abs(delta) > 8) {
        setHidden(delta > 0 && nextY > 120);
        lastY.current = nextY;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#0B0D10]/82 backdrop-blur-xl md:hidden",
        "transition-transform duration-[320ms] ease-[cubic-bezier(0.2,0.8,0.2,1.12)] motion-reduce:transition-none",
        hidden ? "translate-y-full" : "translate-y-0"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">{eyebrow}</p>
          <p className="truncate text-[15px] font-semibold tabular-nums text-cyan-100">{priceCopy}</p>
        </div>
        <Link
          href={href}
          className="lux-btn-primary inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full px-5 py-2 text-sm font-bold text-[#09090B] transition-transform duration-[50ms] active:scale-[0.97]"
        >
          {label}
        </Link>
      </div>
    </div>
  );
}
