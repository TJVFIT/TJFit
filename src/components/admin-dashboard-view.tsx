import { adminStats, adminAdvancedStats, coaches } from "@/lib/content";
import { BrandLogo } from "@/components/brand-logo";
import { StatGrid } from "@/components/ui";
import { AdminCoachApplications } from "@/components/admin-coach-applications";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export function AdminDashboardView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <BrandLogo variant="mark" align="center" className="h-10 w-10 shrink-0" />
          <span className="badge">{dict.dashboard.admin.badge}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
          {dict.dashboard.admin.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          {dict.dashboard.admin.subtitle}
        </p>
      </div>

      <StatGrid stats={adminStats} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminAdvancedStats.map((stat) => (
          <div key={stat.label} className="glass-panel rounded-[24px] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{stat.label}</p>
            <p className="mt-4 text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCoachApplications dict={dict.admin} />
        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-lg font-semibold text-white">{dict.admin.quickActions}</p>
          <div className="mt-6 space-y-3">
            <Link
              href={`/${locale}/admin`}
              className="block w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-accent/40"
            >
              {dict.admin.fullAdminPanel}
            </Link>
            <button className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-accent/40">
              {dict.admin.approveCoaches}
            </button>
            <button className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-200 transition hover:border-accent/40">
              {dict.admin.managePayments}
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[32px] p-6">
        <p className="text-lg font-semibold text-white">{dict.admin.coachList}</p>
        <p className="mt-2 text-sm text-zinc-400">{dict.admin.coachListSubtitle}</p>
        <div className="mt-6 max-h-48 space-y-2 overflow-y-auto">
          {coaches.length === 0 ? (
            <p className="text-sm text-zinc-500">No coaches yet.</p>
          ) : (
            coaches.slice(0, 8).map((c) => (
              <div
                key={c.slug}
                className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="font-medium text-white">{c.name}</span>
                <span className="text-zinc-400">{c.specialty} · {c.country}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
