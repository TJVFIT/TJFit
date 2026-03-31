"use client";

import { useEffect } from "react";

import { Locale, getDirection } from "@/lib/i18n";

export function LocaleDocumentAttrs({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
  }, [locale]);

  return null;
}
