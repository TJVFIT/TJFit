// Programs registry — the single source of truth for every real,
// day-by-day v3.9 program.
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
