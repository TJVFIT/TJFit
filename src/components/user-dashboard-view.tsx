"use client";

import Link from "next/link";
import { Activity, Dumbbell, Flame, Plus, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { programs } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { localizeProgram } from "@/lib/program-localization";
import { getUserDashboardCopy } from "@/lib/user-dashboard-copy";
import { cn } from "@/lib/utils";

function greetingLead(locale: Locale, hour: number) {
  const table: Record<Locale, [string, string, string]> = {
    en: ["Good morning,", "Good afternoon,", "Good evening,"],
    tr: ["Gunaydin,", "Iyi gunler,", "Iyi aksamlar,"],
    ar: ["صباح الخير،", "مساء الخير،", "مساء الخير،"],
    es: ["Buenos dias,", "Buenas tardes,", "Buenas noches,"],
    fr: ["Bonjour,", "Bon apres-midi,", "Bonsoir,"]
  };
  const row = table[locale] ?? table.en;
  const idx = hour < 12 ? 0 : hour < 17 ? 1 : 2;
  return row[idx];
}

function formatDashboardDate(locale: Locale) {
  const loc =
    locale === "tr" ? "tr-TR" : locale === "ar" ? "ar" : locale === "es" ? "es" : locale === "fr" ? "fr-FR" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date());
}

