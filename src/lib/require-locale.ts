import { notFound } from "next/navigation";

import { isLocale, isSupportedLocale, resolveCopyLocale, type Locale, type SupportedLocale } from "@/lib/i18n";

/**
 * Validates `[locale]` dynamic segment for copy lookups.
 *
 * Use at the top of server pages, or after all hooks in client pages.
 */
export function requireLocaleParam(raw: string | undefined | null): Locale {
  if (typeof raw !== "string" || !isSupportedLocale(raw)) {
    notFound();
  }
  return resolveCopyLocale(raw);
}

/**
 * Like `requireLocaleParam` but returns the URL segment as `SupportedLocale`
 * (same as `Locale` — every supported route has full UI copy).
 */
export function requireSupportedLocaleParam(raw: string | undefined | null): SupportedLocale {
  if (typeof raw !== "string" || !isSupportedLocale(raw)) {
    notFound();
  }
  return raw;
}

/** Narrow check — prefer `requireLocaleParam` on routes. */
export { isLocale, isSupportedLocale };
