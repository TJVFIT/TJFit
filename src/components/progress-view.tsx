"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getProgressCopy } from "@/lib/feature-copy";

type ProgressEntry = {
  id: string;
  entry_date: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  notes: string | null;
};

type Workout = {
  id: string;
  workout_date: string;
  exercise: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
};

type Milestone = {
  id: string;
  title: string;
  status: "active" | "completed" | "paused";
  target_value: string | null;
};

export function ProgressView({ locale }: { locale: Locale }) {
  const t = getProgressCopy(locale);
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [exercise, setExercise] = useState("");
  const [milestoneTitle, setMilestoneTitle] = useState("");

  const load = async () => {
    const [entriesRes, workoutsRes, milestonesRes] = await Promise.all([
      fetch("/api/progress/entries", { credentials: "include" }),
      fetch("/api/progress/workouts", { credentials: "include" }),
      fetch("/api/progress/milestones", { credentials: "include" })
    ]);
    const entriesData = await entriesRes.json();
    const workoutsData = await workoutsRes.json();
    const milestonesData = await milestonesRes.json();
    setEntries(entriesData.entries ?? []);
    setWorkouts(workoutsData.workouts ?? []);
    setMilestones(milestonesData.milestones ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const addMetrics = async () => {
    await fetch("/api/progress/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        weight_kg: weight ? Number(weight) : null,
        body_fat_percent: bodyFat ? Number(bodyFat) : null
      })
    });
    setWeight("");
    setBodyFat("");
    await load();
  };

  const addWorkout = async () => {
    if (!exercise.trim()) return;
    await fetch("/api/progress/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ exercise: exercise.trim() })
    });
    setExercise("");
    await load();
  };

  const addMilestone = async () => {
    if (!milestoneTitle.trim()) return;
    await fetch("/api/progress/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: milestoneTitle.trim() })
    });
    setMilestoneTitle("");
    await load();
  };

  const completeMilestone = async (id: string) => {
    await fetch("/api/progress/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, status: "completed" })
    });
    await load();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <span className="badge">{t.title}</span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{t.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="glass-panel rounded-[28px] p-6">
          <p className="text-lg font-semibold text-white">{t.metrics}</p>
          <div className="mt-4 grid gap-3">
            <input className="input" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <input className="input" placeholder="Body fat (%)" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
            <button onClick={addMetrics} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
              {t.save}
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {entries.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.noData}</p>
            ) : (
              entries.slice(0, 8).map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/10 p-3 text-sm text-zinc-300">
                  {entry.entry_date} - {entry.weight_kg ?? "-"} kg / {entry.body_fat_percent ?? "-"}%
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-panel rounded-[28px] p-6">
          <p className="text-lg font-semibold text-white">{t.workouts}</p>
          <div className="mt-4 grid gap-3">
            <input className="input" placeholder="Exercise" value={exercise} onChange={(e) => setExercise(e.target.value)} />
            <button onClick={addWorkout} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
              {t.add}
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {workouts.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.noData}</p>
            ) : (
              workouts.slice(0, 8).map((w) => (
                <div key={w.id} className="rounded-xl border border-white/10 p-3 text-sm text-zinc-300">
                  {w.workout_date} - {w.exercise}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-panel rounded-[28px] p-6">
          <p className="text-lg font-semibold text-white">{t.milestones}</p>
          <div className="mt-4 grid gap-3">
            <input className="input" placeholder="Milestone" value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} />
            <button onClick={addMilestone} className="gradient-button rounded-full px-5 py-2 text-sm font-medium text-white">
              {t.add}
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {milestones.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.noData}</p>
            ) : (
              milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm text-zinc-300">
                  <span>{m.title}</span>
                  {m.status !== "completed" ? (
                    <button className="text-accent hover:underline" onClick={() => completeMilestone(m.id)}>
                      {t.complete}
                    </button>
                  ) : (
                    <span className="text-green-400">Done</span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

