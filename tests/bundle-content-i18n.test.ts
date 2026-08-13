/**
 * WP-CONTENT-01 pilot. Pins the overlay contract for the fat-loss bundle +
 * the 9 shared recipes across tr/ar/es/fr: structural parity with EN, no
 * English-clone leaves on translated fields, English fallback for
 * untranslated bundles, and length-guarded positional merge.
 */

import { describe, it, expect } from "vitest";

import { getBundle } from "@/lib/bundles";
import {
  localizeBundleContent,
  __CONTENT_I18N_INTERNALS
} from "@/lib/bundle-content-i18n";

const NON_EN = ["tr", "ar", "es", "fr"] as const;
const { RECIPE_I18N } = __CONTENT_I18N_INTERNALS;

// Strings allowed to equal their English source (numbers, brand/loanwords,
// RPE cues, exercise names kept in English on purpose).
function isAllowedClone(value: string): boolean {
  if (/^[\d\s.,%×/+-]*$/.test(value)) return true; // pure numeric/symbol
  if (/RPE|Zone 2|whey|World's greatest|couch stretch|face pull|hip thrust/i.test(value)) return true;
  return value.length <= 3;
}

describe("localizeBundleContent — fat-loss pilot", () => {
  const rawEn = getBundle("fat-loss")!;

  it("returns the English bundle unchanged for locale en", () => {
    expect(localizeBundleContent(rawEn, "en")).toEqual(rawEn);
  });

  it("preserves structural shape in every non-English locale", () => {
    for (const loc of NON_EN) {
      const b = localizeBundleContent(rawEn, loc);
      expect(b.weeklyTemplate?.length).toBe(rawEn.weeklyTemplate?.length);
      expect(b.progression?.length).toBe(rawEn.progression?.length);
      expect(b.recipes?.length).toBe(rawEn.recipes?.length);
      expect(b.groceryList?.length).toBe(rawEn.groceryList?.length);
      expect(b.faq?.length).toBe(rawEn.faq?.length);
      expect(b.whoFor?.length).toBe(rawEn.whoFor?.length);
      // Exercise counts per day must line up (positional merge integrity).
      rawEn.weeklyTemplate?.forEach((day, i) => {
        expect(b.weeklyTemplate?.[i].exercises.length).toBe(day.exercises.length);
      });
      // Grocery item counts per category line up.
      rawEn.groceryList?.forEach((cat, i) => {
        expect(b.groceryList?.[i].items.length).toBe(cat.items.length);
      });
    }
  });

  it("actually translates the user-facing prose (no EN clones on session focus / faq / grocery categories)", () => {
    for (const loc of NON_EN) {
      const b = localizeBundleContent(rawEn, loc);
      b.weeklyTemplate?.forEach((day, i) => {
        const enDay = rawEn.weeklyTemplate![i];
        expect(day.focus === enDay.focus && !isAllowedClone(day.focus)).toBe(false);
      });
      b.faq?.forEach((f, i) => {
        const enF = rawEn.faq![i];
        expect(f.q === enF.q && !isAllowedClone(f.q)).toBe(false);
        expect(f.a === enF.a && !isAllowedClone(f.a)).toBe(false);
      });
      b.groceryList?.forEach((cat, i) => {
        const enCat = rawEn.groceryList![i];
        expect(cat.category === enCat.category && !isAllowedClone(cat.category)).toBe(false);
      });
    }
  });

  it("translates the 9 shared recipes with matching ingredient/step counts", () => {
    for (const loc of NON_EN) {
      const b = localizeBundleContent(rawEn, loc);
      b.recipes?.forEach((recipe, i) => {
        const enRecipe = rawEn.recipes![i];
        const override = RECIPE_I18N[loc][enRecipe.name];
        expect(override, `recipe "${enRecipe.name}" missing in ${loc}`).toBeDefined();
        expect(recipe.name).toBe(override!.name);
        expect(recipe.name).not.toBe(enRecipe.name);
        expect(recipe.ingredients.length).toBe(enRecipe.ingredients.length);
        expect(recipe.steps.length).toBe(enRecipe.steps.length);
        // Macros are never translated.
        expect(recipe.kcal).toBe(enRecipe.kcal);
        expect(recipe.protein).toBe(enRecipe.protein);
      });
    }
  });

  it("localizes warmup/cooldown/equipment shared lines", () => {
    const b = localizeBundleContent(rawEn, "tr");
    // Every warmup line must differ from EN (all are in SHARED_LINES.tr).
    rawEn.warmup?.forEach((line, i) => {
      expect(b.warmup?.[i]).not.toBe(line);
    });
    rawEn.equipment?.forEach((line, i) => {
      expect(b.equipment?.[i]).not.toBe(line);
    });
  });

  it("falls back to English for a bundle with no overlay (lean-bulk structural)", () => {
    const leanBulk = getBundle("lean-bulk")!;
    const b = localizeBundleContent(leanBulk, "tr");
    // No fat-loss-style overlay exists for lean-bulk yet → weeklyTemplate stays EN.
    expect(b.weeklyTemplate?.[0].sessionName).toBe(leanBulk.weeklyTemplate?.[0].sessionName);
    // But shared recipes/equipment still localize (layers 1+2 are bundle-agnostic).
    const enEquip = leanBulk.equipment ?? [];
    if (enEquip.length) {
      const localizedSome = b.equipment?.some((line, i) => line !== enEquip[i]);
      expect(localizedSome).toBe(true);
    }
  });

  it("is pure — does not mutate the source bundle", () => {
    const before = JSON.stringify(rawEn);
    localizeBundleContent(rawEn, "ar");
    expect(JSON.stringify(rawEn)).toBe(before);
  });
});
