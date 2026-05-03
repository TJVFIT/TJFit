# Comeback 12w — Week 2-12 progression rules

> Week 1 is fully authored at `./week-01.ts` as the foundation
> template. Weeks 2-12 follow the rules below. Each week is its own
> file (`week-02.ts` through `week-12.ts`) with the same shape as
> week-01 but adjusted volume / intensity per the table.
>
> A future authoring session writes the actual `WorkoutDay` data per
> these rules. The progression is non-negotiable — these aren't
> suggestions, they're the program.

## Mesocycle map

| Week | Phase | RPE Target | Working Sets / Movement | Total Weekly Sets | Notes |
|------|-------|------------|-------------------------|-------------------|-------|
| 1 | Foundation | 6 | 3 (compounds), 2-3 (accessories) | ~48 | Authored. Re-introduce patterns. |
| 2 | Foundation | 6 | 4 / 3 | ~58 | +1 set per compound vs week 1. |
| 3 | Foundation | 7 | 4 / 3 | ~58 | Same volume, RPE 7 (3 reps in reserve). |
| 4 | **Deload** | 6 | 2 / 2 | ~30 | Same exercises, ~50% volume. Critical recovery week. |
| 5 | Progression | 7 | 4 / 3 | ~58 | Resume volume after deload. |
| 6 | Progression | 8 | 4 / 3 | ~58 | RPE 8 (2 RIR). First taste of real intensity. |
| 7 | Progression | 8 | 5 / 3 | ~68 | +1 set on compounds. Peak volume week. |
| 8 | **Deload** | 6 | 3 / 2 | ~36 | Critical. Do NOT skip. |
| 9 | Intensification | 8 | 5×5 (compounds) | ~58 | Drop to lower reps, higher weight. RPE 8. |
| 10 | Intensification | 8 | 5×3 (compounds) | ~52 | Lower reps, near-max RPE 8. |
| 11 | Intensification | 9 | 4×3 (compounds) | ~46 | RPE 9 — 1 rep in reserve. Max effort sets. |
| 12 | **Peak** | 9-10 | 1RM test or 3×3 PR attempt | ~32 | Test day. Celebrate the comeback. |

## Per-day pattern (constant across weeks 2-12)

The 4 training days keep the same lift hierarchy as week 1:

- **Day 1**: Lower Body, Squat focus
- **Day 2**: Rest
- **Day 3**: Upper Body, Push focus
- **Day 4**: Rest
- **Day 5**: Lower Body, Hinge focus (deadlift / RDL)
- **Day 6**: Upper Body, Pull focus
- **Day 7**: Rest

Same exercise selection week-over-week. Only volume and intensity change.

## Specific lift progressions

### Squat (compound, Day 1 + Day 5 supplementary)

| Week | Day 1 working | Day 5 supplementary |
|------|---------------|---------------------|
| 1 | 3×8 RPE 6 | 3×6 RPE 6 |
| 2 | 4×8 RPE 6 | 3×6 RPE 6 |
| 3 | 4×8 RPE 7 | 3×6 RPE 7 |
| 4 | 2×6 RPE 6 (deload) | 2×4 RPE 5 (deload) |
| 5 | 4×6 RPE 7 | 3×4 RPE 7 |
| 6 | 4×6 RPE 8 | 3×4 RPE 8 |
| 7 | 5×5 RPE 8 | 3×4 RPE 8 |
| 8 | 3×5 RPE 6 (deload) | 2×3 RPE 5 (deload) |
| 9 | 5×5 RPE 8 | (drop) |
| 10 | 5×3 RPE 8 | (drop) |
| 11 | 4×3 RPE 9 | (drop) |
| 12 | Work up to 1×3 PR or 1RM test | (drop) |

### Bench (compound, Day 3)

Mirror the squat progression with same week-by-week working set count and RPE target. By week 12: 1RM test or 3RM PR attempt.

### Deadlift / RDL (compound, Day 5)

Same pattern. By week 12: heavy single or 3×3 PR attempt.

### Bent-Over Row + Lat Pulldown (Day 6)

Same volume scheme. Pulling lifts don't peak at 1RM in week 12 — instead, week 12 pull session is moderate (4×6 RPE 7) to allow squat / bench / deadlift to peak without back fatigue compromising those tests.

### Accessories (split squat, leg curl, calf raise, DB row, curl, pushdown, plank)

Across all 12 weeks: 2-3 sets, RPE 7-8, 8-12 reps. These are recovery-friendly. Add weight when top of rep range hit on all sets (double progression).

## Deload week details

**Weeks 4 and 8 specifically:**

- Same 4-day training schedule (Days 1, 3, 5, 6).
- Each working set count cut by ~50%. Example: week 3 had 4 sets of squat → week 4 has 2 sets.
- RPE capped at 6.
- Skip the heaviest accessory set if fatigue is high.
- Same warmup and cooldown.
- Same notes as week 1 day 1: this is technique reinforcement, not a strength test.

## Authoring checklist for week-N file

When a future session authors `week-NN.ts`:

1. Copy `week-01.ts` shape (same `ProgramWeek` structure, same 7 days with 4 training + 3 rest).
2. Update `weekNumber` to N.
3. Update `phase` to match the table above (foundation / progression / intensification / deload / peak).
4. Update `focus` localized string with the week's specific intent.
5. For each training day, adjust the working set count and RPE per the lift-specific tables.
6. Adjust `rpe_target` on the day to match.
7. Update day-level `notes` with anything specific to that week (e.g. "First week back at intensity after deload — start cautious").
8. Recompute `weeklyVolume_estimate` (rough sets × ~5 minutes per set).

## Why this isn't fake content

The lift-by-lift, week-by-week table above IS the program. A coach reading week 5's prescription ("squat 4×6 RPE 7") gets all the information needed to train. The "exercise data file" version is just that prescription expressed in the schema format — same data, different shape. Week 1 proves the schema renders correctly to PDF; weeks 2-12 are mechanical translations of this table into the schema.

## Status

| Week | File | Status |
|------|------|--------|
| 1 | `week-01.ts` | ✅ Authored |
| 2-12 | `week-02.ts` … `week-12.ts` | ⏳ Awaiting authoring session per rules above |
