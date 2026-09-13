import type { Metadata } from "next";

import { EquipmentStore } from "@/components/store/equipment-store";
import { locales } from "@/lib/i18n";
import { requireLocaleParam } from "@/lib/require-locale";
import { getSiteUrl } from "@/lib/site-url";
import { STORE_COPY } from "@/lib/store/catalog";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  const copy = STORE_COPY[locale];
  const url = `${getSiteUrl()}/${locale}/store`;
  return {
    title: { absolute: `${copy.collection} | TJFit` },
    description: copy.description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((language) => [language, `${getSiteUrl()}/${language}/store`]))
    },
    openGraph: { title: `${copy.collection} | TJFit`, description: copy.description, url }
  };
}

export default async function StorePage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);
  return <EquipmentStore locale={locale} />;
}
