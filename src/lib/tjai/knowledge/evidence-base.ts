/**
 * TJAI evidence base — compact, coach-usable reference distilled from current
 * sports-science literature (Schoenfeld/Helms/Israetel volume landmarks,
 * Zourdos RPE/RIR, ISSN protein position stand, APRE autoregulation reviews,
 * NSCA periodization, PAR-Q+/SCOFF screeners).
 *
 * This module is string/data only — no I/O. It is injected into TJAI prompts
 * so the model reasons from the same evidence a coach would, instead of
 * generic training folklore.
 */

export const RPE_RIR_SCALE = `RPE (Rate of Perceived Exertion) — RIR (Reps in Reserve) scale:
RPE 10 = 0 RIR — true failure, no rep left
RPE 9.5 = 0–1 RIR — maybe one more
RPE 9   = 1 RIR  — one rep left
RPE 8   = 2 RIR  — hypertrophy sweet spot for most working sets
RPE 7   = 3 RIR  — technique / speed / early-mesocycle
RPE 6   = 4 RIR  — warm-up, re-teach, deload
Autoregulate: if planned RPE is met with more RIR than prescribed, add load or reps next session. If met with less RIR, hold load.`;

/**
 * Weekly sets per muscle group — Renaissance Periodization landmarks.
 * MV = maintenance, MEV = minimum effective, MAV = max adaptive, MRV = max recoverable.
 * Plans should start a mesocycle near MEV and accumulate to ~MAV before deload.
 */
export const WEEKLY_VOLUME_LANDMARKS = `Weekly working sets per muscle (advanced lifter bands — scale 70% for beginners, 85% for intermediates):
- Chest:      MV 8  | MEV 10 | MAV 12–20 | MRV 22
- Back:       MV 10 | MEV 14 | MAV 16–22 | MRV 25
- Shoulders:  MV 8  | MEV 8  | MAV 16–20 | MRV 26
- Biceps:     MV 5  | MEV 8  | MAV 14–20 | MRV 26
- Triceps:    MV 4  | MEV 6  | MAV 10–14 | MRV 18
- Quads:      MV 6  | MEV 8  | MAV 12–18 | MRV 20
- Hamstrings: MV 4  | MEV 6  | MAV 10–16 | MRV 20
- Glutes:     MV 0  | MEV 0  | MAV 8–16  | MRV 16
- Calves:     MV 6  | MEV 8  | MAV 12–16 | MRV 20
- Abs:        MV 0  | MEV 0  | MAV 12–16 | MRV 25
Start mesocycle at ~MEV; add 1–2 sets/week per muscle as fatigue allows; deload when reps drop or RPE creeps above prescription.`;

export const PROTEIN_TARGETS = `Protein targets (ISSN position stand + meta-analyses):
- Lean gain / hypertrophy: 1.6–2.2 g/kg body mass (or ~2.2–2.4 g/kg lean mass if very lean)
- Fat loss while training:  1.8–2.4 g/kg (higher end protects lean mass in deficit)
- General fitness/wellness: 1.2–1.6 g/kg
- Per-meal leucine threshold for MPS: ~2.5 g leucine (≈0.4 g/kg protein) × 4 feedings
- Hard cap: no additional benefit above ~2.5 g/kg for natural lifters.`;

export const SFR_EXERCISE_HIERARCHY = `Stimulus-to-Fatigue Ratio (SFR) ranked picks — use top-ranked unless equipment or injury forces a sub:
Chest:    flat DB press > incline DB press > machine chest press > barbell bench > dips > cable fly
Back:     chest-supported row > lat pulldown > neutral-grip pull-up > barbell row > cable row > seal row
Shoulders:lateral raise (DB/cable) > machine overhead > DB overhead > behind-neck/BB overhead (avoid if shoulder issue)
Biceps:   incline DB curl > preacher curl > cable curl > barbell curl
Triceps:  overhead rope > cable pushdown > skull crusher > close-grip bench
Quads:    hack squat > leg press > pendulum squat > front squat > back squat > Bulgarian split (high SFR, high fatigue)
Hamstr:   lying leg curl > seated leg curl > Romanian deadlift > good morning
Glutes:   hip thrust > cable kickback > Bulgarian split > deficit reverse lunge
Calves:   standing calf raise (weighted) > leg-press calf raise > seated (soleus emphasis)
Rule: if an exercise causes joint pain or you cannot train it at RPE 8 with controlled tempo, sub down the list.`;

export const PERIODIZATION_MODELS = `Periodization choices:
- Linear (beginner <12 mo training): 4–6 wk hypertrophy → 4 wk strength → 1 wk deload; same exercises, progress load weekly.
- DUP (intermediate): rotate hypertrophy/strength/power stimuli within the week — best for 2–4x/week training frequency.
- Block (advanced): 3–4 wk accumulation (MAV volume) → 1–2 wk intensification (lower volume, higher load) → 1 wk deload. Preferred for dedicated hypertrophy or strength specialization.
- Autoregulated (APRE/RPE-based): prescribe RPE target, adjust load rep-by-rep or session-by-session. Highest adherence in busy / shift-work users.
Default for TJFit: block periodization for intermediate+ users, DUP for 2–3x/wk trainees, linear for true beginners, always with RPE autoregulation on top.`;

