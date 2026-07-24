import { redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n";

export default async function CoinsRedirectPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam ?? "") ? localeParam : "en";
  redirect(`/${locale}/tjai/credits`);
}
