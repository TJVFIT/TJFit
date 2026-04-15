"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  type TooltipProps
} from "recharts";
import { CheckCircle2, Scale, Dumbbell, Flag } from "lucide-react";
import confetti from "canvas-confetti";
import type { Locale } from "@/lib/i18n";
import { getProgressCopy } from "@/lib/feature-copy";

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

// MI4 — relative time formatter
function relativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "Last week";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return dateStr.slice(5);
  } catch {
    return dateStr;
  }
}

function Toast({ messages }: { messages: ToastMsg[] }) {
  if (messages.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-[#0D1F17] px-4 py-3 text-sm font-medium text-green-400 shadow-lg"
          style={{ animation: "chat-bubble-in 280ms cubic-bezier(0.34,1.56,0.64,1) forwards" }}
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
function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(13,14,18,0.95)",
        border: "1px solid rgba(34,211,238,0.3)",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 0 20px rgba(34,211,238,0.12), 0 8px 32px rgba(0,0,0,0.5)",
        fontSize: 12
      }}
    >
      <p style={{ color: "#52525B", marginBottom: 6, fontSize: 11 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name === "weight" ? "Weight" : "Body Fat"}: <strong>{p.value}{p.name === "weight" ? " kg" : "%"}</strong>
        </p>
      ))}
    </div>
  );
}

