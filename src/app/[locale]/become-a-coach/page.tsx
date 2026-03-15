import { rankingTiers } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export default function BecomeCoachPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <section className="glass-panel rounded-[36px] p-8">
          <span className="badge">Become a Coach</span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Join a premium coaching marketplace designed to grow coach earnings.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
            TJFit attracts coaches with high-trust profiles, multilingual positioning, ranked visibility, referrals,
            and a premium client experience.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "Featured placement for high performers",
              "Referral codes and repeat revenue",
              "Coach dashboard with bookings and earnings",
              "Global audience with English, Turkish, and Arabic support"
            ].map((point) => (
              <div key={point} className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm text-zinc-200">
                {point}
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[36px] p-6">
            <p className="text-lg font-semibold text-white">Coach magnet system</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Higher rank means better visibility, more trust, more clients, and stronger marketplace momentum.
            </p>
            <div className="mt-6 space-y-3">
              {rankingTiers.map((tier) => (
                <div key={tier.name} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="font-medium text-white">{tier.name}</p>
                  <p className="mt-2 text-sm text-zinc-400">{tier.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[36px] p-6">
            <p className="text-lg font-semibold text-white">Coach application</p>
            <div className="mt-5 space-y-4">
              <input className="input" placeholder="Full name" />
              <input className="input" placeholder="Specialty" />
              <input className="input" placeholder="Languages" />
              <input className="input" placeholder="Country" />
              <textarea className="input min-h-32" placeholder="Tell us about your certifications and coaching style" />
              <button className="gradient-button w-full rounded-full px-5 py-3 text-sm font-medium text-white">
                Submit application
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
