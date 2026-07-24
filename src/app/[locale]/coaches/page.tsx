import Link from "next/link";
import { ArrowRight, BadgeCheck, ChartNoAxesCombined, ShieldCheck } from "lucide-react";

import { isLocale } from "@/lib/i18n";

export default async function CoachesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  return (
    <div className="page-shell py-14 sm:py-20">
      <section className="grid gap-10 border-b border-white/10 pb-14 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          <span className="badge">TJFit coach network / private intake</span>
          <h1 className="mt-7 max-w-[11ch] font-display text-5xl font-semibold leading-[0.88] tracking-[-0.06em] text-white sm:text-7xl">
            Coaching built on proof.
          </h1>
        </div>
        <div>
          <p className="text-base leading-8 text-zinc-300">
            TJFit is onboarding its first verified coaching group privately. Public profiles appear only after identity, qualification and service checks are complete.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/become-a-coach`}
              className="gradient-button inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold"
            >
              Apply as a coach
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={`/${locale}/support`}
              className="inline-flex items-center rounded-2xl border border-white/10 px-5 py-3.5 text-sm text-zinc-200 transition hover:bg-white/5"
            >
              Request a match
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 my-14 md:grid-cols-3">
        {[
          [BadgeCheck, "Verified identity", "Profiles are tied to accountable people, not anonymous listings."],
          [ShieldCheck, "Reviewed credentials", "Qualification and scope checks happen before marketplace visibility."],
          [ChartNoAxesCombined, "Measurable service", "Retention, response and client-success signals shape future ranking."]
        ].map(([Icon, title, description]) => {
          const Glyph = Icon as typeof BadgeCheck;
          return (
            <article key={title as string} className="min-h-64 bg-background p-8">
              <Glyph className="h-6 w-6 text-accent-soft" aria-hidden />
              <h2 className="mt-14 font-display text-2xl font-semibold tracking-[-0.04em] text-white">
                {title as string}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{description as string}</p>
            </article>
          );
        })}
      </section>

      <div className="glass-panel grid gap-8 rounded-[2rem] p-7 sm:p-9 lg:grid-cols-[0.65fr_1.35fr]">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">
          Launch standard
        </p>
        <div>
          <h2 className="max-w-[17ch] font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
            No fabricated coach profiles. No paid ranking disguised as trust.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
            Until the first verified cohort is approved, TJFit keeps the directory intentionally closed. That protects members and gives real coaches a cleaner marketplace when booking opens.
          </p>
        </div>
      </div>
    </div>
  );
}
