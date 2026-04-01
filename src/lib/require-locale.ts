import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/lib/i18n";

/**
 * Validates `[locale]` dynamic segment. Use at the top of server pages, or after all hooks in client pages.
 */
export function requireLocaleParam(raw: string | undefined | null): Locale {
  if (typeof raw !== "string" || !isLocale(raw)) {
    notFound();
  }
  return raw;
}
