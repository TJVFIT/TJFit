import { PublicProfileView } from "@/components/public-profile-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default function ProfileByUsernamePage({ params }: { params: { locale: string; username: string } }) {
  const locale = requireLocaleParam(params.locale);

  return <PublicProfileView locale={locale} username={params.username ?? ""} />;
}
