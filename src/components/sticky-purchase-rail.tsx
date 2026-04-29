"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

type StickyPurchaseRailProps = {
  coachLabel: string;
  coachName: string;
  coachSpecialty: string;
  difficultyLabel: string;
  difficulty: string;
  durationLabel: string;
  duration: string;
  priceLabel: string;
  priceCopy: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  accessCopy?: string;
  children?: React.ReactNode;
};

export function StickyPurchaseRail({
  coachLabel,
  coachName,
  coachSpecialty,
  difficultyLabel,
  difficulty,
  durationLabel,
  duration,
  priceLabel,
  priceCopy,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  accessCopy,
  children
}: StickyPurchaseRailProps) {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const onScroll = () => setPinned(window.scrollY > 220);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "rounded-[18px] border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-white/[0.018] p-6",
        "transition-shadow duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
        pinned ? "shadow-[0_30px_80px_-48px_rgba(34,211,238,0.55),0_18px_50px_-34px_rgba(0,0,0,0.9)]" : ""
      )}
      data-pinned={pinned}
    >
      <p className="text-sm text-muted">{coachLabel}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{coachName}</p>
      <p className="mt-2 text-sm text-muted">{coachSpecialty}</p>

      <div className="mt-6 space-y-3 text-sm text-bright">
        <RailRow label={difficultyLabel} value={difficulty} />
        <RailRow label={durationLabel} value={duration} />
        <RailRow label={priceLabel} value={priceCopy} valueClassName="text-cyan-100" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {primaryHref && primaryLabel ? (
          <Link
            href={primaryHref}
            className="lux-btn-primary inline-flex min-h-[46px] items-center justify-center rounded-full px-5 py-2.5 text-center text-sm font-bold text-[#09090B] transition-transform duration-150 active:scale-[0.97]"
          >
            {primaryLabel}
          </Link>
        ) : null}
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/85 transition-colors hover:border-cyan-300/40 hover:text-white"
          >
            {secondaryLabel}
          </Link>
        ) : null}
        {accessCopy ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {accessCopy}
          </p>
        ) : null}
      </div>

      {children ? <div className="mt-6 border-t border-white/[0.06] pt-6">{children}</div> : null}
    </div>
  );
}

function RailRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <span className={cn("text-right text-white", valueClassName)}>{value}</span>
    </div>
  );
}
