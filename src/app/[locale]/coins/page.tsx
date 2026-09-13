import { redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n";

export default async function CoinsRedirectPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const locale = isLocale(params?.locale ?? "") ? params.locale : "en";
  redirect(`/${locale}/tjai/credits`);
}
