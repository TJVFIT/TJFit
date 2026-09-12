import type { Metadata } from "next";

import { CookieConsentBanner } from "@/components/cookie-consent";
import { LocaleDocument } from "@/components/locale-document";
import { SiteShell } from "@/components/site-shell";
import { PageTransition } from "@/components/transitions/PageTransition";
import { DeviceProvider } from "@/lib/device/DeviceContext";
import { BRAND } from "@/lib/brand-assets";
import { PUBLIC_COPY } from "@/lib/public-offers-copy";
import {
  LOCALE_META,
  getDirection,
  resolveCopyLocale,
  supportedLocales,
  type Locale,
  type SupportedLocale
} from "@/lib/i18n";
import { requireSupportedLocaleParam } from "@/lib/require-locale";

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.org";

const TITLES: Record<Locale, string> = {
  en: "TJFit — Bundles, TJAI & Equipment",
  tr: "TJFit — Paketler, TJAI ve Ekipman",
  ar: "TJFit — الحزم وTJAI والمعدات",
  es: "TJFit — Paquetes, TJAI y Equipo",
  fr: "TJFit — Packs, TJAI et Équipement"
};

const DESCRIPTIONS: Record<Locale, string> = {
  en: PUBLIC_COPY.en.intro,
  tr: PUBLIC_COPY.tr.intro,
  ar: PUBLIC_COPY.ar.intro,
  es: PUBLIC_COPY.es.intro,
  fr: PUBLIC_COPY.fr.intro
};

/** BCP-47 tags for `<html lang>` and OG locale. */
const BCP47: Record<SupportedLocale, string> = {
  en: "en_US",
  tr: "tr_TR",
  ar: "ar_SA",
  es: "es_ES",
  fr: "fr_FR"
};

export async function generateMetadata(props: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const params = await props.params;
  const routing = requireSupportedLocaleParam(params?.locale);
  const copy = resolveCopyLocale(routing);
  const title = TITLES[copy];
  const description = DESCRIPTIONS[copy];

  const languages: Record<string, string> = {};
  supportedLocales.forEach((loc) => {
    languages[loc] = `${SITE_URL}/${loc}`;
  });
  languages["x-default"] = `${SITE_URL}/en`;

  return {
    // absolute: TITLES are already branded; stops the root "%s | TJFit"
    // template double-branding the homepage (child pages still use it)
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${routing}`,
      languages
    },
    openGraph: {
      type: "website",
      siteName: "TJFit",
      title,
      description,
      locale: BCP47[routing],
      url: `${SITE_URL}/${routing}`,
      images: [
        { url: BRAND.ogDefault, width: 1200, height: 630, alt: "TJFit — Premium Fitness Transformation Platform" }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        { url: BRAND.ogDefault, width: 1200, height: 630, alt: "TJFit — Premium Fitness Transformation Platform" }
      ]
    }
  };
}

export default async function LocaleLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ locale?: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const routing = requireSupportedLocaleParam(params?.locale);
  const copy = resolveCopyLocale(routing);
  const direction = LOCALE_META[routing].dir;

  return (
    <div dir={direction} lang={routing}>
      <LocaleDocument locale={routing} direction={direction} />
      <DeviceProvider>
        <SiteShell locale={copy}>
          <PageTransition>{children}</PageTransition>
        </SiteShell>
        <CookieConsentBanner locale={routing} />
      </DeviceProvider>
    </div>
  );
}
