"use client";

import { useEffect } from "react";
import type { Locale, SupportedLocale } from "@/lib/i18n";

export function LocaleDocument({
  locale,
  direction
}: {
  locale: Locale | SupportedLocale;
  direction: "ltr" | "rtl";
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);

  return null;
}
