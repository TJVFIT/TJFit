import { redirect } from "next/navigation";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function MessagingSettingsRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = requireLocaleParam(localeParam);
  redirect(`/${locale}/profile/edit`);
}
