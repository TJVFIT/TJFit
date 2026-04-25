import { coachDashboardStats, walletTransactions } from "@/lib/content";
import { CoachMyStudentsPanel } from "@/components/coach-my-students-panel";
import { CoachAnalyticsWidget } from "@/components/coach-analytics-widget";
import { Logo } from "@/components/ui/Logo";
import { StatGrid } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function CoachDashboardView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale).dashboard.coach;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Logo variant="icon" size="navbar" href={`/${locale}`} className="shrink-0" />
          <span className="badge">{d.badge}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
          {d.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          {d.subtitle}
        </p>
      </div>

      <StatGrid stats={coachDashboardStats} />
      <CoachAnalyticsWidget />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.calendar}</p>
            <p className="mt-2 text-sm text-muted">
              {d.calendarSubtitle}
            </p>
            <div className="mt-6">
              <p className="text-sm text-faint">No upcoming sessions.</p>
            </div>
            <p className="mt-4 text-xs text-faint">
              {d.preparedForData}
            </p>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.texts}</p>
            <p className="mt-2 text-sm text-muted">
              {d.textsSubtitle}
            </p>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-sm text-faint">
                {d.textsEmpty}
              </p>
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.myStudents}</p>
            <CoachMyStudentsPanel locale={locale} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {["My Programs", "My Sessions", "Progress Tracker", "Program builder"].map((card) => (
              <div key={card} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="font-medium text-white">{card}</p>
                <p className="mt-2 text-sm text-muted">{d.preparedForData}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.referralTitle}</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {d.referralSubtitle}
            </p>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4 text-sm text-faint">
              Your referral code will appear here.
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.wallet}</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {d.walletSubtitle}
            </p>
            <div className="mt-4 rounded-[24px] border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-muted">Available balance</p>
              <p className="mt-2 text-3xl font-semibold text-white">0 TRY</p>
            </div>
            <div className="mt-5 space-y-3">
              {walletTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-bright"
                >
                  <span>{tx.label}</span>
                  <span className={tx.amount >= 0 ? "text-green-400" : "text-white"}>
                    {tx.amount >= 0 ? "+" : ""}{tx.amount} TRY
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.rank}</p>
            <p className="mt-3 text-sm text-muted">—</p>
            <p className="mt-2 text-xs text-faint">
              {d.rankSubtitle}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
