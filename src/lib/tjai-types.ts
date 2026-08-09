import type { Locale } from "@/lib/i18n";

export type StepType = "single" | "multi" | "number" | "text" | "scale" | "slider";
export type MetabolicType = "fast" | "slow" | "stress_dominant" | "hormonal";

export type QuizOptionValue = string | number | boolean;

export type QuizOption = {
  label: string;
  value: QuizOptionValue;
  hint?: string;
};

export type QuizCondition = {
  stepId: string;
  value: QuizOptionValue | QuizOptionValue[];
  operator?: "equals" | "includes" | "not_equals";
};

export type QuizStep = {
  id: string;
  section: string;
  sectionNumber: number;
  totalSections: number;
  question: string;
  sub?: string;
  type: StepType;
  options?: QuizOption[];
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  required: boolean;
  /** Options resolved at render time from another answer (e.g. markets for the chosen country). Wins over `options`. */
  dynamicOptions?: "markets_by_country";
  showIf?: {
    mode?: "all" | "any";
    conditions: QuizCondition[];
  };
};

export type QuizAnswerValue = string | string[] | number | boolean | null | { [key: string]: unknown };
export type QuizAnswers = Record<string, QuizAnswerValue>;

export type TjaiUserProfile = {
  sex: "male" | "female";
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number | null;
  goal:
    | "fat_loss"
    | "muscle_gain"
    | "recomposition"
    | "fitness"
    | "stay_active";
  goalDetail:
    | "general"
    | "aggressive_cut"
    | "sustainable_cut"
    | "size"
    | "strength"
    | "aesthetic"
    | "athletic"
    | "energy"
    | "consistency";
  pace: "slow" | "moderate" | "aggressive";
  bodyType: "very_lean" | "lean" | "average" | "overweight" | "obese" | "unknown";
  estimatedBodyFat: number;
  injuries: Array<"knee" | "lower_back" | "shoulder" | "hip" | "wrist_elbow" | "recent_surgery" | "chronic_condition">;
  injuryNotes: string | null;
  activityLevel: "very_low" | "low" | "moderate" | "active";
  sleepHours: number;
  stressLevel: "very_low" | "low" | "moderate" | "high" | "very_high";
  scheduleConstraint: "none" | "short_sessions" | "shift_work" | "family_load" | "travel";
  scheduleNotes: string | null;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  trainingLocation: "home" | "gym" | "hybrid";
  equipment: Array<"bodyweight" | "bands" | "dumbbells" | "bench" | "barbell_rack" | "machines">;
  trainingDays: number;
  sessionMinutes: number;
  trainingPreference: "strength" | "hypertrophy" | "conditioning" | "mixed";
  dietStyle: "balanced" | "high_protein" | "low_carb" | "halal" | "vegetarian" | "vegan";
  dietaryRestrictions: Array<"none" | "halal" | "vegetarian" | "vegan" | "dairy_free" | "gluten_free" | "nut_free">;
  restrictionNotes: string | null;
  likedFoods: Array<"chicken" | "beef" | "fish" | "eggs" | "rice" | "oats" | "fruit" | "greek_yogurt" | "potatoes" | "legumes">;
  avoidedFoods: Array<"seafood" | "red_meat" | "dairy" | "eggs" | "spicy_food" | "nothing_specific">;
  monthlyFoodBudget: "budget" | "moderate" | "premium";
  cookingStyle: "minimal" | "simple" | "batch";
  mealsPerDay: number;
  /** Country slug from market-data (or "other"). Grounds grocery localization. */
  country: string;
  /** Market slug valid for `country` per market-data (or "other_market"). */
  groceryMarket: string;
  jobType: "desk" | "mixed" | "physical";
  dailySteps: "under_4k" | "4k_8k" | "8k_12k" | "over_12k";
  dietHistory: "first_plan" | "kept_results" | "regained" | "yo_yo";
  sleepQuality: "restorative" | "restless" | "poor";
  drinkHabits: Array<"mostly_water" | "sugary_drinks" | "diet_soda" | "alcohol" | "energy_drinks">;
  eatingOutFrequency: "rarely" | "weekly" | "several_weekly" | "daily";
  weekendConsistency: "consistent" | "slightly_off" | "derails";
  supplements: Array<"none" | "protein" | "creatine" | "omega3" | "vitamin_d" | "magnesium" | "preworkout">;
  biggestObstacles: Array<"motivation" | "consistency" | "time" | "food_cravings" | "training_knowledge" | "stress" | "recovery">;
  successVision:
    | "look_different"
    | "feel_energetic"
    | "fit_clothes_better"
    | "lift_heavier"
    | "build_routine";
  dailyRoutine: string;
  /** Adaptive intake follow-ups — all optional; absent on legacy quiz submissions. */
  injuryAreas?: Array<"knee" | "shoulder" | "lower_back" | "wrist" | "ankle" | "hip" | "neck" | "other">;
  injurySeverity?: "mild_discomfort" | "working_around" | "recovering";
  /** Preferred workout length bucket (30/45/60/75/90). Mirrors s5_duration when no override answer exists. */
  sessionLengthMinutes?: number;
  dislikedExercises?: Array<
    "burpees" | "running" | "jumping" | "overhead_press" | "deep_squats" | "deadlifts" | "pull_ups" | "planks"
  >;
  preferredSplit?: "full_body" | "upper_lower" | "push_pull_legs" | "no_preference";
  /** Cardio modalities the user will actually do — adherence lever for fat-loss/conditioning plans. */
  cardioPreferences?: Array<
    "walking" | "running" | "cycling" | "swimming" | "rowing_machines" | "jump_rope" | "none"
  >;
  /** Accepted protein sources when dietStyle is vegetarian/vegan — without this those meal plans guess. */
  plantProteinSources?: Array<
    "tofu_tempeh" | "seitan" | "legumes" | "protein_powder" | "dairy_eggs" | "nuts_seeds"
  >;
};

