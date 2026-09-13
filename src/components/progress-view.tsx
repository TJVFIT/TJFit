"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";
import { CheckCircle2, Scale, Dumbbell, Flag } from "lucide-react";
import confetti from "canvas-confetti";
import { AmbientOrbs } from "@/components/effects/ambient-orbs";
import type { Locale } from "@/lib/i18n";
import { getProgressCopy } from "@/lib/feature-copy";
import { PROGRESS_VIEW_COPY, localizedLogDate } from "@/lib/tjai/result-view-copy";
import {TjaiLoggingPanel} from "@/components/tjai/tjai-logging-panel";
import {getTjaiFlowCopy} from "@/lib/tjai/flow-copy";

type ProgressEntry = {
  id: string;
  entry_date: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  hips_cm: number | null;
  notes: string | null;
};

type Workout = {
  id: string;
  workout_date: string;
  exercise: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  duration_minutes: number | null;
};

type Milestone = {
  id: string;
  title: string;
  target_value: string | null;
  status: "active" | "completed" | "paused";
};

type ToastMsg = { id: number; text: string };

function Toast({ messages }: { messages: ToastMsg[] }) {
  if (messages.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 end-6 z-50 flex flex-col gap-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-[#0D1F17] px-4 py-3 text-sm font-medium text-green-400 shadow-lg"
          style={{ animation: "chat-bubble-in 280ms cubic-bezier(0.16,1,0.3,1) forwards" }}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {m.text}
        </div>
      ))}
    </div>
  );
}

function groupByDate(workouts: Workout[]): [string, Workout[]][] {
  const map = new Map<string, Workout[]>();
  for (const w of workouts) {
    const key = w.workout_date;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(w);
  }
  return Array.from(map.entries());
}

// ME19 — Custom Recharts tooltip showing both metrics
function ChartTooltip(props: Record<string, unknown> & { locale: Locale }) {
  const { active, payload, label } = props as {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  };
  if (!active || !payload?.length) return null;
  const ui = PROGRESS_VIEW_COPY[props.locale];
  return (
    <div
      style={{
        background: "rgba(13,14,18,0.95)",
        border: "1px solid rgba(168,85,247,0.3)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 0 20px rgba(168,85,247,0.12), 0 8px 32px rgba(0,0,0,0.5)",
        fontSize: 12
      }}
    >
      <p style={{ color: "#52525B", marginBottom: 6, fontSize: 11 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name === "weight" ? ui.weight : ui.fat}: <strong>{p.value}{p.name === "weight" ? " kg" : "%"}</strong>
        </p>
      ))}
    </div>
  );
}

