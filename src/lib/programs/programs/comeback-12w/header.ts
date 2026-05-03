// Comeback 12-week program — metadata + program-level fields.
// Week-by-week training data lives in `./weeks/*` (week 1 fully
// authored; weeks 2-12 per the progression template in
// `./weeks/progression-rules.md`).

import { en } from "@/lib/programs/schema";

export const comebackHeader = {
  id: "comeback-12w",
  slug: "comeback",
  category: "strength" as const,
  setting: "gym" as const,
  difficulty: "beginner_to_advanced" as const,
  duration_weeks: 12,
  sessions_per_week: 4,
  equipment_needed: [
    "barbell",
    "dumbbells",
    "bench",
    "squat_rack",
    "pull_up_bar",
    "cable_machine",
    "leg_curl_machine"
  ],
  goal: en(
    "Return to training intelligently after a break of 6+ months. Rebuild strength, conditioning, and confidence without injury. By week 12 you'll be back to ~85-90% of your previous bests with a body that's ready to train hard again."
  ),
  who_for: en(
    "Lifters who used to train but stopped — work, life, injury, kids, illness — and want to come back. Best if you have at least some prior training experience (≥6 months at any point in your life). Beginners welcome but progress will be different."
  ),
  who_not_for: en(
    "Not for absolute beginners with zero prior training (start with a true beginner program first). Not for advanced athletes pushing peak performance — use Strong Bench or Strong Squat for that. Not for anyone with an active acute injury without medical clearance."
  ),
  results_expected: en(
    "Realistic outcomes by week 12 if you hit ≥80% of sessions: ~85-90% of previous strength levels restored, full mobility back, conditioning measurably improved, ~2-4 kg of body recomposition (depending on diet). Variance is high — depends on prior training level, current age, sleep, nutrition. The 'muscle memory' effect is real (myonuclei persist after detraining) and it's why coming back is faster than starting fresh."
  ),
  prerequisites: en(
    "Medical clearance if returning from injury or any chronic condition. Ability to commit to 4 sessions/week of ~75 minutes each. Access to a fully-equipped gym (barbell, dumbbells, bench, rack, cables)."
  ),
  pricing_usd: 5.99,
  cover_image_path: "/programs/comeback-12w/cover.jpg",
  why_this_works: en(
    "This program follows the principle of 'minimum effective dose returning'. After a layoff, the nervous system retains motor patterns even when muscle is lost — research on muscle memory shows myonuclei persist for years after training stops, accelerating reacquisition of strength and size. The first 4 weeks rebuild technique without injury risk. Weeks 5-8 progressively reintroduce volume. Weeks 9-12 reintroduce intensity. By week 12 most lifters are back to ~85-90% of previous bests; full restoration usually takes 6-9 months total but the inflection point is here."
  ),
  progression_strategy: en(
    "Linear progression on main lifts: add 2.5 kg/5 lb per week on lower body, 1.25 kg/2.5 lb per week on upper body, until form fails or reps drop. When stuck for two weeks, deload 10-20% and rebuild from there. Double progression on accessories: hit the top of the rep range with all sets, then add weight and drop back to the bottom of the range. RPE governs intensity globally — never push past RPE 9 in this program."
  ),
  deload_strategy: en(
    "Weeks 4 and 8 are deload weeks: same exercises, working set count reduced by 40%, RPE capped at 6. This allows tissue recovery and supercompensation. Do NOT skip deloads — they accelerate progress; skipping them stalls progress and increases injury risk over the full mesocycle."
  ),
  evidence_citations: [
    "https://pubmed.ncbi.nlm.nih.gov/30153194/ — Schoenfeld et al. 2018 on resistance training frequency and muscle mass",
    "https://pubmed.ncbi.nlm.nih.gov/27328853/ — Helms et al. 2016 on volume, intensity, and recovery",
    "https://strongerbyscience.com/muscle-memory/ — Muscle memory and detraining research summary (Greg Nuckols)",
    "https://www.acsm.org/docs/default-source/files-for-resource-library/exercise-pre-screening-tool.pdf — ACSM pre-screening for return-to-training"
  ],
  created_at: "2026-05-03",
  version: "1.0.0"
};
