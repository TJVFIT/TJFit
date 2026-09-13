import { describe, expect, it } from 'vitest';
import { strengthTrends, type StrengthLog } from '../src/lib/progress/strength-trends';
const log = (date: string, load: number | null, exercise = 'Squat'): StrengthLog => ({ workout_date: date, exercise, weight_kg: load, reps: 8, sets_data: null });
describe('observed load trends', () => {
  it('orders actual dated sessions and compares first with latest', () => {
    expect(strengthTrends([log('2026-09-12', 60), log('2026-09-01', 50)])[0]).toMatchObject({ first: { load: 50 }, latest: { load: 60 }, change: 10, sessions: 2 });
  });
  it('uses the highest individual set and merges same-day duplicate exercise rows', () => {
    const row = { ...log('2026-09-12', 30), sets_data: [{ weight_kg: 50, reps: 5 }, { weight_kg: 45, reps: 8 }] };
    const [trend] = strengthTrends([row, { ...log('2026-09-12', 50, ' squat '), reps: 6 }, log('2026-09-01', 40)]);
    expect(trend.latest).toMatchObject({ load: 50, reps: 6 });
    expect(trend.sessions).toBe(2);
  });
  it('keeps missing load or insufficient history missing', () => {
    expect(strengthTrends([log('2026-09-12', null)])).toEqual([]);
    expect(strengthTrends([log('2026-09-12', 0)])[0].change).toBeNull();
  });
});
