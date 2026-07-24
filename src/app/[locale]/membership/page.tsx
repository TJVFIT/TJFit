import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { membershipPlans } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return null;
  }

  const plan = membershipPlans[0];

  return (
    <div className="page-shell py-14 sm:py-20">
      <section className="grid gap-10 border-b border-white/10 pb-14 lg:grid-cols-[1fr_0.72fr] lg:items-end">
        <div>
          <span className="badge">TJFit membership / founding access</span>
          <h1 className="mt-7 max-w-[10ch] font-display text-5xl font-semibold leading-[0.88] tracking-[-0.06em] text-white sm:text-7xl">
            One membership. Less friction.
          </h1>
        </div>
        <p className="max-w-[58ch] text-base leading-8 text-zinc-300">
          Put programs, priority booking, challenges and member pricing inside one calm training system. Create an account now to join the founding-access queue.
        </p>
      </section>

      <section className="grid gap-8 py-14 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="glass-panel relative overflow-hidden rounded-[2rem] border-accent-soft/20 p-7 sm:p-9">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <Sparkles className="h-6 w-6 text-accent-soft" aria-hidden />
          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-soft">
            {plan.name}
          </p>
          <div className="mt-5 flex items-end gap-2">
            <span className="font-display text-6xl font-semibold tracking-[-0.06em] text-white">
              {plan.monthlyPrice}
            </span>
            <span className="pb-2 text-sm text-zinc-400">TRY / month</span>
          </div>
          <ul className="mt-8 space-y-4 border-t border-white/10 pt-7">
            {plan.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-accent/15 text-accent-soft">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <Link
            href={`/${locale}/signup?intent=membership`}
            className="gradient-button mt-9 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold"
          >
            Join founding access
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
            No membership charge is taken during account creation.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-2">
          {[
            ["01", "Train", "Follow structured programs with clear weekly progression and practical recovery direction."],
            ["02", "Adapt", "Use TJAI’s safety-gated matching to narrow the catalog around your real training setup."],
            ["03", "Connect", "Get priority access as verified coaches and group training experiences enter the platform."],
            ["04", "Save", "Use member pricing and TJFit Coins across eligible programs and challenge entries."]
          ].map(([number, title, description]) => (
            <article key={number} className="min-h-52 bg-background p-7 sm:p-8">
              <p className="font-mono text-[10px] text-accent-soft">{number}</p>
              <h2 className="mt-10 font-display text-2xl font-semibold tracking-[-0.04em] text-white">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="border-t border-white/10 pt-8 text-sm leading-7 text-zinc-500">
        Membership availability, benefits and pricing can vary during the founding rollout. Final billing terms are shown before any paid activation.
      </div>
    </div>
  );
}
