import Link from "next/link";
import { PremiumPageShell, PremiumPanel, PremiumSectionTitle } from "@/components/premium";
import { getCoachesListingCopy } from "@/lib/premium-public-copy";
import { isLocale, type Locale } from "@/lib/i18n";

export default function CoachesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const locale = params.locale as Locale;
  const copy = getCoachesListingCopy(locale);

  return (
    <PremiumPageShell>
      <PremiumSectionTitle eyebrow={copy.badge} title={copy.title} subtitle={copy.body} />
      <PremiumPanel className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <Link
          href={`/${locale}/programs`}
          className="lux-btn-primary inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-center text-sm font-semibold text-[#05080a] sm:min-w-[200px]"
        >
          {copy.ctaPrograms}
        </Link>
        <Link
          href={`/${locale}/signup`}
          className="lux-btn-secondary inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-center text-sm font-medium sm:min-w-[200px]"
        >
          {copy.ctaSignup}
        </Link>
        <Link
          href={`/${locale}/become-a-coach`}
          className="inline-flex flex-1 items-center justify-center rounded-full border border-violet-400/25 bg-violet-500/10 px-6 py-3 text-center text-sm font-medium text-violet-200/95 transition hover:border-violet-400/40 sm:min-w-[200px]"
        >
          {copy.ctaBecomeCoach}
        </Link>
      </PremiumPanel>
    </PremiumPageShell>
  );
}