export function ProgressView({ locale }: { locale: Locale }) {
  const t = getProgressCopy(locale);
  const ui = PROGRESS_VIEW_COPY[locale];
  const toastId = useRef(0);
  const newEntryIds = useRef(new Set<string>());

  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // body metrics form
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [hips, setHips] = useState("");

  // workout form
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [workoutWeight, setWorkoutWeight] = useState("");
  const [duration, setDuration] = useState("");

  // milestone form
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneTarget, setMilestoneTarget] = useState("");

  const showToast = useCallback((text: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((m) => m.id !== id)), 2800);
  }, []);

  const load = useCallback(async () => {
    try {
    const [entriesRes, workoutsRes, milestonesRes] = await Promise.all([
      fetch("/api/progress/entries", { credentials: "include" }),
      fetch("/api/progress/workouts", { credentials: "include" }),
      fetch("/api/progress/milestones", { credentials: "include" })
    ]);
    if(!entriesRes.ok||!workoutsRes.ok||!milestonesRes.ok){showToast(getTjaiFlowCopy(locale).error);return;}
    const [e, w, m] = await Promise.all([entriesRes.json(), workoutsRes.json(), milestonesRes.json()]);
    setEntries(e.entries ?? []);
    setWorkouts(w.workouts ?? []);
    setMilestones(m.milestones ?? []);
    } catch { showToast(getTjaiFlowCopy(locale).error); }
  }, [locale, showToast]);

  useEffect(() => { void load(); }, [load]);

  const addMetrics = async () => {
    const response=await fetch("/api/progress/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        weight_kg: weight ? Number(weight) : null,
        body_fat_percent: bodyFat ? Number(bodyFat) : null,
        waist_cm: waist ? Number(waist) : null,
        chest_cm: chest ? Number(chest) : null,
        hips_cm: hips ? Number(hips) : null
      })
    });
    if(!response.ok){showToast(getTjaiFlowCopy(locale).error);return;}
    setWeight(""); setBodyFat(""); setWaist(""); setChest(""); setHips("");
    showToast(ui.metricsSaved);
    await load();
  };

  const addWorkout = async () => {
    if (!exercise.trim()) return;
    const res = await fetch("/api/progress/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        exercise: exercise.trim(),
        sets: sets ? Number(sets) : null,
        reps: reps ? Number(reps) : null,
        weight_kg: workoutWeight ? Number(workoutWeight) : null,
        duration_minutes: duration ? Number(duration) : null
      })
    });
    if(!res.ok){showToast(getTjaiFlowCopy(locale).error);return;}
    const data = await res.json();
    if (data.workout?.id) newEntryIds.current.add(data.workout.id);
    if (Array.isArray(data.newBadges) && data.newBadges.length > 0) {
      const { celebrateBadges } = await import("@/components/tjai/badge-unlock-toast");
      celebrateBadges(data.newBadges);
    }
    setExercise(""); setSets(""); setReps(""); setWorkoutWeight(""); setDuration("");
    showToast(ui.workoutSaved);
    await load();
    // Clear new entry IDs after animation
    setTimeout(() => newEntryIds.current.clear(), 600);
  };

  const addMilestone = async () => {
    if (!milestoneTitle.trim()) return;
    const response=await fetch("/api/progress/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: milestoneTitle.trim(),
        target_value: milestoneTarget.trim() || null
      })
    });
    if(!response.ok){showToast(getTjaiFlowCopy(locale).error);return;}
    setMilestoneTitle(""); setMilestoneTarget("");
    showToast(ui.milestoneAdded);
    await load();
  };

  const completeMilestone = async (id: string) => {
    const response=await fetch("/api/progress/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status: "completed" })
    });
    if(!response.ok){showToast(getTjaiFlowCopy(locale).error);return;}
    // ME5 — confetti burst
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#A855F7", "#7C3AED", "#A855F7", "#22C55E"]
    });
    showToast(ui.milestoneDone);
    await load();
  };

  // Chart data — chronological order, last 20 points
  const chartData = [...entries]
    .reverse()
    .slice(-20)
    .map((e) => ({
      date: e.entry_date.slice(5),
      weight: e.weight_kg,
      fat: e.body_fat_percent
    }));

  const groupedWorkouts = groupByDate(workouts);
  const showCharts = chartData.length >= 2;

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className="relative mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <AmbientOrbs />
      <Toast messages={toasts} />

      <div className="relative">
        <span className="badge">{t.title}</span>
        <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
          <span className="tj-title-shimmer">{t.title}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{t.subtitle}</p>
      </div>

      <TjaiLoggingPanel locale={locale}/>
      <details className="space-y-6 rounded-2xl border border-divider p-5"><summary className="cursor-pointer font-semibold">{t.metrics} · {t.milestones}</summary>
      {/* Existing measurement charts and milestones remain available. */}
      {showCharts && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-panel rounded-[28px] p-6">
            <p className="mb-4 text-sm font-semibold text-white">{ui.weightTrend} (kg)</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#52525B", fontSize: 11 }} />
                <YAxis tick={{ fill: "#52525B", fontSize: 11 }} domain={["auto", "auto"]} tickFormatter={(v) => `${v}kg`} />
                <Tooltip content={<ChartTooltip locale={locale} />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#A855F7"
                  strokeWidth={2}
                  fill="url(#weightGrad)"
                  dot={{ r: 3, fill: "#A855F7" }}
                  connectNulls
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-panel rounded-[28px] p-6">
            <p className="mb-4 text-sm font-semibold text-white">{ui.fatTrend} (%)</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#52525B", fontSize: 11 }} />
                <YAxis tick={{ fill: "#52525B", fontSize: 11 }} domain={["auto", "auto"]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<ChartTooltip locale={locale} />} />
                <Area
                  type="monotone"
                  dataKey="fat"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  fill="url(#fatGrad)"
                  dot={{ r: 3, fill: "#7C3AED" }}
                  connectNulls
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Body metrics — MI13 section icon */}
        <section className="glass-panel rounded-[28px] p-6">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-accent" />
            <p className="text-lg font-semibold text-white">{t.metrics}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder={t.weightPlaceholder} value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" min="0" />
              <input className="input" placeholder={t.bodyFatPlaceholder} value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} type="number" step="0.1" min="0" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-dim">{t.measurementsLabel}</p>
            <div className="grid grid-cols-3 gap-2">
              <input className="input text-center text-sm" placeholder={t.waistPlaceholder} value={waist} onChange={(e) => setWaist(e.target.value)} type="number" step="0.1" min="0" />
              <input className="input text-center text-sm" placeholder={t.chestPlaceholder} value={chest} onChange={(e) => setChest(e.target.value)} type="number" step="0.1" min="0" />
              <input className="input text-center text-sm" placeholder={t.hipsPlaceholder} value={hips} onChange={(e) => setHips(e.target.value)} type="number" step="0.1" min="0" />
            </div>
            <button onClick={addMetrics} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
              {t.save}
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {entries.length === 0 ? (
              <p className="text-sm text-faint">{t.noData}</p>
            ) : (
              entries.slice(0, 6).map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/10 p-3 text-xs text-bright">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted">{localizedLogDate(entry.entry_date, locale)}</span>
                    <span className="text-accent">{entry.weight_kg ?? "–"} kg · {entry.body_fat_percent ?? "–"}%</span>
                  </div>
                  {(entry.waist_cm || entry.chest_cm || entry.hips_cm) && (
                    <div className="mt-1 flex gap-3 text-faint">
                      {entry.waist_cm ? <span>{ui.waist}: {entry.waist_cm} cm</span> : null}
                      {entry.chest_cm ? <span>{ui.chest}: {entry.chest_cm} cm</span> : null}
                      {entry.hips_cm ? <span>{ui.hips}: {entry.hips_cm} cm</span> : null}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Workouts — MI13 section icon + F4 grouped + ME10 slide-in */}
        <section className="glass-panel rounded-[28px] p-6">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-accent" />
            <p className="text-lg font-semibold text-white">{t.workouts}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <input className="input" placeholder={t.exercisePlaceholder} value={exercise} onChange={(e) => setExercise(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input text-sm" placeholder={t.setsPlaceholder} value={sets} onChange={(e) => setSets(e.target.value)} type="number" min="1" />
              <input className="input text-sm" placeholder={t.repsPlaceholder} value={reps} onChange={(e) => setReps(e.target.value)} type="number" min="1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="input text-sm" placeholder={t.workoutWeightPlaceholder} value={workoutWeight} onChange={(e) => setWorkoutWeight(e.target.value)} type="number" step="0.5" min="0" />
              <input className="input text-sm" placeholder={t.durationPlaceholder} value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min="1" />
            </div>
            <button onClick={addWorkout} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
              {t.add}
            </button>
          </div>
          <div className="mt-5 space-y-4 overflow-y-auto" style={{ maxHeight: 340 }}>
            {workouts.length === 0 ? (
              <p className="text-sm text-faint">{t.noData}</p>
            ) : (
              groupedWorkouts.map(([date, ws]) => (
                <div key={date}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-dim">{localizedLogDate(date, locale)}</p>
                  <div className="space-y-1.5">
                    {ws.map((w) => (
                      <div
                        key={w.id}
                        className="rounded-xl border border-white/10 p-3 text-xs text-bright"
                        style={newEntryIds.current.has(w.id) ? { animation: "workout-slide-in 400ms ease-out forwards" } : undefined}
                      >
                        <span className="font-medium text-white">{w.exercise}</span>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-faint">
                          {w.sets ? <span>{w.sets} {ui.sets}</span> : null}
                          {w.reps ? <span>{w.reps} {ui.reps}</span> : null}
                          {w.weight_kg !== null ? <span>{w.weight_kg} kg</span> : null}
                          {w.duration_minutes ? <span>{w.duration_minutes} {ui.minutes}</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Milestones — MI13 section icon + U6 target value */}
        <section className="glass-panel rounded-[28px] p-6">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-accent" />
            <p className="text-lg font-semibold text-white">{t.milestones}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <input className="input" placeholder={t.milestonePlaceholder} value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} />
            <input className="input text-sm" placeholder={t.milestoneTargetPlaceholder} value={milestoneTarget} onChange={(e) => setMilestoneTarget(e.target.value)} />
            <button onClick={addMilestone} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
              {t.add}
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {milestones.length === 0 ? (
              <p className="text-sm text-faint">{t.noData}</p>
            ) : (
              milestones.map((m) => (
                <div key={m.id} className="rounded-xl border border-white/10 p-3 text-sm text-bright">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{m.title}</p>
                      {m.target_value && (
                        <p className="mt-0.5 text-xs text-accent">{m.target_value}</p>
                      )}
                    </div>
                    {m.status !== "completed" ? (
                      <button className="shrink-0 text-xs text-accent hover:underline" onClick={() => completeMilestone(m.id)}>
                        {t.complete}
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs text-green-400">{t.done}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      </details>
    </div>
  );
}
