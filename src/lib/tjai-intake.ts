import type { QuizAnswers, QuizOptionValue, TjaiUserProfile } from "@/lib/tjai-types";

const bodyTypeToBodyFat: Record<TjaiUserProfile["bodyType"], number> = {
  very_lean: 10,
  lean: 16,
  average: 22,
  overweight: 30,
  obese: 38,
  unknown: 22
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : typeof value === "string" ? [value] : [];
}

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function parseMaybeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = asString(value).trim();
  if (!text) return null;
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function matchFromMap<T extends QuizOptionValue>(value: unknown, entries: Array<[string, T]>, fallback: T): T {
  if (typeof value === "number" || typeof value === "boolean") return value as T;
  const normalized = normalizeText(asString(value));
  for (const [needle, mapped] of entries) {
    if (normalized === needle || normalized.includes(needle)) {
      return mapped;
    }
  }
  return fallback;
}

function normalizeGoal(value: unknown): TjaiUserProfile["goal"] {
  return matchFromMap(
    value,
    [
      ["fat_loss", "fat_loss"],
      ["lose fat", "fat_loss"],
      ["burn fat", "fat_loss"],
      ["muscle_gain", "muscle_gain"],
      ["build muscle", "muscle_gain"],
      ["get bigger", "muscle_gain"],
      ["recomposition", "recomposition"],
      ["improve fitness", "fitness"],
      ["fitness", "fitness"],
      ["stay active", "stay_active"]
    ],
    "fat_loss"
  );
}

function normalizeGoalDetail(value: unknown, goal: TjaiUserProfile["goal"]): TjaiUserProfile["goalDetail"] {
  const normalized = normalizeText(asString(value));
  if (normalized) {
    const explicit = matchFromMap(
      value,
      [
        ["aggressive_cut", "aggressive_cut"],
        ["sustainable_cut", "sustainable_cut"],
        ["size", "size"],
        ["strength", "strength"],
        ["aesthetic", "aesthetic"],
        ["athletic", "athletic"],
        ["energy", "energy"],
        ["consistency", "consistency"]
      ],
      "general"
    );
    if (explicit !== "general") return explicit;
  }
  if (goal === "fat_loss") return "sustainable_cut";
  if (goal === "muscle_gain") return "size";
  if (goal === "recomposition") return "athletic";
  if (goal === "fitness") return "energy";
  if (goal === "stay_active") return "consistency";
  return "general";
}

function normalizePace(value: unknown): TjaiUserProfile["pace"] {
  return matchFromMap(
    value,
    [
      ["slow", "slow"],
      ["sustainable", "slow"],
      ["moderate", "moderate"],
      ["fast", "aggressive"],
      ["aggressive", "aggressive"]
    ],
    "moderate"
  );
}

function normalizeSex(value: unknown): TjaiUserProfile["sex"] {
  return matchFromMap(
    value,
    [
      ["male", "male"],
      ["female", "female"]
    ],
    "male"
  );
}

function normalizeBodyType(value: unknown): TjaiUserProfile["bodyType"] {
  return matchFromMap(
    value,
    [
      ["very_lean", "very_lean"],
      ["very lean", "very_lean"],
      ["lean", "lean"],
      ["average", "average"],
      ["overweight", "overweight"],
      ["obese", "obese"]
    ],
    "unknown"
  );
}

function normalizeStress(value: unknown): TjaiUserProfile["stressLevel"] {
  return matchFromMap(
    value,
    [
      ["very_low", "very_low"],
      ["very low", "very_low"],
      ["low", "low"],
      ["moderate", "moderate"],
      ["high", "high"],
      ["very_high", "very_high"],
      ["very high", "very_high"]
    ],
    "moderate"
  );
}

function normalizeActivity(value: unknown): TjaiUserProfile["activityLevel"] {
  return matchFromMap(
    value,
    [
      ["very_low", "very_low"],
      ["very low", "very_low"],
      ["low", "low"],
      ["moderate", "moderate"],
      ["active", "active"]
    ],
    "moderate"
  );
}

function normalizeScheduleConstraint(value: unknown): TjaiUserProfile["scheduleConstraint"] {
  return matchFromMap(
    value,
    [
      ["none", "none"],
      ["short_sessions", "short_sessions"],
      ["shift_work", "shift_work"],
      ["family_load", "family_load"],
      ["travel", "travel"]
    ],
    "none"
  );
}

