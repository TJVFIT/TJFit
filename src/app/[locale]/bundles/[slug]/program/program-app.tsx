"use client";

/**
 * Interactive program app for a bundle.
 * Tabs: Today · Week · Recipes · Grocery · Progress.
 * Mobile-first. All mutations persist via Supabase browser client with
 * optimistic UI; reads happen server-side and are seeded as initial state.
 */

import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Dumbbell, FileDown, Soup, ShoppingCart, Sparkles, TrendingUp } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import type { Bundle, BundleRecipe } from "@/lib/bundles";
import { localizeBundle } from "@/lib/bundle-localization";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type LogRow = {
  week: number;
  day: string;
  exercise: string;
  set_index: number;
  reps: number | null;
  weight: number | null;
  completed: boolean;
};

type Tab = "today" | "week" | "recipes" | "grocery" | "progress";

const TAB_DEFS: Array<{ key: Tab; label: string; icon: typeof Dumbbell }> = [
  { key: "today", label: "Today", icon: Dumbbell },
  { key: "week", label: "Week", icon: ChevronRight },
  { key: "recipes", label: "Recipes", icon: Soup },
  { key: "grocery", label: "Grocery", icon: ShoppingCart },
  { key: "progress", label: "Progress", icon: TrendingUp }
];

export function ProgramApp({
  locale,
  bundle,
  currentWeek,
  logs,
  grocery
}: {
  locale: string;
  bundle: Bundle;
  currentWeek: number;
  logs: LogRow[];
  grocery: string[];
}) {
  const [tab, setTab] = useState<Tab>("today");
  const card = localizeBundle(bundle, locale);
  const days = bundle.weeklyTemplate ?? [];
  const todayIndex = new Date().getDay() % Math.max(days.length, 1);
  const [activeDayIndex, setActiveDayIndex] = useState(todayIndex);
  const activeDay = days[activeDayIndex];

  return (
    <section className="mx-auto max-w-3xl px-4 pb-32 pt-8 sm:px-6">
      <Link
        href={`/${locale}/bundles/${bundle.slug}`}
        className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
      >
        <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
        Back to bundle
      </Link>

      <header className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
            Week {currentWeek} of {bundle.weeks}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
            {card.name}
          </h1>
        </div>
        <a
          href={`/api/bundles/download/${bundle.slug}`}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-cyan-300/25 px-3.5 py-2 text-xs font-semibold text-cyan-200 hover:border-cyan-300/55 hover:text-cyan-100"
        >
          <FileDown className="h-3.5 w-3.5" aria-hidden />
          PDF backup
        </a>
      </header>

      {/* Progress strip */}
      <ProgressStrip current={currentWeek} total={bundle.weeks} />

      {/* Tabs */}
      <nav
        role="tablist"
        aria-label="Program sections"
        className="sticky top-[60px] z-20 -mx-4 mt-6 flex gap-1 overflow-x-auto border-y border-white/[0.06] bg-[#0A0A0B]/85 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6"
      >
        {TAB_DEFS.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-cyan-300/15 text-cyan-50 ring-1 ring-cyan-300/40"
                  : "text-bright/70 hover:bg-white/[0.04] hover:text-cyan-100"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6">
        {tab === "today" && activeDay ? (
          <WorkoutLogger
            bundleSlug={bundle.slug}
            week={currentWeek}
            day={activeDay}
            logs={logs.filter((l) => l.week === currentWeek && l.day === activeDay.day)}
          />
        ) : null}

        {tab === "today" && !activeDay ? (
          <EmptyCard message="No training template for this bundle yet." />
        ) : null}

        {tab === "week" ? (
          <WeekTab
            days={days}
            activeIndex={activeDayIndex}
            onPick={(i) => {
              setActiveDayIndex(i);
              setTab("today");
            }}
          />
        ) : null}

        {tab === "recipes" ? <RecipesTab recipes={bundle.recipes ?? []} locale={locale} /> : null}

        {tab === "grocery" ? (
          <GroceryTab
            bundleSlug={bundle.slug}
            groups={bundle.groceryList ?? []}
            initialChecked={grocery}
          />
        ) : null}

        {tab === "progress" ? (
          <ProgressTab
            bundleSlug={bundle.slug}
            currentWeek={currentWeek}
            totalWeeks={bundle.weeks}
            logs={logs}
            days={days}
          />
        ) : null}
      </div>

      {/* TJAI floating action */}
      <Link
        href={`/${locale}/tjai?seed=${encodeURIComponent(`Help me with my ${card.name} program, week ${currentWeek}.`)}`}
        className="fixed bottom-6 end-4 z-30 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-5 text-sm font-bold text-[#0A0A0B] shadow-[0_0_28px_rgba(34,211,238,0.32)]"
        style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        Ask TJAI
      </Link>
    </section>
  );
}

/* ────────── progress strip ────────── */

function ProgressStrip({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="mt-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#22D3EE,#0EA5E9)]"
          style={{ width: `${pct}%`, transition: "width 600ms cubic-bezier(0.2,1,0.3,1)" }}
        />
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
        {pct}% complete
      </p>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-divider bg-surface/40 p-6 text-center text-sm text-muted">
      {message}
    </div>
  );
}

/* ────────── workout logger ────────── */

function WorkoutLogger({
  bundleSlug,
  week,
  day,
  logs
}: {
  bundleSlug: string;
  week: number;
  day: NonNullable<Bundle["weeklyTemplate"]>[number];
  logs: LogRow[];
}) {
  return (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
        {day.day} · {day.sessionName}
      </p>
      <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{day.focus}</h2>

      <div className="mt-5 space-y-3">
        {day.exercises.map((ex, i) => {
          const setsCount = parseSetCount(ex.sets);
          return (
            <ExerciseCard
              key={`${ex.name}-${i}`}
              bundleSlug={bundleSlug}
              week={week}
              dayKey={day.day}
              name={ex.name}
              setsLabel={ex.sets}
              notes={ex.notes}
              setsCount={setsCount}
              initialLogs={logs.filter((l) => l.exercise === ex.name)}
            />
          );
        })}
      </div>
    </div>
  );
}

function parseSetCount(label: string): number {
  const m = label.match(/^(\d+)\s*[×x]/);
  return m ? Math.min(8, Math.max(1, parseInt(m[1], 10))) : 1;
}

function ExerciseCard({
  bundleSlug,
  week,
  dayKey,
  name,
  setsLabel,
  notes,
  setsCount,
  initialLogs
}: {
  bundleSlug: string;
  week: number;
  dayKey: string;
  name: string;
  setsLabel: string;
  notes?: string;
  setsCount: number;
  initialLogs: LogRow[];
}) {
  const indices = useMemo(() => Array.from({ length: setsCount }, (_, i) => i + 1), [setsCount]);

  return (
    <div className="rounded-2xl border border-divider bg-surface/40 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-white">{name}</p>
        <span className="font-mono text-[11px] font-semibold text-cyan-100">{setsLabel}</span>
      </div>
      {notes ? <p className="mt-1 text-[11px] italic text-faint">{notes}</p> : null}

      <div className="mt-3 space-y-2">
        {indices.map((idx) => {
          const existing = initialLogs.find((l) => l.set_index === idx);
          return (
            <SetRow
              key={idx}
              bundleSlug={bundleSlug}
              week={week}
              dayKey={dayKey}
              exercise={name}
              setIndex={idx}
              initial={existing}
            />
          );
        })}
      </div>
    </div>
  );
}

function SetRow({
  bundleSlug,
  week,
  dayKey,
  exercise,
  setIndex,
  initial
}: {
  bundleSlug: string;
  week: number;
  dayKey: string;
  exercise: string;
  setIndex: number;
  initial?: LogRow;
}) {
  const [reps, setReps] = useState<string>(initial?.reps?.toString() ?? "");
  const [weight, setWeight] = useState<string>(initial?.weight?.toString() ?? "");
  const [done, setDone] = useState<boolean>(initial?.completed ?? false);
  const [, startTransition] = useTransition();

  const save = (next: { reps?: string; weight?: string; done?: boolean }) => {
    const payload = {
      user_id: undefined as unknown as string, // RLS uses auth.uid()
      bundle_slug: bundleSlug,
      week,
      day: dayKey,
      exercise,
      set_index: setIndex,
      reps: (next.reps ?? reps) === "" ? null : Number(next.reps ?? reps),
      weight: (next.weight ?? weight) === "" ? null : Number(next.weight ?? weight),
      completed: next.done ?? done,
      completed_at: (next.done ?? done) ? new Date().toISOString() : null
    };
    startTransition(async () => {
      const supa = getSupabaseBrowserClient();
      if (!supa) return;
      const { data: u } = await supa.auth.getUser();
      if (!u.user) return;
      await supa.from("bundle_workout_logs").upsert(
        { ...payload, user_id: u.user.id },
        { onConflict: "user_id,bundle_slug,week,day,exercise,set_index" }
      );
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="w-6 shrink-0 font-mono text-[11px] font-bold text-cyan-300/80">
        {String(setIndex).padStart(2, "0")}
      </span>
      <input
        type="number"
        inputMode="decimal"
        placeholder="reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        onBlur={() => save({ reps })}
        className="min-h-[40px] w-full flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-faint focus:border-cyan-300/50 focus:outline-none"
      />
      <input
        type="number"
        inputMode="decimal"
        placeholder="lb / kg"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onBlur={() => save({ weight })}
        className="min-h-[40px] w-full flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-faint focus:border-cyan-300/50 focus:outline-none"
      />
      <button
        type="button"
        aria-label={done ? "Mark set incomplete" : "Mark set complete"}
        onClick={() => {
          const next = !done;
          setDone(next);
          save({ done: next });
        }}
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
          done
            ? "border-cyan-300/60 bg-cyan-300/20 text-cyan-50"
            : "border-white/15 text-bright/60 hover:border-cyan-300/40 hover:text-cyan-100"
        }`}
      >
        <Check className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

/* ────────── week tab ────────── */

function WeekTab({
  days,
  activeIndex,
  onPick
}: {
  days: NonNullable<Bundle["weeklyTemplate"]>;
  activeIndex: number;
  onPick: (i: number) => void;
}) {
  return (
    <ul className="space-y-2">
      {days.map((d, i) => {
        const active = i === activeIndex;
        return (
          <li key={`${d.day}-${i}`}>
            <button
              type="button"
              onClick={() => onPick(i)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                active
                  ? "border-cyan-300/45 bg-cyan-300/[0.06]"
                  : "border-divider bg-surface/40 hover:border-cyan-300/30"
              }`}
            >
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
                  {d.day}
                </p>
                <p className="mt-1 text-sm font-semibold text-white">{d.sessionName}</p>
                <p className="mt-0.5 text-xs italic text-faint">{d.focus}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-cyan-300/70 rtl:rotate-180" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/* ────────── recipes tab ────────── */

function RecipesTab({ recipes, locale }: { recipes: BundleRecipe[]; locale: string }) {
  const [bw, setBw] = useState(180);
  const ref = 180;

  if (recipes.length === 0) return <EmptyCard message="No recipes yet." />;

  return (
    <div>
      <div className="rounded-2xl border border-divider bg-surface/40 p-4">
        <label className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
          Scale to bodyweight · {bw} lb
        </label>
        <input
          type="range"
          min={110}
          max={260}
          step={5}
          value={bw}
          onChange={(e) => setBw(Number(e.target.value))}
          className="mt-3 w-full accent-cyan-400"
        />
      </div>

      <div className="mt-4 space-y-3">
        {recipes.map((r, i) => {
          const k = Math.round((r.kcal * bw) / ref);
          const p = Math.round((r.protein * bw) / ref);
          const c = Math.round((r.carbs * bw) / ref);
          const f = Math.round((r.fat * bw) / ref);
          return (
            <div key={`${r.name}-${i}`} className="rounded-2xl border border-divider bg-surface/40 p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
                {r.mealType} · {r.time}
              </p>
              <p className="mt-1 font-display text-base font-bold text-white">{r.name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[10px] font-semibold">
                <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-cyan-100">{k} kcal</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-1 text-white/85">P {p}g</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-1 text-white/85">C {c}g</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-1 text-white/85">F {f}g</span>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-cyan-200/90">
                  Ingredients + method
                </summary>
                <ul className="mt-2 space-y-1 text-sm text-bright/85">
                  {r.ingredients.map((ing, j) => (
                    <li key={j}>· {ing}</li>
                  ))}
                </ul>
                <ol className="mt-3 space-y-1 text-sm text-bright/85">
                  {r.steps.map((s, j) => (
                    <li key={j} className="flex gap-2">
                      <span className="font-mono font-bold text-cyan-300/80">
                        {String(j + 1).padStart(2, "0")}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
                <Link
                  href={`/${locale}/tjai?seed=${encodeURIComponent(`Swap "${r.name}" for something similar on the same macros.`)}`}
                  className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-cyan-300/25 px-3 text-xs font-semibold text-cyan-200 hover:border-cyan-300/55"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Swap via TJAI
                </Link>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────── grocery tab ────────── */

function GroceryTab({
  bundleSlug,
  groups,
  initialChecked
}: {
  bundleSlug: string;
  groups: NonNullable<Bundle["groceryList"]>;
  initialChecked: string[];
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set(initialChecked));

  const persist = async (key: string, nextChecked: boolean) => {
    const supa = getSupabaseBrowserClient();
    if (!supa) return;
    const { data: u } = await supa.auth.getUser();
    if (!u.user) return;
    if (nextChecked) {
      await supa
        .from("grocery_checks")
        .upsert(
          { user_id: u.user.id, bundle_slug: bundleSlug, item_key: key, checked: true },
          { onConflict: "user_id,bundle_slug,item_key" }
        );
    } else {
      await supa
        .from("grocery_checks")
        .delete()
        .eq("user_id", u.user.id)
        .eq("bundle_slug", bundleSlug)
        .eq("item_key", key);
    }
  };

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      const willCheck = !next.has(key);
      if (willCheck) next.add(key);
      else next.delete(key);
      void persist(key, willCheck);
      return next;
    });
  };

  const share = async () => {
    const text = groups
      .map(
        (g) =>
          `${g.category}\n` +
          g.items.map((i) => `- ${i.item} (${i.quantity})`).join("\n")
      )
      .join("\n\n");
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: "Grocery list", text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* user cancelled */
    }
  };

  if (groups.length === 0) return <EmptyCard message="No grocery list yet." />;

  return (
    <div>
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/[0.08] px-3.5 text-xs font-semibold text-cyan-100 hover:border-cyan-300/60"
      >
        <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
        Send to phone
      </button>
      <div className="mt-4 space-y-3">
        {groups.map((g) => (
          <div key={g.category} className="rounded-2xl border border-divider bg-surface/40 p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
              {g.category}
            </p>
            <ul className="mt-3 space-y-1.5">
              {g.items.map((it) => {
                const key = `${g.category}|${it.item}`;
                const isChecked = checked.has(key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => toggle(key)}
                      className="flex w-full items-start gap-2.5 rounded-lg px-1 py-1.5 text-left hover:bg-white/[0.03]"
                    >
                      <span
                        className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          isChecked ? "border-cyan-300 bg-cyan-300/20" : "border-white/20"
                        }`}
                        aria-hidden
                      >
                        {isChecked ? <Check className="h-3 w-3 text-cyan-200" /> : null}
                      </span>
                      <span
                        className={`flex-1 text-sm leading-snug ${
                          isChecked ? "text-faint line-through" : "text-bright/90"
                        }`}
                      >
                        {it.item}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] font-semibold text-cyan-100/80">
                        {it.quantity}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────── progress tab ────────── */

function ProgressTab({
  bundleSlug,
  currentWeek,
  totalWeeks,
  logs,
  days
}: {
  bundleSlug: string;
  currentWeek: number;
  totalWeeks: number;
  logs: LogRow[];
  days: NonNullable<Bundle["weeklyTemplate"]>;
}) {
  // Weekly completion: sets done this week / sets planned this week
  const plannedThisWeek = days.reduce(
    (sum, d) => sum + d.exercises.reduce((s, e) => s + parseSetCount(e.sets), 0),
    0
  );
  const doneThisWeek = logs.filter((l) => l.week === currentWeek && l.completed).length;
  const wkPct = plannedThisWeek > 0 ? Math.round((doneThisWeek / plannedThisWeek) * 100) : 0;

  // Volume by week (simple bars)
  const byWeek: Record<number, number> = {};
  for (const l of logs) {
    if (!l.completed) continue;
    const v = (l.reps ?? 0) * (l.weight ?? 0);
    byWeek[l.week] = (byWeek[l.week] ?? 0) + v;
  }
  const maxVol = Math.max(1, ...Object.values(byWeek));
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(34,211,238,0.05),rgba(34,211,238,0.01))] p-5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
          This week
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-white">{wkPct}%</p>
        <p className="mt-1 text-xs text-faint">
          {doneThisWeek} of {plannedThisWeek} sets completed · week {currentWeek}/{totalWeeks}
        </p>
      </div>

      <div className="rounded-2xl border border-divider bg-surface/40 p-5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
          Volume per week (reps × load)
        </p>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {weeks.map((w) => {
            const v = byWeek[w] ?? 0;
            const h = Math.max(2, Math.round((v / maxVol) * 100));
            const isCurrent = w === currentWeek;
            return (
              <div
                key={w}
                className="flex-1 rounded-t"
                title={`Week ${w}: ${Math.round(v)}`}
                style={{
                  height: `${h}%`,
                  background: isCurrent
                    ? "linear-gradient(180deg,#22D3EE,#0EA5E9)"
                    : v > 0
                    ? "rgba(34,211,238,0.45)"
                    : "rgba(255,255,255,0.06)"
                }}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
          <span>W1</span>
          <span>W{totalWeeks}</span>
        </div>
      </div>

      <BodyWeightLogger bundleSlug={bundleSlug} />
    </div>
  );
}

function BodyWeightLogger({ bundleSlug }: { bundleSlug: string }) {
  const [bw, setBw] = useState<string>("");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!bw) return;
    // Piggy-back on workout_logs with a sentinel exercise key for now;
    // a dedicated body_metrics table is a follow-up. Keeps the migration tight.
    const supa = getSupabaseBrowserClient();
    if (!supa) return;
    const { data: u } = await supa.auth.getUser();
    if (!u.user) return;
    await supa.from("bundle_workout_logs").upsert(
      {
        user_id: u.user.id,
        bundle_slug: bundleSlug,
        week: 0,
        day: "__bw__",
        exercise: "__bw__",
        set_index: Math.floor(Date.now() / 1000),
        reps: null,
        weight: Number(bw),
        completed: true,
        completed_at: new Date().toISOString()
      },
      { onConflict: "user_id,bundle_slug,week,day,exercise,set_index" }
    );
    setSaved(true);
    setBw("");
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="rounded-2xl border border-divider bg-surface/40 p-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/80">
        Log bodyweight
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={bw}
          onChange={(e) => setBw(e.target.value)}
          placeholder="lb / kg"
          className="min-h-[44px] flex-1 rounded-lg border border-white/[0.08] bg-black/30 px-3 text-sm text-white placeholder:text-faint focus:border-cyan-300/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#22D3EE_0%,#0EA5E9_100%)] px-5 text-sm font-bold text-[#0A0A0B]"
        >
          {saved ? "Saved" : "Log"}
        </button>
      </div>
    </div>
  );
}
