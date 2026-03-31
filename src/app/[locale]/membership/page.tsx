import Link from "next/link";
import { PremiumPageShell, PremiumPanel, PremiumSectionTitle } from "@/components/premium";
import { getMembershipCopy } from "@/lib/premium-public-copy";
import { isLocale, type Locale } from "@/lib/i18n";

export default function MembershipPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  const locale = params.locale as Locale;
  const copy = getMembershipCopy(locale);

  return (
    <PremiumPageShell>
      <PremiumSectionTitle eyebrow={copy.badge} title={copy.title} subtitle={copy.body} />
      <PremiumPanel className="flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/${locale}/programs`}
          className="lux-btn-primary inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-[#05080a]"
        >
          {copy.ctaExplore}
        </Link>
        <Link
          href={`/${locale}/login`}
          className="lux-btn-secondary inline-flex flex-1 items-center justify-center rounded-full px-6 py-3 text-sm font-medium"
        >
          {copy.ctaAccount}
        </Link>
      </PremiumPanel>
    </PremiumPageShell>
  );
}