function normalizeExperience(value: unknown): TjaiUserProfile["experienceLevel"] {
  return matchFromMap(
    value,
    [
      ["beginner", "beginner"],
      ["intermediate", "intermediate"],
      ["advanced", "advanced"]
    ],
    "beginner"
  );
}

function normalizeLocation(value: unknown): TjaiUserProfile["trainingLocation"] {
  return matchFromMap(
    value,
    [
      ["home", "home"],
      ["gym", "gym"],
      ["hybrid", "hybrid"]
    ],
    "gym"
  );
}

function normalizeDietStyle(value: unknown): TjaiUserProfile["dietStyle"] {
  return matchFromMap(
    value,
    [
      ["balanced", "balanced"],
      ["high_protein", "high_protein"],
      ["low_carb", "low_carb"],
      ["halal", "halal"],
      ["vegetarian", "vegetarian"],
      ["vegan", "vegan"]
    ],
    "balanced"
  );
}

function normalizeCookingStyle(value: unknown): TjaiUserProfile["cookingStyle"] {
  return matchFromMap(
    value,
    [
      ["minimal", "minimal"],
      ["simple", "simple"],
      ["batch", "batch"]
    ],
    "simple"
  );
}

function normalizeBudget(value: unknown): TjaiUserProfile["monthlyFoodBudget"] {
  return matchFromMap(
    value,
    [
      ["budget", "budget"],
      ["moderate", "moderate"],
      ["premium", "premium"]
    ],
    "moderate"
  );
}

function normalizeTrainingPreference(value: unknown, goal: TjaiUserProfile["goal"]): TjaiUserProfile["trainingPreference"] {
  const explicit = matchFromMap(
    value,
    [
      ["strength", "strength"],
      ["hypertrophy", "hypertrophy"],
      ["conditioning", "conditioning"],
      ["mixed", "mixed"]
    ],
    "mixed"
  );
  if (explicit !== "mixed") return explicit;
  if (goal === "muscle_gain") return "hypertrophy";
  if (goal === "fat_loss" || goal === "fitness") return "conditioning";
  return "mixed";
}

function normalizeSuccessVision(value: unknown): TjaiUserProfile["successVision"] {
  return matchFromMap(
    value,
    [
      ["look_different", "look_different"],
      ["energetic", "feel_energetic"],
      ["feel_energetic", "feel_energetic"],
      ["fit_clothes", "fit_clothes_better"],
      ["lift_heavier", "lift_heavier"],
      ["routine", "build_routine"]
    ],
    "look_different"
  );
}

function normalizeMulti<T extends string>(
  value: unknown,
  allowed: readonly T[],
  legacyMap?: Record<string, T>
): T[] {
  const raw = asStringArray(value);
  if (raw.length === 0) return [];
  const values = raw
    .map((item) => {
      const normalized = normalizeText(item);
      if (legacyMap?.[normalized]) return legacyMap[normalized];
      if ((allowed as readonly string[]).includes(item)) return item as T;
      if ((allowed as readonly string[]).includes(normalized)) return normalized as T;
      return null;
    })
    .filter((item): item is T => Boolean(item));
  return Array.from(new Set(values));
}

const injuryLegacyMap: Record<string, TjaiUserProfile["injuries"][number]> = {
  "knee pain": "knee",
  "lower back pain": "lower_back",
  "shoulder pain": "shoulder",
  "hip pain": "hip",
  "wrist / elbow pain": "wrist_elbow",
  "recent surgery": "recent_surgery",
  "chronic condition": "chronic_condition"
};

const restrictionLegacyMap: Record<string, TjaiUserProfile["dietaryRestrictions"][number]> = {
  none: "none",
  halal: "halal",
  vegetarian: "vegetarian",
  vegan: "vegan",
  "dairy free": "dairy_free",
  dairy_free: "dairy_free",
  "gluten free": "gluten_free",
  gluten_free: "gluten_free",
  "nut free": "nut_free",
  nut_free: "nut_free"
};