type Summary = {
  latestPaidProgramSlug: string | null;
  paidOrderCount: number;
  progressEntryCount: number;
  milestoneCount: number;
  recentEntryDates: string[];
  currentStreak: number;
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

// F2 — Quick log widget
function QuickLogWidget({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submit = async () => {
    if (!exercise.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/progress/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          exercise: exercise.trim(),
          sets: sets ? Number(sets) : null,
          reps: reps ? Number(reps) : null,
          weight_kg: weight ? Number(weight) : null
        })
      });
      setExercise(""); setSets(""); setReps(""); setWeight("");
      setSaved(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => { setSaved(false); setOpen(false); }, 2000);
    } finally {
      setSaving(false);
    }
  };

  const placeholder = locale === "tr" ? "Egzersiz adı" : locale === "ar" ? "اسم التمرين" : locale === "es" ? "Ejercicio" : locale === "fr" ? "Exercice" : "Exercise name";

  return (
    <section className="rounded-2xl border border-[#1E2028] bg-[#111215]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2.5">
          <Dumbbell className="h-4 w-4 text-[#22D3EE]" strokeWidth={2} />
          <span className="text-sm font-semibold text-white">Log today&apos;s workout</span>
        </div>
        <Plus className={cn("h-4 w-4 text-zinc-500 transition-transform duration-200", open && "rotate-45")} />
      </button>

      {open && (
        <div className="border-t border-[#1E2028] px-6 pb-5 pt-4">
          {saved ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-500/25 bg-[#0D1F17] px-4 py-3 text-sm font-medium text-green-400">
              <CheckCircle2 className="h-4 w-4" /> Logged!
            </div>
          ) : (
            <div className="grid gap-3">
              <input
                className="input"
                placeholder={placeholder}
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <div className="grid grid-cols-3 gap-2">
                <input className="input text-sm" placeholder="Sets" type="number" min="1" value={sets} onChange={(e) => setSets(e.target.value)} />
                <input className="input text-sm" placeholder="Reps" type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} />
                <input className="input text-sm" placeholder="kg" type="number" step="0.5" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={submit}
                  disabled={saving || !exercise.trim()}
                  className="inline-flex min-h-[38px] items-center justify-center rounded-full bg-[#22D3EE] px-5 text-sm font-bold text-black transition-opacity disabled:opacity-50"
                >
                  {saving ? "Logging…" : "Log workout"}
                </button>
                <Link href={`/${locale}/progress`} className="text-xs text-zinc-500 hover:text-zinc-300">
                  Full progress log →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function UserDashboardView({ locale }: { locale: Locale }) {
  const t = getUserDashboardCopy(locale);
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [hour, setHour] = useState<number | null>(null);
  const [headerOn, setHeaderOn] = useState(false);
  const [progressOn, setProgressOn] = useState(false);

  useEffect(() => {
    setHour(new Date().getHours());
  }, []);

  useEffect(() => {
    const tmr = requestAnimationFrame(() => setHeaderOn(true));
    return () => cancelAnimationFrame(tmr);
  }, []);

  useEffect(() => {
    if (!summary) return;
    const paid = Boolean(summary.latestPaidProgramSlug);
    const brandNew =
      !paid && summary.progressEntryCount === 0 && summary.milestoneCount === 0;
    if (brandNew || !paid) {
      setProgressOn(false);
      return;
    }
    const tmr = window.setTimeout(() => setProgressOn(true), 400);
    return () => window.clearTimeout(tmr);
  }, [summary]);

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
        recentEntryDates: Array.isArray(data.recentEntryDates) ? data.recentEntryDates.filter((x: unknown) => typeof x === "string") : [],
        currentStreak: Number(data.currentStreak ?? 0)
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

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "Athlete";

  const progressPct = Math.min(
    100,
    Math.round(
      summary.milestoneCount * 18 + summary.progressEntryCount * 6 + (hasPaidProgram ? 22 : 0)
    )
  );

  return (
    <div className="space-y-10">
      <header
        className={cn(
          "transition-[opacity,transform] duration-[400ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100",
          headerOn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-base text-[#52525B]">{hour !== null ? greetingLead(locale, hour) : "\u00a0"}</p>
            <p className="mt-1 break-words font-display text-[36px] font-extrabold leading-tight tracking-[-0.025em] text-white [hyphens:auto] md:text-[56px]">
              {displayName}.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* F3 — Streak counter */}
            {summary.currentStreak > 0 && (
              <div className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-bold text-orange-300">{summary.currentStreak} day streak</span>
              </div>
            )}
            <p className="text-sm text-[#52525B]">{formatDashboardDate(locale)}</p>
          </div>
        </div>
        <div
          className="mt-8 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.4),transparent)]"
          aria-hidden
        />
      </header>

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
          <h2 className="text-[13px] font-medium uppercase tracking-widest text-[#52525B]">{t.activeProgram}</h2>
          <Link
            href={`/${locale}/programs/${encodeURIComponent(summary.latestPaidProgramSlug!)}`}
            className="group/ap flex flex-col gap-6 rounded-2xl border border-[#1E2028] bg-[#111215] p-8 transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:border-[rgba(34,211,238,0.22)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)] motion-reduce:hover:transform-none [@media(hover:hover)]:hover:-translate-y-1"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-white">{programTitle}</p>
                <div className="mt-5 h-1 w-full max-w-md overflow-hidden rounded-full bg-[#1E2028]">
                  <div
                    className="h-full origin-left rounded-full bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] transition-transform duration-1000 ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none"
                    style={{ transform: `scaleX(${progressOn ? progressPct / 100 : 0})` }}
                  />
                </div>
              </div>
              <span className="inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-full border border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.08)] px-6 py-2.5 text-sm font-semibold text-[#22D3EE] transition-[transform,box-shadow] duration-150 group-hover/ap:scale-[1.02] group-hover/ap:shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                Continue →
              </span>
            </div>
          </Link>
          {summary.milestoneCount === 0 ? (
            <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{t.quietComplete}</p>
          ) : null}
        </section>
      ) : null}

      {/* F2 — Quick log widget */}
      {!isBrandNew && <QuickLogWidget locale={locale} />}

      {!isBrandNew && summary.progressEntryCount > 0 ? (
        <section className="space-y-3">
          <h2 className="text-[13px] font-medium uppercase tracking-widest text-[#52525B]">{t.recentActivity}</h2>
          <div className="rounded-2xl border border-[#1E2028] bg-[#111215] p-2 sm:p-4">
            <ul className="text-sm text-[#A1A1AA]">
              {summary.recentEntryDates.map((d) => (
                <li
                  key={d}
                  className="flex min-h-[48px] items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.04)] py-3.5 transition-[background-color] duration-150 ease-out last:border-b-0 [@media(hover:hover)]:hover:rounded-lg [@media(hover:hover)]:hover:bg-[rgba(255,255,255,0.02)] [@media(hover:hover)]:hover:px-3"
                >
                  <span className="flex items-center gap-2 text-white">
                    <Activity className="h-4 w-4 shrink-0 text-[#22D3EE]" strokeWidth={2} aria-hidden />
                    Log entry
                  </span>
                  <time className="text-[13px] text-[#52525B]" dateTime={d}>
                    {d}
                  </time>
                </li>
              ))}
            </ul>
            <Link
              href={`/${locale}/progress`}
              className="mt-4 inline-block text-sm font-medium text-[#22D3EE] transition-colors duration-150 hover:text-white"
            >
              {t.progressLink}
            </Link>
          </div>
          {!hasPaidProgram ? <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{t.quietComplete}</p> : null}
        </section>
      ) : null}

      {!isBrandNew ? (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(
            [
              [summary.paidOrderCount, t.statsPrograms],
              [summary.progressEntryCount, t.statsEntries],
              [summary.milestoneCount, t.statsMilestones],
              [summary.currentStreak, "Day streak"]
            ] as const
          ).map(([value, label]) => (
            <div
              key={label}
              className="rounded-[14px] border border-[#1E2028] bg-[#111215] p-6 text-center transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] [@media(hover:hover)]:hover:border-[rgba(34,211,238,0.2)] [@media(hover:hover)]:hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            >
              <p className="font-display text-[40px] font-extrabold leading-none text-[#22D3EE]">{value}</p>
              <p className="mt-2 text-[13px] font-medium uppercase tracking-widest text-[#52525B]">{label}</p>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
