import { CoachProfileView } from "@/components/coach-profile-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default async function CoachProfilePage(props: { params: Promise<{ locale: string; slug: string }> }) {
  const params = await props.params;
  const locale = requireLocaleParam(params.locale);

  return <CoachProfileView locale={locale} slug={params.slug ?? ""} />;
}
