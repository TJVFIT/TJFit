import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LocaleDocument } from "@/components/locale-document";
import { SiteShell } from "@/components/site-shell";
import { Locale, getDictionary, getDirection, isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({
  params
}: {
  params: { locale?: string };
}): Metadata {
  const raw = params?.locale;
  if (typeof raw !== "string" || !isLocale(raw)) {
    return { title: "TJFit" };
  }

  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return {
    title: `TJFit | ${dict.hero.title}`,
    description: dict.hero.subtitle
  };
}

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  const raw = params?.locale;
  if (typeof raw !== "string" || !isLocale(raw)) {
    notFound();
  }

  const locale = raw as Locale;

  return (
    <div dir={getDirection(locale)}>
      <LocaleDocument locale={locale} direction={getDirection(locale)} />
      <SiteShell locale={locale}>{children}</SiteShell>
    </div>
  );
}
