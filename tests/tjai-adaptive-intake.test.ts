/**
 * Adaptive intake follow-ups: cardio preference + plant protein sources.
 *
 * These two questions only earn their place if the answers actually reach the
 * plan. So these tests pin the full chain: quiz answer -> normalizeQuizAnswers
 * -> TjaiUserProfile -> buildTJAIUserPrompt, plus the stale-branch rule (an
 * answer left over from an edited quiz run must not leak into the profile)
 * and the step-localization fallback added alongside them.
 */

import { describe, it, expect } from "vitest";

import { buildTjaiUserProfile, normalizeQuizAnswers } from "@/lib/tjai-intake";
import { getTjaiSteps } from "@/lib/tjai-copy";

/** Minimal complete answer set — the intake fills defaults for the rest. */
function baseAnswers(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    s1_gender: "male",
    s1_age: 30,
    s1_height: 180,
    s1_weight: 85,
    s2_goal: "fat_loss",
    ...overrides
  };
}

describe("cardio preference intake", () => {
  it("flows from raw answer to profile", () => {
    const profile = buildTjaiUserProfile(
      baseAnswers({ s6_cardio_preference: ["walking", "cycling"] })
    );
    expect(profile.cardioPreferences).toEqual(["walking", "cycling"]);
  });

  it("drops unknown values instead of passing junk to the prompt", () => {
    const profile = buildTjaiUserProfile(
      baseAnswers({ s6_cardio_preference: ["walking", "parkour", "<script>"] })
    );
    expect(profile.cardioPreferences).toEqual(["walking"]);
  });

  it("is absent when unanswered — legacy submissions stay valid", () => {
    const profile = buildTjaiUserProfile(baseAnswers());
    expect(profile.cardioPreferences).toBeUndefined();
  });

  it("survives normalizeQuizAnswers round-trip (generate route path)", () => {
    const normalized = normalizeQuizAnswers(
      baseAnswers({ s6_cardio_preference: ["swimming", "none"] })
    );
    expect(normalized.s6_cardio_preference).toEqual(["swimming", "none"]);
  });
});

describe("plant protein intake", () => {
  it("attaches for a vegan profile", () => {
    const profile = buildTjaiUserProfile(
      baseAnswers({ s12_diet_style: "vegan", s12_plant_protein: ["tofu_tempeh", "legumes"] })
    );
    expect(profile.dietStyle).toBe("vegan");
    expect(profile.plantProteinSources).toEqual(["tofu_tempeh", "legumes"]);
  });

  it("stale-branch rule: dropped when the diet style is no longer plant-based", () => {
    // User answered the vegan follow-up, went back, switched to balanced.
    // The follow-up answer is stale and must not reach the profile.
    const profile = buildTjaiUserProfile(
      baseAnswers({ s12_diet_style: "balanced", s12_plant_protein: ["seitan"] })
    );
    expect(profile.plantProteinSources).toBeUndefined();
  });
});

describe("quiz step definitions", () => {
  const steps = getTjaiSteps("en");

  it("gates the cardio question on goal or training preference", () => {
    const cardio = steps.find((s) => s.id === "s6_cardio_preference");
    expect(cardio).toBeDefined();
    expect(cardio!.showIf?.mode).toBe("any");
    const gatedSteps = new Set(cardio!.showIf!.conditions.map((c) => c.stepId));
    expect(gatedSteps).toEqual(new Set(["s2_goal", "s5_training_preference"]));
  });

  it("gates the plant-protein question on vegetarian/vegan only", () => {
    const plant = steps.find((s) => s.id === "s12_plant_protein");
    expect(plant).toBeDefined();
    expect(plant!.showIf!.conditions.map((c) => c.value)).toEqual(["vegetarian", "vegan"]);
  });

  it("keeps option values aligned with what the intake accepts", () => {
    // If a quiz option and the intake allowlist drift apart, the user's answer
    // silently vanishes in normalizeMulti. Pin them together.
    const cardio = steps.find((s) => s.id === "s6_cardio_preference")!;
    const values = cardio.options!.map((o) => o.value);
    const profile = buildTjaiUserProfile(baseAnswers({ s6_cardio_preference: values }));
    expect(profile.cardioPreferences).toHaveLength(values.length);
  });
});

describe("step localization overrides", () => {
  it("serves the Turkish question with real diacritics", () => {
    const tr = getTjaiSteps("tr").find((s) => s.id === "s6_cardio_preference")!;
    expect(tr.question).toContain("türlerini gerçekten");
    // Option labels come from the override map, keyed by value.
    const walking = tr.options!.find((o) => o.value === "walking")!;
    expect(walking.label).toContain("Yürüyüş");
  });

  it("English flows through the no-override fallback path unchanged", () => {
    // en has no STEP_I18N entry, so this exercises the `overrides?.[id]`
    // undefined branch. (All five locales now ship overrides, so English
    // itself is the remaining fallback surface.)
    const en = getTjaiSteps("en").find((s) => s.id === "s6_cardio_preference")!;
    expect(en.question).toBe("Which kinds of cardio would you actually do?");
  });

  it("never changes option VALUES, only labels", () => {
    const en = getTjaiSteps("en").find((s) => s.id === "s12_plant_protein")!;
    const tr = getTjaiSteps("tr").find((s) => s.id === "s12_plant_protein")!;
    expect(tr.options!.map((o) => o.value)).toEqual(en.options!.map((o) => o.value));
  });

  it("localizes Turkish section titles with correct diacritics", () => {
    const sections = new Set(getTjaiSteps("tr").map((s) => s.section));
    expect(sections).toContain("Vücut Ölçüleri");
    expect(sections).toContain("Yaşam Tarzı");
    expect(sections).not.toContain("Vucut Olculeri");
  });
});

