import { CoachProfileGate } from "@/components/marketing/coach-profile-gate";
import { getCoachProfileGateCopy } from "@/lib/premium-public-copy";
import { requireLocaleParam } from "@/lib/require-locale";

export default function CoachProfilePage({ params }: { params: { locale: string; slug: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = getCoachProfileGateCopy(locale);

  return <CoachProfileGate locale={locale} slug={params.slug ?? ""} copy={copy} />;
}
