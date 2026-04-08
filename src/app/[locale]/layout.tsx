import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LocaleDocument } from "@/components/locale-document";
import { SiteShell } from "@/components/site-shell";
import { Locale, getDirection, isLocale, locales } from "@/lib/i18n";

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
  const titles: Record<Locale, string> = {
    en: "TJFit — AI Fitness Programs, Coaching & Nutrition | Transform Your Body",
    tr: "TJFit — Yapay Zeka Fitness Programları ve Koçluk | Vücudunu Dönüştür",
    ar: "TJFit — برامج اللياقة بالذكاء الاصطناعي والتدريب | حوّل جسدك",
    es: "TJFit — Programas de Fitness con IA y Coaching | Transforma Tu Cuerpo",
    fr: "TJFit — Programmes Fitness IA et Coaching | Transformez Votre Corps"
  };
  const descriptions: Record<Locale, string> = {
    en: "Build your dream body with AI-powered 12-week fitness programs, certified coaches, and TJAI — your personal AI coach. Free programs available. Works in 5 languages.",
    tr: "Yapay zeka destekli 12 haftalık fitness programları, sertifikalı koçlar ve TJAI ile hayalinizdeki vücuda kavuşun. Ücretsiz başlayın.",
    ar: "ابنِ جسمك المثالي مع برامج لياقة مدعومة بالذكاء الاصطناعي، ومدربين معتمدين، وـTJAI — مدربك الشخصي. ابدأ مجاناً.",
    es: "Transforma tu cuerpo con programas fitness con IA, coaches certificados y TJAI. Empieza gratis.",
    fr: "Transformez votre corps avec des programmes fitness IA, des coachs certifies et TJAI. Commencez gratuitement."
  };
  const ogImage = locale === "ar" ? "/og-image-ar.jpg" : "/og-image.jpg";
  const ogLocale =
    locale === "tr" ? "tr_TR" : locale === "ar" ? "ar_SA" : locale === "es" ? "es_ES" : locale === "fr" ? "fr_FR" : "en_US";

  return {
    title: titles[locale],
    description: descriptions[locale],
    openGraph: {
      type: "website",
      siteName: "TJFit",
      title: titles[locale],
      description: descriptions[locale],
      locale: ogLocale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "TJFit — Premium Fitness Transformation Platform"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale],
      description: descriptions[locale],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "TJFit — Premium Fitness Transformation Platform"
        }
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
