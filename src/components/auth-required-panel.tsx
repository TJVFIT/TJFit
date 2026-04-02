"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
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
    <div className={`tj-surface-shell mx-auto max-w-md px-6 py-10 text-center ${className}`}>
      <div className="mb-6 flex justify-center">
        <Logo variant="icon" size="auth" href={`/${loc}`} priority />
      </div>
      <p className="tj-section-title mt-6 text-xl sm:text-2xl">{s.loginRequiredTitle}</p>
      <p className="tj-prose-muted mx-auto mt-3 max-w-sm">{s.loginRequiredBody}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/${loc}/login`} className="lux-btn-primary inline-flex min-h-[48px] justify-center rounded-full px-8 py-3 text-sm font-semibold text-[#05080a]">
          {nav.loginLabel}
        </Link>
        <Link href={`/${loc}/signup`} className="lux-btn-secondary inline-flex min-h-[48px] justify-center rounded-full px-8 py-3 text-sm font-medium text-zinc-100">
          {nav.joinLabel}
        </Link>
      </div>
    </div>
  );
}
