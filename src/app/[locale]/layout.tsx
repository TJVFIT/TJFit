import { notFound } from "next/navigation";

import { AuthProvider } from "@/components/auth-provider";
import { SiteShell } from "@/components/site-shell";
import { isLocale, locales, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;

  return (
    <AuthProvider>
      <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
        <SiteShell locale={locale}>{children}</SiteShell>
      </div>
    </AuthProvider>
  );
}
