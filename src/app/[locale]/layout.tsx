import type { Metadata } from "next";

import { LocaleDocument } from "@/components/locale-document";
import { SiteShell } from "@/components/site-shell";
import { BRAND } from "@/lib/brand-assets";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tjfit.com";

const TITLES: Record<Locale, string> = {
  en: "TJFit — AI Fitness Programs, Coaching & Nutrition | Transform Your Body",
  tr: "TJFit — Yapay Zeka Fitness Programları ve Koçluk | Vücudunu Dönüştür",
  ar: "TJFit — برامج اللياقة بالذكاء الاصطناعي والتدريب | حوّل جسدك",
  es: "TJFit — Programas de Fitness con IA y Coaching | Transforma Tu Cuerpo",
  fr: "TJFit — Programmes Fitness IA et Coaching | Transformez Votre Corps"
};

const DESCRIPTIONS: Record<Locale, string> = {
  en: "12-week fitness programs, certified coaches, and TJAI — quiz preview is free; pay to unlock your full AI plan. 10 languages.",
  tr: "12 haftalık programlar, sertifikalı koçlar ve TJAI — quiz ön izlemesi ücretsiz; tam plan ücretli. 10 dil.",
  ar: "برامج لياقة لمدة 12 أسبوعاً، ومدربون معتمدون، وـTJAI — معاينة الاختبار مجانية؛ ادفع لخطتك الكاملة. 10 لغات.",
  es: "Programas de 12 semanas, coaches certificados y TJAI — vista previa del cuestionario gratis; paga por el plan completo. 10 idiomas.",
  fr: "Programmes 12 semaines, coachs certifies et TJAI — aperçu gratuit ; plan complet payant. 10 langues."
};

/** BCP-47 tags for `<html lang>` and OG locale. */
const BCP47: Record<SupportedLocale, string> = {
  en: "en_US",
  tr: "tr_TR",
  ar: "ar_SA",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_PT",
  ru: "ru_RU",
  hi: "hi_IN",
  id: "id_ID"
};

export function generateMetadata({ params }: { params: { locale?: string } }): Metadata {
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
    title,
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

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale?: string };
}) {
  const routing = requireSupportedLocaleParam(params?.locale);
  const copy = resolveCopyLocale(routing);
  const direction = LOCALE_META[routing].dir;

  return (
    <div dir={direction} lang={routing}>
      <LocaleDocument locale={routing} direction={direction} />
      <SiteShell locale={copy}>{children}</SiteShell>
    </div>
  );
}