export type TjaiReadinessFlag = {
  code: string;
  severity: "info" | "warn" | "block";
  message: string;
  promptInstruction: string;
};

/**
 * Server-derived readiness/risk profile (TJFITV.10X PR1).
 * Distinct from TJAIMetrics.confidenceScore, which is a data-completeness score.
 * This classifies coaching risk from normalized quiz answers and feeds both the
 * plan-generation prompt and chat coach context. Never trust the client for this.
 */
export type TjaiReadinessProfile = {
  recoveryRisk: "low" | "medium" | "high";
  adherenceRisk: "low" | "medium" | "high";
  injuryRisk: "low" | "medium" | "high";
  nutritionFeasibility: "low" | "medium" | "high";
  scheduleFeasibility: "low" | "medium" | "high";
  planComplexity: "minimal" | "standard" | "advanced";
  coachingMode: "teach" | "execute" | "support" | "repair";
  confidence: "low" | "medium" | "high";
  flags: TjaiReadinessFlag[];
};

export type TjaiMemorySnapshot = {
  latestPlanSummary: string | null;
  priorPlanGoal: string | null;
  planVersion: number | null;
  preferences: Array<{ key: string; value: string }>;
  workoutSummary: string[];
  progressSummary: {
    latestWeightKg: number | null;
    changeKg: number | null;
    latestBodyFatPercent: number | null;
    latestWaistCm: number | null;
  };
  adaptiveCheckpoint: {
    shouldAdapt: boolean;
    urgency: "low" | "medium" | "high";
    triggerRegen: boolean;
    regenReason: string | null;
  } | null;
};

export type TJAIMetrics = {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  protein: number;
  fat: number;
  carbs: number;
  water: number;
  estimatedBodyFat: number;
  weeklyWeightChange: number;
  timeToGoal: string;
  metabolicType: MetabolicType;
  plateauWeek: number;
  reverseDietNeeded: boolean;
  trainingDayCalories: number;
  restDayCalories: number;
  refeedWeeks: number[];
  deloadWeeks: number[];
  leanMass: number;
  projectedFinalWeight: number;
  projectedFinalBF: number;
  weightCurve: number[];
  confidenceScore: number;
};

export type TJAIRecipe = {
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: number;
  steps?: string[];
  storageTip?: string;
  batchNote?: string;
  difficultyLevel?: "Easy" | "Medium" | "Advanced" | string;
};

export type TJAIMeal = {
  name: string;
  time: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepNote: string;
  recipe?: TJAIRecipe;
  educationNote?: string;
};