const likedFoodsLegacyMap: Record<string, TjaiUserProfile["likedFoods"][number]> = {
  chicken: "chicken",
  beef: "beef",
  fish: "fish",
  eggs: "eggs",
  rice: "rice",
  oats: "oats",
  fruit: "fruit",
  "greek yogurt": "greek_yogurt",
  greek_yogurt: "greek_yogurt",
  potatoes: "potatoes",
  legumes: "legumes"
};

const avoidedFoodsLegacyMap: Record<string, TjaiUserProfile["avoidedFoods"][number]> = {
  seafood: "seafood",
  "red meat": "red_meat",
  red_meat: "red_meat",
  dairy: "dairy",
  eggs: "eggs",
  "spicy food": "spicy_food",
  spicy_food: "spicy_food",
  "nothing specific": "nothing_specific",
  nothing_specific: "nothing_specific"
};

const supplementLegacyMap: Record<string, TjaiUserProfile["supplements"][number]> = {
  none: "none",
  "protein powder": "protein",
  protein: "protein",
  creatine: "creatine",
  omega3: "omega3",
  "omega-3": "omega3",
  vitamin_d: "vitamin_d",
  "vitamin d": "vitamin_d",
  magnesium: "magnesium",
  preworkout: "preworkout",
  "pre-workout": "preworkout"
};

const obstacleLegacyMap: Record<string, TjaiUserProfile["biggestObstacles"][number]> = {
  motivation: "motivation",
  consistency: "consistency",
  time: "time",
  cravings: "food_cravings",
  "food cravings": "food_cravings",
  knowledge: "training_knowledge",
  "training knowledge": "training_knowledge",
  stress: "stress",
  recovery: "recovery",
  "not knowing what to do": "training_knowledge"
};

function coerceNumberAnswer(value: unknown, fallback: number): number {
  const parsed = parseMaybeNumber(value);
  return parsed && parsed > 0 ? parsed : fallback;
}

