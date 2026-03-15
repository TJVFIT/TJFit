import { dashboardStats, walletTransactions } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { StatGrid } from "@/components/ui";

export default function UserDashboardPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="badge">User Dashboard</span>
          <h1 className="mt-4 text-4xl font-semibold text-white">Your coaching hub.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Upcoming sessions, programs, progress tracking, training uploads, and referral credits in one place.
          </p>
        </div>
      </div>

      <StatGrid stats={dashboardStats} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">My coach</p>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xl font-semibold text-white">Layla Haddad</p>
            <p className="mt-2 text-sm text-zinc-400">Next video session: Tuesday, 18:30</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {["Chat", "Reschedule", "View plan"].map((action) => (
                <button key={action} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white">
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[
              "My Programs",
              "My Sessions",
              "Progress Tracker",
              "Upload training video",
              "Session recordings",
              "Transformation profile"
            ].map((card) => (
              <div key={card} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-medium text-white">{card}</p>
                <p className="mt-2 text-sm text-zinc-400">Premium dashboard module ready for Supabase data wiring.</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/30 p-6">
            <p className="text-lg font-semibold text-white">Smart progress tracker</p>
            <div className="mt-6 space-y-4">
              {[
                ["Weight", "72kg", "w-3/4"],
                ["Body fat", "21%", "w-2/3"],
                ["Strength", "Bench +12kg", "w-4/5"],
                ["Training frequency", "4.3 / week", "w-[88%]"]
              ].map(([label, value, width]) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-sm text-zinc-300">
                    <span>{label}</span>
                    <span className="text-white">{value}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div className={`h-2 rounded-full bg-gradient-to-r from-accent to-cyan-300 ${width}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">Referral dashboard</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Invite a friend, and when they book a session you receive 20 TRY in training credit.
            </p>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4 text-sm text-zinc-300">
              tjfit.com/ref/yousi20
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">Wallet system</p>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Rewards, refunds, and booking payments flow through the internal wallet and can be used at checkout.
            </p>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-zinc-400">Available balance</p>
              <p className="mt-2 text-3xl font-semibold text-white">100 TRY</p>
            </div>
            <div className="mt-5 space-y-3">
              {walletTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  <span>{transaction.label}</span>
                  <span className={transaction.amount >= 0 ? "text-green-400" : "text-white"}>
                    {transaction.amount >= 0 ? "+" : ""}
                    {transaction.amount} TRY
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">Progress snapshot</p>
            <div className="mt-6 space-y-4">
              {[
                "Weight trend: -2.1 kg",
                "Workout adherence: 87%",
                "Mobility score: +18%",
                "Sessions completed: 6"
              ].map((item) => (
                <div key={item} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">Viral share features</p>
            <div className="mt-5 grid gap-3">
              {[
                "Share transformation to Instagram",
                "Share challenge progress to TikTok",
                "Send coach review on WhatsApp",
                "Post milestone update to X"
              ].map((item) => (
                <button key={item} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-200">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
