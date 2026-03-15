import { notFound } from "next/navigation";

import { SiteShell } from "@/components/site-shell";
import { Locale, getDirection, isLocale, locales } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;

  return (
    <div dir={getDirection(locale)}>
      <SiteShell locale={locale}>{children}</SiteShell>
    </div>
  );
}