export const DELOAD_TRIGGERS = `Deload triggers — deload when 2+ are true for the week:
- Planned deload (every 4–6 weeks of accumulation)
- Weekly average sleep <6h for 7+ nights
- Resting HR elevated >7 bpm over baseline for 3+ days
- HRV drop >10% from rolling 7-day baseline for 3+ days
- Reps-at-load fell on 2+ key lifts despite not changing weight
- Bar speed visibly slower or RPE creeping +1 above prescription
- Persistent joint pain (not DOMS) in 2+ movements
Deload protocol: same frequency, sets -40%, load -10-20%, RPE cap 7, no failure work, no new exercises.`;

export const AUTOREGULATION_RULES = `Session-level autoregulation:
1. Warm-up to top set feels heavier than RPE target → cut working load 5–10% rather than grind reps.
2. Top-set RPE lower than prescribed → bank the extra volume, same load next session.
3. Back-off sets at the same load feel RPE 9 when prescribed 8 → drop 10% for remaining sets.
4. Sleep <5h last night → cap every working set at prescribed RPE -1, skip any near-failure work.
5. Shoulder/elbow/knee warns during warm-up → substitute down the SFR list, do not push through.
Coach voice: explain the adjustment in one sentence so the user learns the pattern, not just the swap.`;

export const CARDIO_DOSE_RESPONSE = `Cardio dosing:
- Fat-loss support: start at 150 min/week moderate (Zone 2) + 1–2 short HIIT sessions (4×4 min @ 90% HRmax). Add 30 min/week only if weight-loss stalls 2 weeks.
- Health minimum: WHO guidance = 150 min/wk moderate or 75 min vigorous + 2 resistance sessions.
- Cardio-lifting interference: separate same-day sessions by 6+ hr OR keep cardio ≤30 min moderate on lifting days to preserve hypertrophy.
- Zone 2 definition: can speak full sentences, HR ≈ 60–70% max, subjective RPE 4–5/10.`;

export const MEAL_TIMING_RULES = `Evidence-based meal timing (none of this beats daily total adherence):
- Peri-workout protein: 30–40g within 1–2h pre or 1h post training.
- Carb distribution: load carbs around training (≈50% of daily carbs in the 4h window pre + post session) — most relevant on 2-a-day or 90-min+ sessions.
- Fiber: 14 g per 1000 kcal, spread across meals; heavy fiber pre-workout hurts comfort for many.
- Hydration: 35 ml/kg baseline + 500 ml per hour of training; urine pale-straw is the practical cue.
- Sleep-hygiene feeding: last big meal ≥2h pre-bed; caffeine cutoff 8–10h before bed for reliable sleep.`;

export const MI_COACHING_VOICE = `Motivational Interviewing voice (Miller & Rollnick):
- Express empathy: reflect what the user said before prescribing (“Two weeks of travel is a lot — makes sense this feels stalled.”).
- Develop discrepancy: connect today's choice to their stated goal, not a generic should.
- Roll with resistance: if they push back, align first (“fair — a 5-day split is a lot right now”), then offer a down-shift, not a lecture.
- Support self-efficacy: anchor every recommendation to something they have already done well in-app (logged weight, hit protein, finished a session).
- No shame, no scare-language, no moralizing about food or skipped workouts. Treat adherence as data, not character.`;

export type EvidenceBaseSection =
  | "rpe_rir"
  | "volume_landmarks"
  | "protein"
  | "sfr"
  | "periodization"
  | "deload"
  | "autoregulation"
  | "cardio"
  | "meal_timing"
  | "mi_voice";

const SECTION_MAP: Record<EvidenceBaseSection, string> = {
  rpe_rir: RPE_RIR_SCALE,
  volume_landmarks: WEEKLY_VOLUME_LANDMARKS,
  protein: PROTEIN_TARGETS,
  sfr: SFR_EXERCISE_HIERARCHY,
  periodization: PERIODIZATION_MODELS,
  deload: DELOAD_TRIGGERS,
  autoregulation: AUTOREGULATION_RULES,
  cardio: CARDIO_DOSE_RESPONSE,
  meal_timing: MEAL_TIMING_RULES,
  mi_voice: MI_COACHING_VOICE
};

export function renderEvidenceBase(sections: EvidenceBaseSection[]): string {
  return sections
    .map((key) => SECTION_MAP[key])
    .filter(Boolean)
    .join("\n\n");
}

export const EVIDENCE_BASE_FOR_PLAN: EvidenceBaseSection[] = [
  "rpe_rir",
  "volume_landmarks",
  "sfr",
  "periodization",
  "deload",
  "autoregulation",
  "protein",
  "cardio",
  "meal_timing",
  "mi_voice"
];

export const EVIDENCE_BASE_FOR_CHAT: EvidenceBaseSection[] = [
  "rpe_rir",
  "autoregulation",
  "deload",
  "protein",
  "mi_voice"
];
