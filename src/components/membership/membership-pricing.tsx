import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { PUBLIC_COPY, tjaiIntakeHref } from "@/lib/public-offers-copy";
import { TjaiUsageTierTable } from "@/components/pricing/tjai-usage-tier-table";

/** Legacy display entry point; new subscriptions are no longer offered here. */
export function MembershipPricing({ locale }: { locale: Locale }) {
  const c = PUBLIC_COPY[locale];
  return <div className="space-y-5"><TjaiUsageTierTable locale={locale} /><Link href={tjaiIntakeHref(locale)} className="inline-flex min-h-12 items-center rounded-md bg-violet-300 px-6 text-sm font-semibold text-black hover:bg-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300">{c.tjai.cta}</Link><p className="text-sm text-muted">{c.existingBody} <Link href={`/${locale}/ai`} className="text-violet-200 underline">{c.openAccount}</Link></p></div>;
}
