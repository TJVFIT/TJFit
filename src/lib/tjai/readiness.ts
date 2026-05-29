import type { TjaiReadinessFlag, TjaiReadinessProfile, TjaiUserProfile } from "@/lib/tjai-types";

/**
 * Derived readiness/risk profile (TJFITV.10X PR1).
 *
 * Pure, deterministic classification computed server-side from a normalized
 * TjaiUserProfile. It powers proactive plan adjustments and chat coaching so the
 * model is told the smallest effective intervention instead of inferring risk
 * from raw answers. Rules trace to the ACSM/WHO/ISSN evidence anchors and the
 * safety scope documented in TJFITV.10X.
 */

const SHARP_PAIN_TERMS = ["sharp", "shooting", "stabbing", "numb", "tingl", "radiat", "pinch"];
const LOADED_INJURY_REGIONS = new Set(["lower_back", "knee", "shoulder"]);
const PROTEIN_LIKED_FOODS = new Set(["chicken", "beef", "fish", "eggs", "greek_yogurt", "legumes"]);

function classifyRecoveryRisk(profile: TjaiUserProfile): "low" | "medium" | "high" {
  const poorSleep = profile.sleepHours < 6;
  const highStress = profile.stressLevel === "high" || profile.stressLevel === "very_high";
  const recoveryObstacle =
    profile.biggestObstacles.includes("recovery") || profile.biggestObstacles.includes("stress");
  const aggressive = profile.pace === "aggressive";

  if ((poorSleep && highStress) || (recoveryObstacle && aggressive)) return "high";
  if (poorSleep || highStress || recoveryObstacle) return "medium";
  return "low";
}

function classifyAdherenceRisk(profile: TjaiUserProfile): "low" | "medium" | "high" {
  const beginnerHighFreq = profile.experienceLevel === "beginner" && profile.trainingDays >= 5;
  const constrainedSchedule =
    profile.scheduleConstraint === "family_load" ||
    profile.scheduleConstraint === "shift_work" ||
    profile.scheduleConstraint === "travel";
  const constraintPlusAggressive = constrainedSchedule && profile.pace === "aggressive";
  const shortSessionConflict = profile.scheduleConstraint === "short_sessions" && profile.sessionMinutes > 45;
  const motivationObstacle =
    profile.biggestObstacles.includes("consistency") ||
    profile.biggestObstacles.includes("time") ||
    profile.biggestObstacles.includes("motivation");

  if (beginnerHighFreq || constraintPlusAggressive || shortSessionConflict) return "high";
  if (constrainedSchedule || motivationObstacle) return "medium";
  return "low";
}

function classifyInjuryRisk(profile: TjaiUserProfile): "low" | "medium" | "high" {
  const seriousFlag =
    profile.injuries.includes("recent_surgery") || profile.injuries.includes("chronic_condition");
  const notes = (profile.injuryNotes ?? "").toLowerCase();
  const sharpPain = SHARP_PAIN_TERMS.some((term) => notes.includes(term));
  const multiRegion = profile.injuries.length >= 2;
  const loadedConflict =
    profile.injuries.some((region) => LOADED_INJURY_REGIONS.has(region)) &&
    (profile.trainingPreference === "strength" || profile.trainingPreference === "hypertrophy");

  if (seriousFlag || sharpPain || multiRegion || loadedConflict) return "high";
  if (profile.injuries.length === 1) return "medium";
  return "low";
}

function classifyNutritionFeasibility(profile: TjaiUserProfile): "low" | "medium" | "high" {
  const budgetMode = profile.monthlyFoodBudget === "budget";
  const plantBased = profile.dietStyle === "vegan" || profile.dietStyle === "vegetarian";
  const hasProteinFoods = profile.likedFoods.some((food) => PROTEIN_LIKED_FOODS.has(food));
  const muscleGoal = profile.goal === "muscle_gain" || profile.goal === "recomposition";
  const fewMeals = profile.mealsPerDay <= 2;

  const plantProteinGap = plantBased && muscleGoal && !profile.likedFoods.includes("legumes");
  const fewMealsHighDemand = fewMeals && muscleGoal;

  if ((budgetMode && muscleGoal && !hasProteinFoods) || plantProteinGap || fewMealsHighDemand) return "low";
  if (budgetMode || plantBased || fewMeals) return "medium";
  return "high";
}

function classifyScheduleFeasibility(profile: TjaiUserProfile): "low" | "medium" | "high" {
  const weeklyMinutes = profile.trainingDays * profile.sessionMinutes;
  // Realistic weekly training-minute ceilings implied by life constraints.
  const ceiling =
    profile.scheduleConstraint === "none"
      ? 420
      : profile.scheduleConstraint === "short_sessions"
        ? 180
        : 300;

  if (weeklyMinutes > ceiling) return "low";
  if (weeklyMinutes > ceiling * 0.8) return "medium";
  return "high";
}

