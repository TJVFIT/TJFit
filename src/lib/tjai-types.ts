import type { Locale } from "@/lib/i18n";

export type StepType = "single" | "multi" | "number" | "text" | "scale" | "slider";
export type MetabolicType = "fast" | "slow" | "stress_dominant" | "hormonal";

export type QuizStep = {
  id: string;
  section: string;
  sectionNumber: number;
  totalSections: number;
  question: string;
  sub?: string;
  type: StepType;
  options?: string[];
  placeholder?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  required: boolean;
  skipIf?: { stepId: string; value: string | string[] };
};

export type QuizAnswerValue = string | string[] | number | boolean | null | { [key: string]: unknown };
export type QuizAnswers = Record<string, QuizAnswerValue>;

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
      days: Array<{
        day: string;
        label: string;
        exercises: Array<{
          name: string;
          sets: number;
          reps: string;
          rest: string;
          note?: string;
          educationNote?: string;
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
  };
  sections: string[];
};

export type TJAIStepFactory = (locale: Locale) => QuizStep[];
