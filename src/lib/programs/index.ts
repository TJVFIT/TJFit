// Programs registry — day-by-day program definitions.
//
// ⚠ NOTE (Plan2 phase 8 honesty pass, 2026-05-27): this registry is
// imported NOWHERE in src/ today — it currently registers only
// `comeback12w`. The programs the homepage/catalog market come from
// `src/lib/content.ts` (83 entries) and the 4 backed free-product
// coach-uploaded custom programs (custom_programs table). Do NOT assume this
// registry is what customers see. Keep it in sync with real content
// before wiring it to a route. See docs/audits/content-truth-2026-05.md.
//
// To add a new program: create a folder under `programs/` matching
// the program slug, build out the header + week files per the
// schema, then import + register here.

import type { Program } from "./schema";
import { comeback12w } from "./programs/comeback-12w";

const REGISTRY: Record<string, Program> = {
  [comeback12w.slug]: comeback12w
};

export function getProgram(slug: string): Program | undefined {
  return REGISTRY[slug];
}

export function listPrograms(): Program[] {
  return Object.values(REGISTRY);
}

export function listProgramSlugs(): string[] {
  return Object.keys(REGISTRY);
}

// Re-export schema + library for convenience
export type { Program, ProgramWeek, WorkoutDay, Exercise, Set, Locale } from "./schema";
export { exercises, getExercise, allExerciseIds } from "./exercises/library";
