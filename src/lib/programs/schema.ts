// v3.9 program schema — the spine for real, day-by-day training data.
//
// Every program follows this shape. Every program is auditable,
// versionable, and exportable to PDF/print/screen via the same
// pipeline. Existing `src/lib/content.ts` (catalog cards) stays
// untouched; this layer is the *training* layer underneath.
//
// Locale strategy: EN content is authored by hand. Other locales
// start as `__TRANSLATE__` placeholder strings; the translation
// pipeline (scripts/translate-content.ts) walks the data tree and
// fills them in via DeepL / Microsoft Translator. The
// `translation_status` flag per locale tracks whether each value is
// machine-translated, native-reviewed, or hand-authored.

export type Locale = "en" | "tr" | "ar" | "es" | "fr";

export const SUPPORTED_LOCALES: Locale[] = ["en", "tr", "ar", "es", "fr"];

/** Locale-keyed string. EN is canonical; others may be `__TRANSLATE__`. */
export type LocalizedString = Record<Locale, string>;

/** Sentinel placeholder filled by the translation pipeline. */
export const TRANSLATE = "__TRANSLATE__";

/** Helper: build a LocalizedString from an EN string with placeholders. */
export function en(value: string): LocalizedString {
  return { en: value, tr: TRANSLATE, ar: TRANSLATE, es: TRANSLATE, fr: TRANSLATE };
}

// ============================================================
// Exercise — atomic movement defined once in a shared library
// ============================================================
export type Exercise = {
  id: string;
  name: LocalizedString;
  muscleGroups: string[];
  equipment: string[];
  description: LocalizedString;
  cues: LocalizedString;
  warningNotes?: LocalizedString;
};

// ============================================================
// Set — single working / warmup / failure unit
// ============================================================
export type SetType =
  | "working"
  | "warmup"
  | "amrap"
  | "failure"
  | "rest_pause"
  | "drop";

export type Set = {
  type: SetType;
  /** Number, range string ('8-10'), or directive ('AMRAP'). */
  reps?: number | string;
  /** Free-form weight directive: 'BW' / '60% 1RM' / 'RPE 7' / '20kg'. */
  weight?: string;
  /** Seconds — for timed exercises (planks, carries, intervals). */
  duration?: number;
  rest_seconds: number;
  /** Rate of Perceived Exertion 1-10. */
  rpe?: number;
  /** Tempo: 'eccentric-bottomPause-concentric-topPause', e.g. '3-1-1-0'. */
  tempo?: string;
  notes?: LocalizedString;
};

export type ExercisePrescription = {
  exerciseId: string;
  sets: Set[];
  /** Exercise id this is supersetted with — alternate sets back-to-back. */
  superset_with?: string;
};

// ============================================================
// WorkoutDay — a single day in the calendar
// ============================================================
export type DayType = "training" | "rest" | "active_recovery" | "deload";

export type WorkoutDay = {
  /** 1-7 within the week. */
  day: number;
  weekNumber: number;
  type: DayType;
  name: LocalizedString;
  duration_minutes_estimate: number;
  warmup: LocalizedString;
  cooldown: LocalizedString;
  exercises: ExercisePrescription[];
  rpe_target?: number;
  notes: LocalizedString;
};

// ============================================================
// ProgramWeek — a 7-day mesocycle slice
// ============================================================
export type ProgramPhase =
  | "foundation"
  | "progression"
  | "intensification"
  | "deload"
  | "peak";

export type ProgramWeek = {
  weekNumber: number;
  phase: ProgramPhase;
  focus: LocalizedString;
  days: WorkoutDay[];
  weeklyVolume_estimate: { sets: number; minutes: number };
};

// ============================================================
// Program — full deliverable
// ============================================================
export type ProgramCategory =
  | "strength"
  | "fat_loss"
  | "performance"
  | "home"
  | "outdoor"
  | "specialty"
  | "hypertrophy"
  | "recomp";

export type ProgramSetting = "home" | "gym" | "outdoor" | "hybrid";

export type ProgramDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "beginner_to_advanced"
  | "intermediate_to_advanced";

export type Program = {
  id: string;
  slug: string;
  category: ProgramCategory;
  setting: ProgramSetting;
  difficulty: ProgramDifficulty;
  duration_weeks: number;
  sessions_per_week: number;
  equipment_needed: string[];
  goal: LocalizedString;
  who_for: LocalizedString;
  who_not_for: LocalizedString;
  results_expected: LocalizedString;
  prerequisites: LocalizedString;
  pricing_usd: number;
  cover_image_path: string;
  weeks: ProgramWeek[];
  /** Subset of the global library this program references. */
  exercises_used: string[];
  why_this_works: LocalizedString;
  progression_strategy: LocalizedString;
  deload_strategy: LocalizedString;
  evidence_citations: string[];
  created_at: string;
  version: string;
};
