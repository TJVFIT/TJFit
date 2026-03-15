import { coachBoostOptions, coachDashboardStats } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { StatGrid } from "@/components/ui";

export default function CoachDashboardPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <span className="badge">Coach Dashboard</span>
        <h1 className="mt-4 text-4xl font-semibold text-white">Manage clients, bookings, and earnings.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          Coaches can manage bookings, upload programs, view earnings, create referral codes, and climb the ranking system.
        </p>
      </div>

      <StatGrid stats={coachDashboardStats} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <aside className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">Coach economy system</p>
          <div className="mt-6 space-y-3">
            {[
              "Bronze - 0 to 199 points",
              "Silver - 200 to 599 points",
              "Gold - 600 to 1199 points",
              "Elite - 1200+ points"
            ].map((tier) => (
              <div key={tier} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                {tier}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-5">
            <p className="text-sm text-zinc-400">Current visibility boost</p>
            <p className="mt-2 text-3xl font-semibold text-white">Gold Tier</p>
            <p className="mt-2 text-sm text-zinc-400">Ranking is based on rating, session volume, and client success.</p>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">Affiliate code</p>
            <p className="mt-2 text-2xl font-semibold text-white">EMRE10</p>
            <p className="mt-2 text-sm text-zinc-400">Users get a discount, coach earns commission.</p>
          </div>
        </aside>

        <section className="glass-panel rounded-[32px] p-6">
          <div className="grid gap-4 xl:grid-cols-2">
            {[
              "Client management",
              "Session calendar",
              "Program builder",
              "Analytics dashboard",
              "Referral dashboard",
              "Success tracking"
            ].map((module) => (
              <div key={module} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-medium text-white">{module}</p>
                <p className="mt-2 text-sm text-zinc-400">Prepared for Supabase-backed real data.</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
              <p className="text-lg font-semibold text-white">Program creation builder</p>
              <div className="mt-5 space-y-3">
                {[
                  "Exercise videos",
                  "Workout schedules",
                  "PDF guides",
                  "Nutrition plans"
                ].map((asset) => (
                  <div key={asset} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                    Drag and drop block: {asset}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
              <p className="text-lg font-semibold text-white">Coach marketplace boost system</p>
              <div className="mt-5 space-y-3">
                {coachBoostOptions.map((boost) => (
                  <div key={boost.name} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-white">{boost.name}</p>
                    <p className="mt-2 text-sm text-zinc-400">{boost.benefit}</p>
                    <p className="mt-2 text-sm text-zinc-300">{boost.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/30 p-6">
            <p className="text-lg font-semibold text-white">Coach analytics</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Conversion rate", "6.8%"],
                ["Retention rate", "88%"],
                ["Earnings per month", "39,100 TRY"],
                ["Client success rate", "87%"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
                  <p className="mt-3 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
