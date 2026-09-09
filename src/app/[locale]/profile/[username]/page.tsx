import { PublicProfileView } from "@/components/public-profile-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function ProfileByUsernamePage(props: { params: Promise<{ locale: string; username: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);

  return <PublicProfileView locale={locale} username={params.username ?? ""} />;
}
