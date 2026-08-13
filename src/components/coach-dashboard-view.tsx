import { CalendarDays, Gift, LayoutGrid, Star } from "lucide-react";

import { CoachMyStudentsPanel } from "@/components/coach-my-students-panel";
import { CoachAnalyticsWidget } from "@/components/coach-analytics-widget";
import { CoachEarningsWidget } from "@/components/coach-earnings-widget";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/ui/Logo";
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

      <CoachAnalyticsWidget />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.calendar}</p>
            <p className="mt-2 text-sm text-muted">
              {d.calendarSubtitle}
            </p>
            <div className="mt-6">
              <EmptyState icon={CalendarDays} subtext={d.calendarEmpty} />
            </div>
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

          <EmptyState icon={LayoutGrid} subtext={d.coachToolsEmpty} />
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.referralTitle}</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {d.referralSubtitle}
            </p>
            <div className="mt-6">
              <EmptyState icon={Gift} subtext={d.referralEmpty} />
            </div>
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.wallet}</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              {d.walletSubtitle}
            </p>
            <CoachEarningsWidget locale={locale} />
          </div>

          <div className="glass-panel rounded-[32px] p-6">
            <p className="text-lg font-semibold text-white">{d.rank}</p>
            <div className="mt-3">
              <EmptyState icon={Star} subtext={d.rankSubtitle} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
