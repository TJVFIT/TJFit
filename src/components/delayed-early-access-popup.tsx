"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { PremiumPopup } from "@/components/premium-popup";
import { trackMarketingEvent } from "@/lib/analytics-events";
import { getEarlyAccessPopupCopy } from "@/lib/early-access-popup-copy";
import { isLocale, type Locale } from "@/lib/i18n";

const POPUP_SEEN_KEY = "popup_seen";
const DELAY_MS = 10_000;

type Props = {
  locale: Locale;
};

/**
 * Delayed promo modal (10s). Persists dismissal via `localStorage` key `popup_seen`.
 * Copy is selected from `locale` (same as route). Renders under guest onboarding (z-100).
 */
export function DelayedEarlyAccessPopup({ locale }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const pathSeg = pathname?.split("/").filter(Boolean)[0];
  const activeLocale: Locale = pathSeg && isLocale(pathSeg) ? pathSeg : locale;
  const copy = getEarlyAccessPopupCopy(activeLocale);
  const titleId = "tjfit-early-access-title";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(POPUP_SEEN_KEY) === "1") return;
    } catch {
      return;
    }

    const onAuthRoute =
      pathname === `/${activeLocale}/login` ||
      pathname === `/${activeLocale}/signup` ||
      pathname === `/${activeLocale}/admin`;

    if (onAuthRoute) return;

    const timer = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem(POPUP_SEEN_KEY) === "1") return;
      } catch {
        return;
      }
      setOpen(true);
    }, DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [activeLocale, pathname]);

  const markSeen = () => {
    try {
      window.localStorage.setItem(POPUP_SEEN_KEY, "1");
    } catch {
      /* private mode */
    }
  };

  const dismiss = () => {
    markSeen();
    trackMarketingEvent("early_access_popup_dismiss", { locale: activeLocale });
    setOpen(false);
  };

  const onCtaClick = () => {
    markSeen();
    trackMarketingEvent("early_access_popup_cta", { locale: activeLocale });
    setOpen(false);
  };

  return (
    <PremiumPopup open={open} onClose={dismiss} titleId={titleId} closeLabel={copy.closeLabel} zIndexClass="z-[100]">
      <div className="flex items-center">
        <Logo
          variant="full"
          size="footer"
          href={`/${activeLocale}`}
          suppressMinTouchTarget
          className="max-w-[200px] sm:max-w-[220px]"
        />
      </div>
      <h2 id={titleId} className="mt-3 pe-12 font-display text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
        {copy.headline}
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-zinc-400 sm:text-sm">{copy.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href={`/${activeLocale}/signup?from=early-access-popup`}
          onClick={onCtaClick}
          className="lux-btn-primary inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-full px-6 text-center text-sm font-semibold text-[#05080a] sm:w-auto"
        >
          {copy.cta}
        </Link>
        <Link
          href={`/${activeLocale}/programs`}
          onClick={dismiss}
          className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-full border border-white/[0.12] px-6 text-sm font-medium text-zinc-200 transition hover:border-white/[0.18] hover:bg-white/[0.04] sm:w-auto"
        >
          {copy.secondaryCta}
        </Link>
      </div>
    </PremiumPopup>
  );
}
