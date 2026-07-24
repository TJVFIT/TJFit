import { PublicProfileView } from "@/components/public-profile-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function ProfileByUsernamePage({
  params
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale: localeParam, username } = await params;
  const locale = requireLocaleParam(localeParam);

  return <PublicProfileView locale={locale} username={username ?? ""} />;
}