export function ProgressView({ locale }: { locale: Locale }) {
  const t = getProgressCopy(locale);
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

  const showToast = (text: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((m) => m.id !== id)), 2800);
  };

  const load = async () => {
    const [entriesRes, workoutsRes, milestonesRes] = await Promise.all([
      fetch("/api/progress/entries", { credentials: "include" }),
      fetch("/api/progress/workouts", { credentials: "include" }),
      fetch("/api/progress/milestones", { credentials: "include" })
    ]);
    const [e, w, m] = await Promise.all([entriesRes.json(), workoutsRes.json(), milestonesRes.json()]);
    setEntries(e.entries ?? []);
    setWorkouts(w.workouts ?? []);
    setMilestones(m.milestones ?? []);
  };

  useEffect(() => { load(); }, []);

  const addMetrics = async () => {
    await fetch("/api/progress/entries", {
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
    setWeight(""); setBodyFat(""); setWaist(""); setChest(""); setHips("");
    showToast("Metrics saved ✓");
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
    const data = await res.json();
    if (data.workout?.id) newEntryIds.current.add(data.workout.id);
    setExercise(""); setSets(""); setReps(""); setWorkoutWeight(""); setDuration("");
    showToast("Workout logged ✓");
    await load();
    // Clear new entry IDs after animation
    setTimeout(() => newEntryIds.current.clear(), 600);
  };

  const addMilestone = async () => {
    if (!milestoneTitle.trim()) return;
    await fetch("/api/progress/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: milestoneTitle.trim(),
        target_value: milestoneTarget.trim() || null
      })
    });
    setMilestoneTitle(""); setMilestoneTarget("");
    showToast("Milestone added ✓");
    await load();
  };

  const completeMilestone = async (id: string) => {
    await fetch("/api/progress/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status: "completed" })
    });
    // ME5 — confetti burst
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#22D3EE", "#A78BFA", "#F59E0B", "#22C55E"]
    });
    showToast("Milestone completed 🎉");
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
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <Toast messages={toasts} />

      <div>
        <span className="badge">{t.title}</span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{t.subtitle}</p>
      </div>

      {/* ME1 — Recharts gradient area charts with animated draw-on */}
      {showCharts && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-panel rounded-[28px] p-6">
            <p className="mb-4 text-sm font-semibold text-white">Weight trend (kg)</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#52525B", fontSize: 11 }} />
                <YAxis tick={{ fill: "#52525B", fontSize: 11 }} domain={["auto", "auto"]} tickFormatter={(v) => `${v}kg`} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#22D3EE"
                  strokeWidth={2}
                  fill="url(#weightGrad)"
                  dot={{ r: 3, fill: "#22D3EE" }}
                  connectNulls
                  isAnimationActive
                  animationDuration={1200}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-panel rounded-[28px] p-6">
            <p className="mb-4 text-sm font-semibold text-white">Body fat trend (%)</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#52525B", fontSize: 11 }} />
                <YAxis tick={{ fill: "#52525B", fontSize: 11 }} domain={["auto", "auto"]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="fat"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  fill="url(#fatGrad)"
                  dot={{ r: 3, fill: "#A78BFA" }}
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
            <Scale className="h-4 w-4 text-[#22D3EE]" />
            <p className="text-lg font-semibold text-white">{t.metrics}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder={t.weightPlaceholder} value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" min="0" />
              <input className="input" placeholder={t.bodyFatPlaceholder} value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} type="number" step="0.1" min="0" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-600">Measurements (cm)</p>
            <div className="grid grid-cols-3 gap-2">
              <input className="input text-center text-sm" placeholder="Waist" value={waist} onChange={(e) => setWaist(e.target.value)} type="number" step="0.1" min="0" />
              <input className="input text-center text-sm" placeholder="Chest" value={chest} onChange={(e) => setChest(e.target.value)} type="number" step="0.1" min="0" />
              <input className="input text-center text-sm" placeholder="Hips" value={hips} onChange={(e) => setHips(e.target.value)} type="number" step="0.1" min="0" />
            </div>
            <button onClick={addMetrics} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
              {t.save}
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {entries.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.noData}</p>
            ) : (
              entries.slice(0, 6).map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/10 p-3 text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-400">{relativeDate(entry.entry_date)}</span>
                    <span className="text-[#22D3EE]">{entry.weight_kg ?? "–"} kg · {entry.body_fat_percent ?? "–"}%</span>
                  </div>
                  {(entry.waist_cm || entry.chest_cm || entry.hips_cm) && (
                    <div className="mt-1 flex gap-3 text-zinc-500">
                      {entry.waist_cm ? <span>W:{entry.waist_cm}</span> : null}
                      {entry.chest_cm ? <span>C:{entry.chest_cm}</span> : null}
                      {entry.hips_cm ? <span>H:{entry.hips_cm}</span> : null}
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
            <Dumbbell className="h-4 w-4 text-[#22D3EE]" />
            <p className="text-lg font-semibold text-white">{t.workouts}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <input className="input" placeholder={t.exercisePlaceholder} value={exercise} onChange={(e) => setExercise(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input text-sm" placeholder="Sets" value={sets} onChange={(e) => setSets(e.target.value)} type="number" min="1" />
              <input className="input text-sm" placeholder="Reps" value={reps} onChange={(e) => setReps(e.target.value)} type="number" min="1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="input text-sm" placeholder="Weight (kg)" value={workoutWeight} onChange={(e) => setWorkoutWeight(e.target.value)} type="number" step="0.5" min="0" />
              <input className="input text-sm" placeholder="Duration (min)" value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min="1" />
            </div>
            <button onClick={addWorkout} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
              {t.add}
            </button>
          </div>
          <div className="mt-5 space-y-4 overflow-y-auto" style={{ maxHeight: 340 }}>
            {workouts.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.noData}</p>
            ) : (
              groupedWorkouts.map(([date, ws]) => (
                <div key={date}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-600">{relativeDate(date)}</p>
                  <div className="space-y-1.5">
                    {ws.map((w) => (
                      <div
                        key={w.id}
                        className="rounded-xl border border-white/10 p-3 text-xs text-zinc-300"
                        style={newEntryIds.current.has(w.id) ? { animation: "workout-slide-in 400ms ease-out forwards" } : undefined}
                      >
                        <span className="font-medium text-white">{w.exercise}</span>
                        <div className="mt-0.5 flex flex-wrap gap-2 text-zinc-500">
                          {w.sets ? <span>{w.sets} sets</span> : null}
                          {w.reps ? <span>{w.reps} reps</span> : null}
                          {w.weight_kg ? <span>{w.weight_kg} kg</span> : null}
                          {w.duration_minutes ? <span>{w.duration_minutes} min</span> : null}
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
            <Flag className="h-4 w-4 text-[#22D3EE]" />
            <p className="text-lg font-semibold text-white">{t.milestones}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <input className="input" placeholder={t.milestonePlaceholder} value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} />
            <input className="input text-sm" placeholder='Target (e.g. "Bench 100kg")' value={milestoneTarget} onChange={(e) => setMilestoneTarget(e.target.value)} />
            <button onClick={addMilestone} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
              {t.add}
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {milestones.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.noData}</p>
            ) : (
              milestones.map((m) => (
                <div key={m.id} className="rounded-xl border border-white/10 p-3 text-sm text-zinc-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{m.title}</p>
                      {m.target_value && (
                        <p className="mt-0.5 text-xs text-[#22D3EE]">🎯 {m.target_value}</p>
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
    </div>
  );
}