export function normalizeQuizAnswers(raw: Record<string, unknown>): QuizAnswers {
  const goal = normalizeGoal(raw.s2_goal);
  const normalized: QuizAnswers = {
    ...raw,
    s2_goal: goal,
    s2_goal_detail: normalizeGoalDetail(raw.s2_goal_detail, goal),
    s1_gender: normalizeSex(raw.s1_gender),
    s1_age: coerceNumberAnswer(raw.s1_age, 29),
    s1_weight: coerceNumberAnswer(raw.s1_weight, 75),
    s1_height: coerceNumberAnswer(raw.s1_height, 175),
    s2_pace: normalizePace(raw.s2_pace),
    s3_body_silhouette: normalizeBodyType(raw.s3_body_silhouette ?? raw.s3_body_type),
    s3_body_type: normalizeBodyType(raw.s3_body_silhouette ?? raw.s3_body_type),
    s3_estimated_bf: coerceNumberAnswer(raw.s3_estimated_bf, bodyTypeToBodyFat[normalizeBodyType(raw.s3_body_silhouette ?? raw.s3_body_type)]),
    s17_injuries: normalizeMulti(
      raw.s17_injuries,
      ["knee", "lower_back", "shoulder", "hip", "wrist_elbow", "recent_surgery", "chronic_condition"] as const,
      injuryLegacyMap
    ),
    s17_conditions: asString(raw.s17_conditions).trim(),
    s4_daily_activity: normalizeActivity(raw.s4_daily_activity),
    s8_hours: coerceNumberAnswer(raw.s8_hours, 7),
    s9_stress: normalizeStress(raw.s9_stress),
    s18_schedule_constraint: normalizeScheduleConstraint(raw.s18_schedule_constraint),
    s18_schedule_notes: asString(raw.s18_schedule_notes).trim(),
    s5_trains: normalizeExperience(raw.s5_trains),
    s5_type: normalizeLocation(raw.s5_type),
    s5_equipment: normalizeMulti(
      raw.s5_equipment,
      ["bodyweight", "bands", "dumbbells", "bench", "barbell_rack", "machines"] as const
    ),
    s5_days: coerceNumberAnswer(raw.s5_days, 4),
    s5_duration: coerceNumberAnswer(raw.s5_duration, 45),
    s5_training_preference: normalizeTrainingPreference(raw.s5_training_preference, goal),
    s12_diet_style: normalizeDietStyle(raw.s12_diet_style),
    s13_allergies: normalizeMulti(
      raw.s13_allergies,
      ["none", "halal", "vegetarian", "vegan", "dairy_free", "gluten_free", "nut_free"] as const,
      restrictionLegacyMap
    ),
    s13_restriction_notes: asString(raw.s13_restriction_notes).trim(),
    s12_foods_like: normalizeMulti(
      raw.s12_foods_like,
      ["chicken", "beef", "fish", "eggs", "rice", "oats", "fruit", "greek_yogurt", "potatoes", "legumes"] as const,
      likedFoodsLegacyMap
    ),
    s12_foods_avoid: normalizeMulti(
      raw.s12_foods_avoid,
      ["seafood", "red_meat", "dairy", "eggs", "spicy_food", "nothing_specific"] as const,
      avoidedFoodsLegacyMap
    ),
    s14_budget: normalizeBudget(raw.s14_budget),
    s14_time: normalizeCookingStyle(raw.s14_time),
    s11_meals: coerceNumberAnswer(raw.s11_meals, 4),
    s16_which_supps: normalizeMulti(
      raw.s16_which_supps,
      ["none", "protein", "creatine", "omega3", "vitamin_d", "magnesium", "preworkout"] as const,
      supplementLegacyMap
    ),
    s18_biggest_problem: normalizeMulti(
      raw.s18_biggest_problem,
      ["motivation", "consistency", "time", "food_cravings", "training_knowledge", "stress", "recovery"] as const,
      obstacleLegacyMap
    ),
    s19_success_vision: normalizeSuccessVision(raw.s19_success_vision),
    s19_daily_routine: asString(raw.s19_daily_routine).trim(),
    s19_target_weight: parseMaybeNumber(raw.s19_target_weight)
  };

  const restrictions = asStringArray(normalized.s13_allergies);
  if (restrictions.length === 0) normalized.s13_allergies = ["none"];
  if (restrictions.length > 1 && restrictions.includes("none")) {
    normalized.s13_allergies = restrictions.filter((item) => item !== "none");
  }

  const supplements = asStringArray(normalized.s16_which_supps);
  if (supplements.length === 0) normalized.s16_which_supps = ["none"];
  if (supplements.length > 1 && supplements.includes("none")) {
    normalized.s16_which_supps = supplements.filter((item) => item !== "none");
  }

  const injuries = asStringArray(normalized.s17_injuries);
  if (injuries.length > 1 && injuries.includes("none")) {
    normalized.s17_injuries = injuries.filter((item) => item !== "none");
  }

  const avoidedFoods = asStringArray(normalized.s12_foods_avoid);
  if (avoidedFoods.length > 1 && avoidedFoods.includes("nothing_specific")) {
    normalized.s12_foods_avoid = avoidedFoods.filter((item) => item !== "nothing_specific");
  }

  return normalized;
}