export function buildReadinessProfile(profile: TjaiUserProfile): TjaiReadinessProfile {
  const recoveryRisk = classifyRecoveryRisk(profile);
  const adherenceRisk = classifyAdherenceRisk(profile);
  const injuryRisk = classifyInjuryRisk(profile);
  const nutritionFeasibility = classifyNutritionFeasibility(profile);
  const scheduleFeasibility = classifyScheduleFeasibility(profile);

  const teachMode =
    profile.experienceLevel === "beginner" || profile.biggestObstacles.includes("training_knowledge");
  const shortSessions = profile.scheduleConstraint === "short_sessions" || profile.sessionMinutes < 30;

  const planComplexity: TjaiReadinessProfile["planComplexity"] =
    profile.experienceLevel === "beginner" ||
    adherenceRisk === "high" ||
    recoveryRisk === "high" ||
    shortSessions
      ? "minimal"
      : profile.experienceLevel === "advanced"
        ? "advanced"
        : "standard";

  const coachingMode: TjaiReadinessProfile["coachingMode"] =
    adherenceRisk === "high" ? "repair" : teachMode ? "teach" : recoveryRisk === "high" ? "support" : "execute";

  const flags: TjaiReadinessFlag[] = [];
  if (recoveryRisk === "high") {
    flags.push({
      code: "recovery_risk_high",
      severity: "warn",
      message: "Low sleep and/or high stress combined with an aggressive pace.",
      promptInstruction:
        "Moderate the calorie deficit and weekly volume, mandate deloads, and prioritize sleep/cortisol recovery."
    });
  }
  if (adherenceRisk === "high") {
    flags.push({
      code: "adherence_risk_high",
      severity: "warn",
      message: "Schedule, experience, or stated obstacles make a complex plan hard to sustain.",
      promptInstruction:
        "Choose the smallest effective plan, reduce training days/session length, and build in adherence rescue habits."
    });
  }
  if (injuryRisk === "high") {
    flags.push({
      code: "injury_risk_high",
      severity: "block",
      message: "Serious injury history, sharp-pain language, or a loaded-pattern conflict.",
      promptInstruction:
        "Avoid loading the affected pattern, substitute safe alternatives, and recommend clinician review for red-flag pain. Never coach through sharp pain."
    });
  }
  if (nutritionFeasibility === "low") {
    flags.push({
      code: "nutrition_feasibility_low",
      severity: "warn",
      message: "Protein target may be hard to hit given budget, diet style, or meal frequency.",
      promptInstruction:
        "Build a feasible protein strategy within the user's budget and diet style; never require meat for vegetarians/vegans."
    });
  }
  if (scheduleFeasibility === "low") {
    flags.push({
      code: "schedule_feasibility_low",
      severity: "warn",
      message: "Requested training time exceeds realistic weekly availability.",
      promptInstruction:
        "Fit the plan into the realistic weekly time budget and offer a minimum-viable week fallback."
    });
  }

  const blocking = flags.some((flag) => flag.severity === "block");
  const warnCount = flags.filter((flag) => flag.severity === "warn").length;
  const confidence: TjaiReadinessProfile["confidence"] = blocking || warnCount >= 2 ? "low" : warnCount === 1 ? "medium" : "high";

  return {
    recoveryRisk,
    adherenceRisk,
    injuryRisk,
    nutritionFeasibility,
    scheduleFeasibility,
    planComplexity,
    coachingMode,
    confidence,
    flags
  };
}

/** Compact, deterministic prompt block for plan generation and chat coach context. */
export function formatReadinessForPrompt(readiness: TjaiReadinessProfile): string {
  const lines = [
    "══ READINESS & RISK PROFILE (server-derived — obey these) ══",
    `Recovery risk: ${readiness.recoveryRisk} | Adherence risk: ${readiness.adherenceRisk} | Injury risk: ${readiness.injuryRisk}`,
    `Nutrition feasibility: ${readiness.nutritionFeasibility} | Schedule feasibility: ${readiness.scheduleFeasibility}`,
    `Plan complexity: ${readiness.planComplexity} | Coaching mode: ${readiness.coachingMode} | Confidence: ${readiness.confidence}`,
    "Prescribe the smallest effective intervention, not the most complex plan."
  ];
  if (readiness.flags.length > 0) {
    lines.push("Risk-driven instructions:");
    for (const flag of readiness.flags) {
      lines.push(`- [${flag.severity}] ${flag.code}: ${flag.promptInstruction}`);
    }
  }
  return lines.join("\n");
}
