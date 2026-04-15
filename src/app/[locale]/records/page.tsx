"use client";

import { useEffect, useState } from "react";
import { Trophy, Dumbbell, Timer, Repeat } from "lucide-react";
import { requireLocaleParam } from "@/lib/require-locale";

type Workout = {
  id: string;
  workout_date: string;
  exercise: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  duration_minutes: number | null;
};

type PR = {
  exercise: string;
  heaviestWeight: number | null;
  heaviestWeightDate: string | null;
  maxReps: number | null;
  maxRepsDate: string | null;
  longestDuration: number | null;
  longestDurationDate: string | null;
  totalSets: number;
  totalLogs: number;
};

function computePRs(workouts: Workout[]): PR[] {
  const map = new Map<string, PR>();

  for (const w of workouts) {
    const key = w.exercise.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        exercise: w.exercise.trim(),
        heaviestWeight: null,
        heaviestWeightDate: null,
        maxReps: null,
        maxRepsDate: null,
        longestDuration: null,
        longestDurationDate: null,
        totalSets: 0,
        totalLogs: 0
      });
    }
    const pr = map.get(key)!;
    pr.totalLogs += 1;
    pr.totalSets += w.sets ?? 0;

    if (w.weight_kg !== null && (pr.heaviestWeight === null || w.weight_kg > pr.heaviestWeight)) {
      pr.heaviestWeight = w.weight_kg;
      pr.heaviestWeightDate = w.workout_date;
    }
    if (w.reps !== null && (pr.maxReps === null || w.reps > pr.maxReps)) {
      pr.maxReps = w.reps;
      pr.maxRepsDate = w.workout_date;
    }
    if (w.duration_minutes !== null && (pr.longestDuration === null || w.duration_minutes > pr.longestDuration)) {
      pr.longestDuration = w.duration_minutes;
      pr.longestDurationDate = w.workout_date;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalLogs - a.totalLogs);
}

export default function RecordsPage({ params }: { params: { locale: string } }) {
  requireLocaleParam(params.locale);
  const locale = params.locale;

  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/progress/workouts", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setPrs(computePRs(data.workouts ?? []));
      } catch {
        setError("Could not load your workout history.");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
      <div>
        <span className="badge">Personal Records</span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">Personal Records</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
          Your all-time bests auto-computed from your workout logs. Heaviest lift, max reps, and longest session per exercise.
        </p>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#111215]" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">{error}</div>
      )}

      {!loading && !error && prs.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-[#1E2028] bg-[#111215] py-20 text-center">
          <Trophy className="mx-auto h-12 w-12 text-zinc-600" />
          <p className="mt-4 text-lg font-semibold text-white">No records yet</p>
          <p className="mt-2 max-w-xs text-sm text-zinc-400">
            Start logging workouts on your progress page to see your personal records appear here automatically.
          </p>
          <a
            href={`/${locale}/progress`}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-[#22D3EE]/30 bg-[#22D3EE]/10 px-6 py-2.5 text-sm font-semibold text-[#22D3EE]"
          >
            Go to progress log →
          </a>
        </div>
      )}

      {!loading && !error && prs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {prs.map((pr) => (
            <div
              key={pr.exercise}
              className="rounded-2xl border border-[#1E2028] bg-[#111215] p-5 transition-[border-color] duration-200 hover:border-[rgba(34,211,238,0.2)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Dumbbell className="h-4 w-4 shrink-0 text-[#22D3EE]" strokeWidth={2} />
                  <p className="font-semibold text-white">{pr.exercise}</p>
                </div>
                <span className="text-xs text-zinc-600">{pr.totalLogs} log{pr.totalLogs !== 1 ? "s" : ""}</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {pr.heaviestWeight !== null && (
                  <div className="rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-3 text-center">
                    <Trophy className="mx-auto mb-1 h-3.5 w-3.5 text-[#F59E0B]" />
                    <p className="text-sm font-bold text-[#F59E0B]">{pr.heaviestWeight} kg</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">Best weight</p>
                    {pr.heaviestWeightDate && (
                      <p className="text-[9px] text-zinc-600">{pr.heaviestWeightDate.slice(5)}</p>
                    )}
                  </div>
                )}

                {pr.maxReps !== null && (
                  <div className="rounded-xl border border-[#22D3EE]/20 bg-[#22D3EE]/5 p-3 text-center">
                    <Repeat className="mx-auto mb-1 h-3.5 w-3.5 text-[#22D3EE]" />
                    <p className="text-sm font-bold text-[#22D3EE]">{pr.maxReps} reps</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">Max reps</p>
                    {pr.maxRepsDate && (
                      <p className="text-[9px] text-zinc-600">{pr.maxRepsDate.slice(5)}</p>
                    )}
                  </div>
                )}

                {pr.longestDuration !== null && (
                  <div className="rounded-xl border border-[#A78BFA]/20 bg-[#A78BFA]/5 p-3 text-center">
                    <Timer className="mx-auto mb-1 h-3.5 w-3.5 text-[#A78BFA]" />
                    <p className="text-sm font-bold text-[#A78BFA]">{pr.longestDuration} min</p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">Longest</p>
                    {pr.longestDurationDate && (
                      <p className="text-[9px] text-zinc-600">{pr.longestDurationDate.slice(5)}</p>
                    )}
                  </div>
                )}

                {pr.heaviestWeight === null && pr.maxReps === null && pr.longestDuration === null && (
                  <div className="col-span-3 text-xs text-zinc-600">Log sets, reps, or weight to see records</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