export function buildTjaiUserProfile(rawAnswers: Record<string, unknown>): TjaiUserProfile {
  const answers = normalizeQuizAnswers(rawAnswers);
  const bodyType = oneOf(
    asString(answers.s3_body_silhouette),
    ["very_lean", "lean", "average", "overweight", "obese", "unknown"] as const,
    "unknown"
  );

  const goal = oneOf(
    asString(answers.s2_goal),
    ["fat_loss", "muscle_gain", "recomposition", "fitness", "stay_active"] as const,
    "fat_loss"
  );

  const profile: TjaiUserProfile = {
    sex: oneOf(asString(answers.s1_gender), ["male", "female"] as const, "male"),
    age: coerceNumberAnswer(answers.s1_age, 29),
    heightCm: coerceNumberAnswer(answers.s1_height, 175),
    weightKg: coerceNumberAnswer(answers.s1_weight, 75),
    targetWeightKg: parseMaybeNumber(answers.s19_target_weight),
    goal,
    goalDetail: normalizeGoalDetail(answers.s2_goal_detail, goal),
    pace: oneOf(asString(answers.s2_pace), ["slow", "moderate", "aggressive"] as const, "moderate"),
    bodyType,
    estimatedBodyFat: coerceNumberAnswer(answers.s3_estimated_bf, bodyTypeToBodyFat[bodyType]),
    injuries: normalizeMulti(
      answers.s17_injuries,
      ["knee", "lower_back", "shoulder", "hip", "wrist_elbow", "recent_surgery", "chronic_condition"] as const
    ),
    injuryNotes: asString(answers.s17_conditions).trim() || null,
    activityLevel: oneOf(asString(answers.s4_daily_activity), ["very_low", "low", "moderate", "active"] as const, "moderate"),
    sleepHours: coerceNumberAnswer(answers.s8_hours, 7),
    stressLevel: oneOf(asString(answers.s9_stress), ["very_low", "low", "moderate", "high", "very_high"] as const, "moderate"),
    scheduleConstraint: oneOf(asString(answers.s18_schedule_constraint), ["none", "short_sessions", "shift_work", "family_load", "travel"] as const, "none"),
    scheduleNotes: asString(answers.s18_schedule_notes).trim() || null,
    experienceLevel: oneOf(asString(answers.s5_trains), ["beginner", "intermediate", "advanced"] as const, "beginner"),
    trainingLocation: oneOf(asString(answers.s5_type), ["home", "gym", "hybrid"] as const, "gym"),
    equipment: (() => {
      const values = normalizeMulti(
        answers.s5_equipment,
        ["bodyweight", "bands", "dumbbells", "bench", "barbell_rack", "machines"] as const
      );
      return values.length > 0 ? values : ["bodyweight"];
    })(),
    trainingDays: coerceNumberAnswer(answers.s5_days, 4),
    sessionMinutes: coerceNumberAnswer(answers.s5_duration, 45),
    trainingPreference: oneOf(asString(answers.s5_training_preference), ["strength", "hypertrophy", "conditioning", "mixed"] as const, "mixed"),
    dietStyle: oneOf(asString(answers.s12_diet_style), ["balanced", "high_protein", "low_carb", "halal", "vegetarian", "vegan"] as const, "balanced"),
    dietaryRestrictions: normalizeMulti(
      answers.s13_allergies,
      ["none", "halal", "vegetarian", "vegan", "dairy_free", "gluten_free", "nut_free"] as const
    ),
    restrictionNotes: asString(answers.s13_restriction_notes).trim() || null,
    likedFoods: normalizeMulti(
      answers.s12_foods_like,
      ["chicken", "beef", "fish", "eggs", "rice", "oats", "fruit", "greek_yogurt", "potatoes", "legumes"] as const
    ),
    avoidedFoods: normalizeMulti(
      answers.s12_foods_avoid,
      ["seafood", "red_meat", "dairy", "eggs", "spicy_food", "nothing_specific"] as const
    ),
    monthlyFoodBudget: oneOf(asString(answers.s14_budget), ["budget", "moderate", "premium"] as const, "moderate"),
    cookingStyle: oneOf(asString(answers.s14_time), ["minimal", "simple", "batch"] as const, "simple"),
    mealsPerDay: coerceNumberAnswer(answers.s11_meals, 4),
    supplements: normalizeMulti(
      answers.s16_which_supps,
      ["none", "protein", "creatine", "omega3", "vitamin_d", "magnesium", "preworkout"] as const
    ),
    biggestObstacles: normalizeMulti(
      answers.s18_biggest_problem,
      ["motivation", "consistency", "time", "food_cravings", "training_knowledge", "stress", "recovery"] as const
    ),
    successVision: oneOf(
      asString(answers.s19_success_vision),
      ["look_different", "feel_energetic", "fit_clothes_better", "lift_heavier", "build_routine"] as const,
      "look_different"
    ),
    dailyRoutine: asString(answers.s19_daily_routine).trim()
  };

  return profile;
}

export function summarizeProfile(profile: TjaiUserProfile): string[] {
  return [
    `Goal: ${profile.goal}`,
    `Goal detail: ${profile.goalDetail}`,
    `Pace: ${profile.pace}`,
    `Training: ${profile.trainingDays} days/week, ${profile.sessionMinutes} min, ${profile.trainingLocation}`,
    `Constraint: ${profile.scheduleConstraint}${profile.scheduleNotes ? ` (${profile.scheduleNotes})` : ""}`,
    `Experience: ${profile.experienceLevel}`,
    `Diet style: ${profile.dietStyle}`,
    `Restrictions: ${profile.dietaryRestrictions.join(", ") || "none"}${profile.restrictionNotes ? ` (${profile.restrictionNotes})` : ""}`,
    `Obstacles: ${profile.biggestObstacles.join(", ") || "none"}`
  ];
}