export type TJAIPlan = {
  summary: {
    greeting: string;
    calorieTarget: number;
    protein: number;
    fat: number;
    carbs: number;
    water: number;
    weeklyChange: string;
    timeToGoal: string;
    keyInsight: string;
  };
  diet: {
    philosophy: string;
    metabolicReset?: {
      enabled: boolean;
      title?: string;
      details?: string;
    };
    cheatMealStrategy?: {
      optimalDay?: string;
      preMeal?: string[];
      duringMeal?: string[];
      postMeal?: string[];
      frequency?: string;
    };
    recoveryProtocol?: {
      title?: string;
      sleepOptimization?: string[];
      cortisolManagement?: string[];
      weeklyMetrics?: string[];
    };
    weeks: Array<{
      weekRange: string;
      phase: string;
      calories: number;
      adjustment: string;
      isRefeed?: boolean;
      isPlateauBreaker?: boolean;
      /** 2-3 coach-voice sentences explaining why this phase's nutrition looks the way it does. */
      coachRationale?: string;
      days: Array<{
        label: string;
        meals: TJAIMeal[];
        totals: { calories: number; protein: number; carbs: number; fat: number };
        waterTarget?: string;
        notes?: string;
      }>;
    }>;
    supplements?: {
      tier1?: Array<{ name: string; dose: string; timing: string; why: string; estimatedCost?: string; alreadyUsing?: boolean }>;
      tier2?: Array<{ name: string; dose: string; timing: string; why: string; estimatedCost?: string; alreadyUsing?: boolean }>;
      tier3?: Array<{ name: string; dose: string; timing: string; why: string; estimatedCost?: string; alreadyUsing?: boolean }>;
    };
    tips?: string[];
  };
  program: {
    philosophy: string;
    structure: string;
    weeks: Array<{
      weekRange: string;
      phase: string;
      focus: string;
      isDeload?: boolean;
      /** Short instruction on how to execute the deload (volume/load cuts). Only meaningful when isDeload. */
      deloadGuidance?: string;
      /** 2-3 coach-voice sentences tying this phase to the user's actual profile numbers. */
      coachRationale?: string;
      days: Array<{
        day: string;
        label: string;
        /** Primary training emphasis of the session, e.g. "Horizontal push + quads". */
        focus?: string;
        /** Realistic total session time including warmup, in minutes. */
        estimatedMinutes?: number;
        exercises: Array<{
          name: string;
          sets: number;
          reps: string;
          rest: string;
          note?: string;
          educationNote?: string;
          /** Eccentric-pause-concentric notation, e.g. "3-1-1". */
          tempo?: string;
          /** Target effort on the RPE scale (6-10). */
          rpe?: number;
          /** Rest between working sets in seconds. */
          restSeconds?: number;
          /** Short warm-up set prescription for this lift, e.g. "2 ramp sets at 50/75%". */
          warmupSets?: string;
          /** 1-2 equally effective alternates honoring the user's equipment and injuries. */
          substitutions?: string[];
          /** Max 2 short execution cues. */
          formCues?: string[];
        }>;
        warmup?: string;
        cooldown?: string;
        duration?: string;
      }>;
    }>;
    beginnerFoundations?: string[];
    progressionRules?: string[];
    cardioRecommendation?: string;
    injuryModifications?: string;
    /** One paragraph describing how load/reps progress across the 12 weeks. */
    progressionModel?: string;
    /** How to test strength/fitness markers in the final week and what to do with the results. */
    testWeekGuidance?: string;
  };
  mindset?: {
    weeklyCheckin?: string;
    ifYouStruggle?: string;
    motivation?: string;
  };
};

export type TJAIGroceryList = {
  categories: Array<{
    name: string;
    items: Array<{ name: string; quantity: string; unit?: string; estimatedCost?: string }>;
  }>;
};

export type TJAIMealPrepTask = {
  time: string;
  task: string;
  detail: string;
  storage?: string;
};

export type TJAICopy = {
  nav: {
    back: string;
    continue: string;
    generate: string;
    stepOf: string;
    sectionOf: string;
  };
  validation: {
    required: string;
  };
  quiz: {
    title: string;
    subtitle: string;
    notAtAll: string;
    extremely: string;
    chars: string;
    unitYears: string;
    unitCm: string;
    unitKg: string;
    unitPct: string;
    unitHrs: string;
  };
  calculating: {
    title: string;
    statuses: string[];
    calorieTarget: string;
    proteinTarget: string;
    progressTarget: string;
  };
  result: {
    eyebrow: string;
    yourDiet: string;
    yourProgram: string;
    supplements: string;
    mindset: string;
    saveToDashboard: string;
    startOver: string;
    saving: string;
    saved: string;
    saveError: string;
    generatedAt: string;
    metrics: {
      calories: string;
      protein: string;
      fat: string;
      carbs: string;
      water: string;
      weekly: string;
      timeToGoal: string;
    };
    labels: {
      warmup: string;
      cooldown: string;
      duration: string;
    };
    mealPrep: {
      title: string;
      summaryPrefix: string;
      totalTimeFallback: string;
      equipmentPrefix: string;
    };
    alternatives: {
      title: string;
      subtitle: string;
      loading: string;
    };
  };
  sections: string[];
};

export type TJAIStepFactory = (locale: Locale) => QuizStep[];
