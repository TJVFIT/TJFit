/**
 * Pure derived facts about a bundle — computed from the real catalogue in
 * bundles.ts / bundle-content.ts, never hand-typed. Feeds the split strip,
 * "what's inside" stats, and comparison surfaces.
 */

import { getBundle } from "@/lib/bundles";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type WeeklySplitDay = {
  day: (typeof WEEK_DAYS)[number];
  /** Session name for that day, or null on rest days. */
  label: string | null;
};

/** 7-day compact split derived from the bundle's weekly template. */
export function weeklySplitStrip(slug: string): WeeklySplitDay[] {
  const bundle = getBundle(slug);
  const sessions = new Map<string, string>();
  bundle?.weeklyTemplate?.forEach((d) => sessions.set(d.day, d.sessionName));
  return WEEK_DAYS.map((day) => ({ day, label: sessions.get(day) ?? null }));
}

export type BundleInsideStats = {
  recipes: number;
  trainingDays: number;
  weeks: number;
  groceryItems: number;
  phases: number;
};

/** Truthful counts of what the bundle actually contains. */
export function bundleInsideStats(slug: string): BundleInsideStats {
  const bundle = getBundle(slug);
  if (!bundle) {
    return { recipes: 0, trainingDays: 0, weeks: 0, groceryItems: 0, phases: 0 };
  }
  return {
    recipes: bundle.recipes?.length ?? 0,
    trainingDays: bundle.weeklyTemplate?.length ?? bundle.sessionsPerWeek,
    weeks: bundle.weeks,
    groceryItems: bundle.groceryList?.reduce((n, c) => n + c.items.length, 0) ?? 0,
    phases: bundle.phases.length
  };
}
