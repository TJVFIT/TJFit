"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { getNavChromeCopy } from "@/lib/launch-copy";
import { getSocialCopy } from "@/lib/social-copy";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

export function AuthRequiredPanel({
  locale,
  className = ""
}: {
  locale: string;
  className?: string;
}) {
  const loc = (isLocale(locale) ? locale : "en") as Locale;
  const s = getSocialCopy(loc);
  const nav = getNavChromeCopy(loc);

  return (
    <div
      className={`mx-auto max-w-md rounded-[28px] border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-6 py-10 text-center shadow-[0_0_60px_-28px_rgba(34,211,238,0.35)] ${className}`}
    >
      <div className="flex justify-center">
        <BrandLogo variant="mark" align="center" className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]" priority />
      </div>
      <p className="mt-6 font-display text-xl font-semibold tracking-tight text-white">{s.loginRequiredTitle}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-400">{s.loginRequiredBody}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/${loc}/login`}
          className="gradient-button inline-flex justify-center rounded-full px-8 py-3 text-sm font-semibold text-white"
        >
          {nav.loginLabel}
        </Link>
        <Link
          href={`/${loc}/signup`}
          className="inline-flex justify-center rounded-full border border-white/15 px-8 py-3 text-sm font-medium text-zinc-200 transition hover:border-cyan-400/35 hover:bg-white/[0.05]"
        >
          {nav.joinLabel}
        </Link>
      </div>
    </div>
  );
}
