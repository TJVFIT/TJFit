import { EXERCISE_CATALOG, type CatalogExercise } from "./catalog.generated";

/**
 * Exercise-name resolution against the public-domain catalogue.
 *
 * Why this exists: `src/lib/tjai-plan-validation.ts` clamps numbers and
 * truncates strings, but never checks that a prescribed movement is a real
 * one. A generated plan can name an exercise that does not exist and nothing
 * notices. The hand-authored library (library.ts) is only 18 movements, so it
 * is far too narrow to validate against — a legitimate "Bulgarian Split Squat"
 * would fail. The 873-entry catalogue is broad enough to be useful.
 *
 * This is deliberately a LOOKUP, not a fuzzy matcher. It normalises obvious
 * surface differences (case, punctuation, plural, filler words, compound-word
 * splits) and nothing else. An approximate matcher that silently maps
 * "Barbell Hack Squat" onto "Barbell Squat" would launder a hallucination into
 * a confident pass, which is worse than returning null.
 *
 * ---------------------------------------------------------------------------
 * MEASURED LIMITATION — read before wiring this into validation.
 *
 * Run against TJFit's own 18 hand-authored library exercises, all of which are
 * correct and correctly spelled, this resolver matches **9 of 18 (50%)**.
 * The misses are real naming-convention differences, not errors:
 *
 *   Barbell Back Squat        catalogue has "Barbell Squat"
 *   Barbell Bench Press       catalogue qualifies its grip
 *   Lat Pulldown              catalogue qualifies its grip
 *   Overhead Press (Barbell)  catalogue words it differently
 *   Bulgarian Split Squat, Lying or Seated Leg Curl, Single-Arm Dumbbell Row,
 *   Seated Dumbbell Shoulder Press, Tricep Rope Pushdown
 *
 * So: do NOT use `knownRatio` as a pass/fail gate on generated plans. A plan
 * consisting entirely of legitimate movements would score ~0.5 and get
 * rejected. A check that is wrong half the time on correct input is worse than
 * no check, because people learn to ignore it.
 *
 * What this IS good for: enriching a known movement with muscle/equipment/level
 * metadata, and seeding program authoring with 873 real movements. Closing the
 * naming gap properly needs an alias table mapping TJFit's conventions onto the
 * catalogue's — that is authoring work, not something to infer.
 * ---------------------------------------------------------------------------
 */

/** Words that carry no identity — dropping them merges trivial phrasings. */
const FILLER = new Set(["the", "a", "an", "with", "on", "using"]);

/**
 * Lowercase, strip accents and punctuation, drop filler, singularise trailing
 * plurals, collapse whitespace. "Barbell Curls" and "barbell curl" converge.
 */
export function normalizeExerciseName(raw: string): string {
  const base = raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !FILLER.has(w))
    // Naive depluralisation is safe here because the catalogue vocabulary has
    // no word whose meaning turns on a trailing "s" (there is no "pres" vs
    // "press" pair, etc.).
    .map((w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
  return base.join(" ");
}

/**
 * Word separation is not meaningful in this vocabulary: the catalogue writes
 * "Pullups" where a plan will say "Pull-Up", and "Pushups" where it says
 * "Push-Up". Both collapse to the same key here, so the compound-word split is
 * absorbed as a spelling difference rather than treated as a different
 * movement. This is still an exact lookup — it does not bring unrelated names
 * together, because a name that differs by an actual WORD ("Barbell Back
 * Squat" vs "Barbell Squat") still produces a different key.
 */
function collapseKey(normalized: string): string {
  return normalized.replace(/\s+/g, "");
}

const BY_NORMALIZED: ReadonlyMap<string, CatalogExercise> = (() => {
  const m = new Map<string, CatalogExercise>();
  for (const ex of EXERCISE_CATALOG) {
    const key = normalizeExerciseName(ex.n);
    // First write wins: the catalogue is sorted, so collisions resolve
    // deterministically rather than by array order chance.
    if (!m.has(key)) m.set(key, ex);
  }
  return m;
})();

const BY_COLLAPSED: ReadonlyMap<string, CatalogExercise> = (() => {
  const m = new Map<string, CatalogExercise>();
  for (const ex of EXERCISE_CATALOG) {
    const key = collapseKey(normalizeExerciseName(ex.n));
    if (!m.has(key)) m.set(key, ex);
  }
  return m;
})();

/** Exact catalogue entry for a name, or null. Never guesses. */
export function resolveExercise(name: string): CatalogExercise | null {
  if (!name) return null;
  const normalized = normalizeExerciseName(name);
  return BY_NORMALIZED.get(normalized) ?? BY_COLLAPSED.get(collapseKey(normalized)) ?? null;
}

export function isKnownExercise(name: string): boolean {
  return resolveExercise(name) !== null;
}

/** Total catalogue size — used by tests to catch a truncated regeneration. */
export const CATALOG_SIZE = EXERCISE_CATALOG.length;

export type ExerciseAudit = {
  known: string[];
  unknown: string[];
  /** 0-1. Callers decide what to do with a low score; this makes no policy. */
  knownRatio: number;
};

/**
 * Audit every movement in a generated plan.
 *
 * Reports rather than rejects. A plan naming one unrecognised movement is
 * usually a phrasing difference; a plan where most movements are unrecognised
 * is a different problem, and only the caller has the context to decide which.
 */
export function auditExerciseNames(names: readonly string[]): ExerciseAudit {
  const known: string[] = [];
  const unknown: string[] = [];
  for (const n of names) {
    (isKnownExercise(n) ? known : unknown).push(n);
  }
  const total = known.length + unknown.length;
  return { known, unknown, knownRatio: total === 0 ? 1 : known.length / total };
}