// Full quiz coverage per locale. tr was owner-approved 2026-08-09; ar/es/fr
// were translated from the English base and independently native-reviewed
// (all flagged issues fixed before integration, 2026-08-09).
const QUIZ_COVERAGE: Array<
  [
    "tr" | "ar" | "es" | "fr",
    {
      // Labels allowed to be byte-identical to English: numeric ranges are
      // exempted globally; these are brand/loanwords and country names.
      legitimatelySame: string[];
      // The locale's writing must actually appear (aggregate check).
      script: RegExp;
      // Locale-specific regression pattern (tr: ASCII-folded words).
      forbidden?: RegExp;
    }
  ]
> = [
  [
    "tr",
    {
      legitimatelySame: ["Omega-3", "Pre-workout", "Vegan", "Seitan", "Tofu / tempeh"],
      script: /[ğşçöüİı]/,
      forbidden:
        /\b(icin|gercek|ucretsiz|olusturun|antrenor|calisma|gunluk|haftalik|baslangic|vucut|agirlik|guclu|dusuk|kucuk|buyuk|yuksek|olcum|secim|sadece vucut)\b/i
    }
  ],
  ["ar", { legitimatelySame: [], script: /[؀-ۿ]/ }],
  [
    "es",
    {
      legitimatelySame: ["Omega-3", "Pre-workout", "Vegan", "Halal", "Seitan", "Tofu / tempeh"],
      script: /[áéíóúñ¿]/
    }
  ],
  [
    "fr",
    {
      legitimatelySame: ["Pre-workout", "Vegan", "Halal", "Seitan", "Tofu / tempeh"],
      script: /[àâçéèêô]/
    }
  ]
];

describe.each(QUIZ_COVERAGE)("full quiz coverage: %s", (locale, cfg) => {
  const en = getTjaiSteps("en");
  const localized = getTjaiSteps(locale);
  const byId = new Map(localized.map((s) => [s.id, s]));

  it(`translates every base question — a new EN step without ${locale} must fail here`, () => {
    const untranslated = en.filter((s) => byId.get(s.id)!.question === s.question);
    expect(
      untranslated.map((s) => s.id),
      `These steps render in English for ${locale} users — add STEP_I18N.${locale} entries`
    ).toEqual([]);
  });

  it("translates every option label on every step", () => {
    const legitimatelySame = new Set(cfg.legitimatelySame);
    const missing: string[] = [];
    for (const enStep of en) {
      if (!enStep.options) continue;
      const locStep = byId.get(enStep.id)!;
      // Country exonyms legitimately collide with English per locale (es
      // "Chile", fr "Canada"), so s20_country is checked at list level: the
      // list as a whole must be localized. A lazy full English fallback
      // still fails; individual matching exonyms pass.
      if (enStep.id === "s20_country") {
        const translated = enStep.options.filter(
          (o, i) => locStep.options![i]!.label !== o.label
        ).length;
        expect(
          translated / enStep.options.length,
          `${locale} country list is mostly English`
        ).toBeGreaterThan(0.5);
        continue;
      }
      for (let i = 0; i < enStep.options.length; i++) {
        const enOpt = enStep.options[i]!;
        const locOpt = locStep.options![i]!;
        const numericLabel = /^[\d\s–—\-+.,]+(kg|cm)?$/u.test(enOpt.label);
        if (locOpt.label === enOpt.label && !numericLabel && !legitimatelySame.has(locOpt.label)) {
          missing.push(`${enStep.id}:${String(enOpt.value)}`);
        }
      }
    }
    expect(missing, `Option labels still in English for ${locale}`).toEqual([]);
  });

  it("never changes option values, only labels", () => {
    for (const enStep of en) {
      if (!enStep.options) continue;
      expect(
        byId.get(enStep.id)!.options!.map((o) => o.value),
        enStep.id
      ).toEqual(enStep.options.map((o) => o.value));
    }
  });

  it("is written in its own script and free of locale-specific regressions", () => {
    const offenders: string[] = [];
    let scriptSeen = false;
    for (const step of localized) {
      const texts = [step.question, step.sub ?? "", step.placeholder ?? "", ...(step.options ?? []).map((o) => o.label)];
      for (const t of texts) {
        if (cfg.script.test(t)) scriptSeen = true;
        if (cfg.forbidden?.test(t)) offenders.push(`${step.id}: ${t.slice(0, 50)}`);
      }
    }
    expect(scriptSeen, `${locale} quiz copy never uses its own script`).toBe(true);
    expect(offenders).toEqual([]);
  });
});
