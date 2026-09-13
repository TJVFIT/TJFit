type LoggedSet = { weight_kg: number | string | null; reps: number | null };
export type StrengthLog = LoggedSet & {
  exercise: string;
  workout_date: string;
  sets_data: LoggedSet[] | null;
};
export type StrengthSession = { date: string; load: number; reps: number | null };
export type StrengthTrend = { exercise: string; first: StrengthSession; latest: StrengthSession; change: number | null; sessions: number };

/** Compare observed external loads, not predicted strength or fabricated sessions. */
export function strengthTrends(logs: StrengthLog[]): StrengthTrend[] {
  const exercises = new Map<string, { name: string; days: Map<string, StrengthSession> }>();
  for (const log of logs) {
    const name = log.exercise?.trim();
    if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(log.workout_date)) continue;
    const key = name.toLowerCase();
    const group = exercises.get(key) ?? { name, days: new Map<string, StrengthSession>() };
    for (const set of log.sets_data ?? [log]) {
      if (set.weight_kg === null || set.weight_kg === undefined || set.weight_kg === '') continue;
      const load = Number(set.weight_kg);
      if (!Number.isFinite(load) || load < 0) continue;
      const reps = set.reps !== null && Number.isFinite(Number(set.reps)) && Number(set.reps) > 0 ? Number(set.reps) : null;
      const current = group.days.get(log.workout_date);
      if (!current || load > current.load || (load === current.load && (reps ?? 0) > (current.reps ?? 0))) {
        group.days.set(log.workout_date, { date: log.workout_date, load, reps });
      }
    }
    if (group.days.size) exercises.set(key, group);
  }
  return [...exercises.values()].map(group => {
    const days = [...group.days.values()].sort((a, b) => a.date.localeCompare(b.date));
    return { exercise: group.name, first: days[0], latest: days[days.length - 1], sessions: days.length, change: days.length > 1 ? days[days.length - 1].load - days[0].load : null };
  }).sort((a, b) => b.latest.date.localeCompare(a.latest.date) || a.exercise.localeCompare(b.exercise));
}
