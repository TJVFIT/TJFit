"use client";

import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { programs } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { localizeProgram } from "@/lib/program-localization";
import { getUserDashboardCopy } from "@/lib/user-dashboard-copy";

type Summary = {
  latestPaidProgramSlug: string | null;
  paidOrderCount: number;
  progressEntryCount: number;
  milestoneCount: number;
  recentEntryDates: string[];
};

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="tj-skeleton tj-shimmer h-[120px] w-full rounded-[20px]" />
      <div className="space-y-3">
        <div className="tj-skeleton tj-shimmer h-5 w-40 rounded-md" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="tj-skeleton tj-shimmer min-h-[48px] w-full rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="tj-skeleton tj-shimmer h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function UserDashboardView({ locale }: { locale: Locale }) {
  const t = getUserDashboardCopy(locale);
  const { loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  const load = useCallback(async () => {
    setFetching(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/user/dashboard-summary", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(typeof data.error === "string" ? data.error : t.loadError);
        setSummary(null);
        return;
      }
      setSummary({
        latestPaidProgramSlug: typeof data.latestPaidProgramSlug === "string" ? data.latestPaidProgramSlug : null,
        paidOrderCount: Number(data.paidOrderCount ?? 0),
        progressEntryCount: Number(data.progressEntryCount ?? 0),
        milestoneCount: Number(data.milestoneCount ?? 0),
        recentEntryDates: Array.isArray(data.recentEntryDates) ? data.recentEntryDates.filter((x: unknown) => typeof x === "string") : []
      });
    } catch {
      setLoadError(t.loadError);
      setSummary(null);
    } finally {
      setFetching(false);
    }
  }, [t.loadError]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  if (authLoading || fetching) {
    return <DashboardSkeleton />;
  }

  if (loadError || !summary) {
    return (
      <div className="tj-empty-state">
        <p className="text-sm text-red-400">{loadError ?? t.loadError}</p>
        <button
          type="button"
          className="mt-4 rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:border-white/25"
          onClick={() => void load()}
        >
          {t.retry}
        </button>
      </div>
    );
  }

  const hasPaidProgram = Boolean(summary.latestPaidProgramSlug);
  const hasActivity = summary.progressEntryCount > 0 || summary.milestoneCount > 0;
  const isBrandNew = !hasPaidProgram && !hasActivity;

  const staticProgram = summary.latestPaidProgramSlug
    ? programs.find((p) => p.slug === summary.latestPaidProgramSlug)
    : null;
  const programTitle = staticProgram ? localizeProgram(staticProgram, locale).title : summary.latestPaidProgramSlug;

  return (
    <div className="space-y-8">
      {isBrandNew ? (
        <div className="tj-empty-state flex flex-col items-center">
          <Dumbbell className="mx-auto h-8 w-8 text-[var(--color-text-muted)]" aria-hidden strokeWidth={1.5} />
          <h2 className="mt-4 text-lg font-semibold text-[var(--color-text-secondary)]">{t.emptyHeading}</h2>
          <p className="tj-empty-state__text mt-2 max-w-[300px] text-sm text-[var(--color-text-muted)]">{t.emptySub}</p>
          <Link
            href={`/${locale}/programs`}
            className="lux-btn-primary mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full px-8 py-2.5 text-sm font-bold text-[#09090B]"
          >
            {t.emptyCta}
          </Link>
        </div>
      ) : null}

      {!isBrandNew && hasPaidProgram ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">{t.activeProgram}</h2>
          <Link
            href={`/${locale}/programs/${encodeURIComponent(summary.latestPaidProgramSlug!)}`}
            className="glass-panel block rounded-[24px] p-6 transition hover:border-white/15"
          >
            <p className="text-lg font-semibold text-white">{programTitle}</p>
            <p className="mt-2 text-sm text-cyan-300/90">Continue program →</p>
          </Link>
          {summary.milestoneCount === 0 ? (
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{t.quietComplete}</p>
          ) : null}
        </section>
      ) : null}

      {!isBrandNew && summary.progressEntryCount > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">{t.recentActivity}</h2>
          <div className="glass-panel rounded-[24px] p-6">
            <ul className="space-y-0 divide-y divide-white/[0.06] text-sm text-zinc-300">
              {summary.recentEntryDates.map((d) => (
                <li key={d} className="flex min-h-[48px] items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <span className="text-zinc-500">Log</span>
                  <time dateTime={d}>{d}</time>
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/progress`} className="mt-4 inline-block text-sm font-medium text-cyan-300/90 hover:text-cyan-200">
              {t.progressLink}
            </Link>
          </div>
          {!hasPaidProgram ? <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{t.quietComplete}</p> : null}
        </section>
      ) : null}

      {!isBrandNew ? (
        <section className="grid grid-cols-3 gap-3">
          <div className="glass-panel rounded-[20px] p-4 text-center">
            <p className="text-2xl font-semibold text-white">{summary.paidOrderCount}</p>
            <p className="mt-1 text-xs text-zinc-500">{t.statsPrograms}</p>
          </div>
          <div className="glass-panel rounded-[20px] p-4 text-center">
            <p className="text-2xl font-semibold text-white">{summary.progressEntryCount}</p>
            <p className="mt-1 text-xs text-zinc-500">{t.statsEntries}</p>
          </div>
          <div className="glass-panel rounded-[20px] p-4 text-center">
            <p className="text-2xl font-semibold text-white">{summary.milestoneCount}</p>
            <p className="mt-1 text-xs text-zinc-500">{t.statsMilestones}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
