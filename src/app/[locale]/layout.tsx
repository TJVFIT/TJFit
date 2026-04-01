import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LocaleDocument } from "@/components/locale-document";
import { SiteShell } from "@/components/site-shell";
import { BRAND } from "@/lib/brand-assets";
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
  const ogLocale =
    locale === "tr" ? "tr_TR" : locale === "ar" ? "ar_SA" : locale === "es" ? "es_ES" : locale === "fr" ? "fr_FR" : "en_US";

  return {
    title: `TJFit | ${dict.hero.title}`,
    description: dict.hero.subtitle,
    openGraph: {
      type: "website",
      siteName: "TJFit",
      title: `TJFit | ${dict.hero.title}`,
      description: dict.hero.subtitle,
      locale: ogLocale,
      images: [{ url: BRAND.ogDefault, width: 1200, height: 630, alt: "TJFit" }]
    },
    twitter: {
      card: "summary_large_image",
      title: `TJFit | ${dict.hero.title}`,
      description: dict.hero.subtitle,
      images: [{ url: BRAND.ogDefault, width: 1200, height: 630, alt: "TJFit" }]
    }
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
