// Comeback 12w — full Program export.
//
// Week 1 is authored at full detail. Weeks 2-12 follow the
// progression rules in `./weeks/progression-rules.md`. As each
// week-NN.ts file lands, import it here and add to the `weeks`
// array. Until then the array starts with week 1 only — the PDF
// generator and detail page render what's available; consumers know
// to mark the program as `version: '1.0.0-week1-only'` until weeks
// 2-12 land.

import type { Program } from "@/lib/programs/schema";
import { comebackHeader } from "./header";
import { week01 } from "./weeks/week-01";

const exercisesUsed = Array.from(
  new Set(
    week01.days
      .flatMap((d) => d.exercises.map((p) => p.exerciseId))
  )
);

export const comeback12w: Program = {
  ...comebackHeader,
  weeks: [
    week01
    // week02, week03, ..., week12 — see ./weeks/progression-rules.md
  ],
  exercises_used: exercisesUsed
};
