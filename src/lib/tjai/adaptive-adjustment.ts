import type { TjaiReadinessProfile } from "@/lib/tjai-types";

/**
 * Server-derived adaptive plan adjustment (TJFITV.10X PR9).
 *
 * Closes the data-flywheel loop: weekly check-ins (energy + adherence) become a
 * concrete, safety-capped plan adjustment instead of just stored telemetry. Pure
 * and deterministic — no model calls — so it is cheap and unit-testable offline,
 * mirroring the readiness/coach-state modules.
 *
 * The output is advisory: it tells the coaching layer how to nudge calories and
 * training intensity for the coming week, never below the science calorie floor.
 */

type CoachingMode = TjaiReadinessProfile["coachingMode"];

/** One stored weekly check-in, newest-first when passed as an array. */
export type AdaptiveCheckIn = {
  /** 1 (depleted) … 5 (great). */
  energy: number;
  /** 1 (off-plan) … 5 (fully on-plan). */
  adherence: number;
  /** ISO week_start (YYYY-MM-DD); used only for ordering/debug, not math. */
  weekStart?: string | null;
};

export type AdaptiveIntensityAction = "increase" | "hold" | "deload";

export type AdaptiveAdjustment = {
  /** Suggested daily calorie change vs. the current target, in kcal. */
  calorieDelta: number;
  /** What to do with training volume/intensity next week. */
  intensityAction: AdaptiveIntensityAction;
  /** Whether a refeed/diet break is advisable this week. */
  refeedRecommended: boolean;
  /** Coaching mode this adjustment aligns with (echoes readiness when available). */
  coachingMode: CoachingMode | null;
  /** 0–1: low when we acted on a single noisy data point, higher with a trend. */
  confidence: number;
  /** Short, user-safe explanation of why. */
  rationale: string;
};

/** Largest weekly calorie move we will ever advise, up or down. */
const MAX_WEEKLY_CALORIE_STEP = 200;

