import { notFound } from "next/navigation";

import { isLocale, isSupportedLocale, resolveCopyLocale, type Locale, type SupportedLocale } from "@/lib/i18n";

/**
 * Validates `[locale]` dynamic segment for copy lookups.
 *
 * Accepts any of the 10 supported routing locales (en, tr, ar, es, fr, de, pt, ru, hi, id),
 * but returns the narrower 5-key `Locale` type via fallback. New locales (de/pt/ru/hi/id)
 * resolve to `en` until phase-2 translation lands — this keeps every `Record<Locale, X>`
 * consumer working unchanged while allowing the 10-locale URLs to route successfully.
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
 * Like `requireLocaleParam` but returns the full routing locale (any of the 10).
 * Use for `<html lang>`, hreflang alternates, language switcher, and anywhere
 * the URL-facing locale matters (not the dictionary-facing one).
 */
export function requireSupportedLocaleParam(raw: string | undefined | null): SupportedLocale {
  if (typeof raw !== "string" || !isSupportedLocale(raw)) {
    notFound();
  }
  return raw;
}

/** Narrow check — prefer `requireLocaleParam` on routes. */
export { isLocale, isSupportedLocale };
