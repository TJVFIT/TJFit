import Link from "next/link";
import { PremiumPageShell, PremiumPanel, PremiumSectionTitle } from "@/components/premium";
import { getCoachesListingCopy } from "@/lib/premium-public-copy";
import { requireLocaleParam } from "@/lib/require-locale";

export default function CoachesPage({ params }: { params: { locale: string } }) {
  const locale = requireLocaleParam(params.locale);
  const copy = getCoachesListingCopy(locale);

  return (
    <PremiumPageShell>
      <PremiumSectionTitle eyebrow={copy.badge} title={copy.title} subtitle={copy.body} />

      <h2 className="mt-12 text-center font-display text-lg font-semibold text-white sm:text-xl">{copy.standardsTitle}</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {copy.standards.map((line) => (
          <div
            key={line}
            className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent px-6 py-8"
          >
            <div className="h-px w-12 rounded-full bg-cyan-400/40" aria-hidden />
            <p className="mt-6 text-sm leading-relaxed text-zinc-400">{line}</p>
          </div>
        ))}
      </div>

      <PremiumPanel className="mt-14 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
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
        <div
          className="inline-flex flex-1 cursor-not-allowed flex-col items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-3 text-center sm:min-w-[200px]"
          role="group"
          aria-disabled="true"
          aria-label={`${copy.comingSoonLabel}: ${copy.ctaBecomeCoach}`}
        >
          <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90">
            {copy.comingSoonLabel}
          </span>
          <span className="text-sm font-medium text-zinc-500">{copy.ctaBecomeCoach}</span>
        </div>
      </PremiumPanel>
    </PremiumPageShell>
  );
}
