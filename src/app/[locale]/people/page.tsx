import { redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n";

export default async function PeopleIndexRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam ?? "") ? localeParam : "en";
  redirect(`/${locale}/people/search`);
}
