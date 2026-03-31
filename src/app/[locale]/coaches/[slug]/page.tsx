import { isLocale, type Locale } from "@/lib/i18n";
import { CoachProfileGate } from "@/components/marketing/coach-profile-gate";
import { getCoachProfileGateCopy } from "@/lib/premium-public-copy";

export default function CoachProfilePage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const locale = params.locale as Locale;
  const copy = getCoachProfileGateCopy(locale);

  return <CoachProfileGate locale={locale} slug={params.slug} copy={copy} />;
}
