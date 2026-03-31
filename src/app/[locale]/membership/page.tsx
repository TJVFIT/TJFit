import Link from "next/link";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
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

      <section className="mt-14">
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{copy.pricingTitle}</h2>
        <p className="mt-3 max-w-2xl text-sm text-zinc-500 sm:text-[15px]">{copy.pricingSub}</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {copy.tiers.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-8 ring-1 ring-white/[0.04]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">{copy.tierStatus}</p>
              <p className="mt-4 font-display text-xl font-semibold text-white">{t.name}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{t.teaser}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-xs text-zinc-600 sm:text-sm">{copy.pricingFootnote}</p>
      </section>

      <div className="mt-14 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 sm:px-10">
        <h2 className="font-display text-lg font-semibold text-white sm:text-xl">{copy.waitlistTitle}</h2>
        <p className="mt-2 text-sm text-zinc-500">{copy.waitlistSub}</p>
        <div className="mt-8 max-w-xl">
          <LeadCaptureForm locale={locale} source="membership-waitlist-page" variant="panel" />
        </div>
      </div>

      <PremiumPanel className="mt-12 flex flex-col gap-4 sm:flex-row">
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