function clampDelta(delta: number, floorHeadroom: number | null): number {
  let d = Math.max(-MAX_WEEKLY_CALORIE_STEP, Math.min(MAX_WEEKLY_CALORIE_STEP, Math.round(delta)));
  // Never cut below the calorie floor: if we only have `floorHeadroom` kcal of
  // room above the floor, a cut can't exceed that headroom.
  if (d < 0 && floorHeadroom != null) {
    d = Math.max(d, -Math.max(0, Math.floor(floorHeadroom)));
  }
  return d;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Compute the adaptive adjustment from recent check-ins and plan context.
 *
 * @param checkIns         Recent check-ins, newest-first. Up to the last 3 are used.
 * @param currentCalories  Current daily calorie target (kcal), or null if unknown.
 * @param calorieFloorKcal Science floor (kcal) below which we never cut, or null.
 * @param goal             Coarse goal string; mapped to cut/bulk/maintain.
 * @param readinessMode    Optional coaching mode from the readiness profile.
 */
export function computeAdaptiveAdjustment(input: {
  checkIns: AdaptiveCheckIn[];
  currentCalories?: number | null;
  calorieFloorKcal?: number | null;
  goal?: string | null;
  readinessMode?: CoachingMode | null;
}): AdaptiveAdjustment {
  const recent = input.checkIns.slice(0, 3);
  const energies = recent.map((c) => c.energy).filter((n) => Number.isFinite(n));
  const adherences = recent.map((c) => c.adherence).filter((n) => Number.isFinite(n));

  const avgEnergy = average(energies);
  const avgAdherence = average(adherences);

  const readinessMode = input.readinessMode ?? null;
  const floorHeadroom =
    input.currentCalories != null && input.calorieFloorKcal != null
      ? input.currentCalories - input.calorieFloorKcal
      : null;

  // No usable signal yet — hold and tell the user to keep logging.
  if (avgEnergy == null || avgAdherence == null) {
    return {
      calorieDelta: 0,
      intensityAction: "hold",
      refeedRecommended: false,
      coachingMode: readinessMode,
      confidence: 0,
      rationale: "Not enough check-in history yet — hold the current plan and log this week."
    };
  }

  const goal = normalizeGoal(input.goal);
  // Confidence grows with how many recent check-ins we averaged over.
  const confidence = Math.min(1, recent.length / 3);

  // Overreaching: depleted but disciplined → deload + small refeed, no cut.
  if (avgEnergy <= 2 && avgAdherence >= 4) {
    return {
      calorieDelta: clampDelta(goal === "cut" ? 150 : 0, floorHeadroom),
      intensityAction: "deload",
      refeedRecommended: goal === "cut",
      coachingMode: readinessMode ?? "support",
      confidence,
      rationale:
        "Low energy with high adherence signals overreaching — deload training" +
        (goal === "cut" ? " and add a short refeed before resuming the cut." : " and keep calories steady.")
    };
  }

  // Low adherence: the plan isn't being followed — don't change the numbers,
  // simplify and rebuild consistency first.
  if (avgAdherence <= 2) {
    return {
      calorieDelta: 0,
      intensityAction: "hold",
      refeedRecommended: false,
      coachingMode: readinessMode ?? "repair",
      confidence,
      rationale: "Adherence is low — hold the targets and rebuild consistency before adjusting calories."
    };
  }

  // Low energy (but adherence not high enough to call it overreaching): ease off.
  if (avgEnergy <= 2) {
    return {
      calorieDelta: clampDelta(goal === "cut" ? 150 : 0, floorHeadroom),
      intensityAction: "hold",
      refeedRecommended: false,
      coachingMode: readinessMode ?? "support",
      confidence,
      rationale: "Energy is running low — hold intensity and ease the deficit slightly to recover."
    };
  }

  // Strong week: high energy and on-plan → progress toward the goal.
  if (avgEnergy >= 4 && avgAdherence >= 4) {
    if (goal === "cut") {
      return {
        calorieDelta: clampDelta(-150, floorHeadroom),
        intensityAction: "increase",
        refeedRecommended: false,
        coachingMode: readinessMode ?? "execute",
        confidence,
        rationale: "Strong, on-plan week — push the cut with a small calorie reduction and a touch more training."
      };
    }
    if (goal === "bulk") {
      return {
        calorieDelta: clampDelta(150, floorHeadroom),
        intensityAction: "increase",
        refeedRecommended: false,
        coachingMode: readinessMode ?? "execute",
        confidence,
        rationale: "Strong, on-plan week — add a small surplus and progress training to keep building."
      };
    }
    return {
      calorieDelta: 0,
      intensityAction: "increase",
      refeedRecommended: false,
      coachingMode: readinessMode ?? "execute",
      confidence,
      rationale: "Strong, on-plan week — hold calories at maintenance and progress training intensity."
    };
  }

  // Default: steady week — stay the course.
  return {
    calorieDelta: 0,
    intensityAction: "hold",
    refeedRecommended: false,
    coachingMode: readinessMode,
    confidence,
    rationale: "Steady week — hold the current plan and reassess at the next check-in."
  };
}

function normalizeGoal(goal?: string | null): "cut" | "bulk" | "maintain" {
  const g = (goal ?? "").toLowerCase();
  if (/cut|fat|lose|loss|lean|shred|deficit/.test(g)) return "cut";
  if (/bulk|gain|mass|build|surplus|grow/.test(g)) return "bulk";
  return "maintain";
}

/** Compact prompt block so the chat coach acts on this adjustment, not raw check-ins. */
export function formatAdjustmentForPrompt(adj: AdaptiveAdjustment): string {
  const lines = [
    "══ ADAPTIVE ADJUSTMENT (server-derived from check-ins — act on this) ══",
    `Calorie change: ${adj.calorieDelta > 0 ? "+" : ""}${adj.calorieDelta} kcal/day | Training: ${adj.intensityAction}` +
      (adj.refeedRecommended ? " | Refeed: yes" : ""),
    adj.coachingMode ? `Mode: ${adj.coachingMode} (confidence ${adj.confidence.toFixed(2)})` : null,
    `Why: ${adj.rationale}`
  ].filter(Boolean) as string[];
  return lines.join("\n");
}
