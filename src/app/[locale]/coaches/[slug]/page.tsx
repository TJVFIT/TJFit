import { CoachProfileView } from "@/components/coach-profile-view";
import { requireLocaleParam } from "@/lib/require-locale";

export default function CoachProfilePage({ params }: { params: { locale: string; slug: string } }) {
  const locale = requireLocaleParam(params.locale);

  return <CoachProfileView locale={locale} slug={params.slug ?? ""} />;
}
