import { describe, it, expect } from "vitest";

import { detectMedicalRisk, medicalSafetyResponse } from "@/lib/tjai/guards/medical-safety";

const CATEGORIES = [
  "ed", "extreme_cut", "dosing", "injury_red_flag",
  "self_harm", "pregnancy", "reds", "rhabdo"
] as const;
const LOCALES = ["en", "tr", "ar", "es", "fr"] as const;

describe("detectMedicalRisk — production safety guard", () => {
  const cases: Array<[string, string]> = [
    ["I want to hurt myself", "self_harm"],
    ["I want to starve myself to lose weight", "ed"],
    ["what dose of testosterone should I take", "dosing"],
    ["my pee is dark brown after leg day", "rhabdo"],
    ["sharp pain in my knee when I squat", "injury_red_flag"],
    ["I'm 20 weeks pregnant, can I keep lifting?", "pregnancy"],
    ["I lost my period since I started cutting", "reds"],
    ["I want to lose 20 pounds in a week", "extreme_cut"]
  ];
  it.each(cases)("flags %j → correct category", (msg, expected) => {
    expect(detectMedicalRisk(msg)?.category).toBe(expected);
  });

  it("prioritises self-harm over a co-occurring ED match (crisis first)", () => {
    expect(detectMedicalRisk("I want to hurt myself and starve myself")?.category).toBe("self_harm");
  });

  it("does NOT flag normal fitness questions", () => {
    expect(detectMedicalRisk("how many sets for hypertrophy?")).toBeNull();
    expect(detectMedicalRisk("what should I eat after a workout?")).toBeNull();
    expect(detectMedicalRisk("")).toBeNull();
  });
});

describe("medicalSafetyResponse — crisis copy exists in every supported language", () => {
  for (const cat of CATEGORIES) {
    for (const loc of LOCALES) {
      it(`${cat} / ${loc} returns a real localized response`, () => {
        const r = medicalSafetyResponse(cat, loc);
        expect(typeof r).toBe("string");
        expect(r.trim().length).toBeGreaterThan(20);
      });
    }
  }

  it("falls back to English for an unsupported locale", () => {
    expect(medicalSafetyResponse("self_harm", "de")).toBe(medicalSafetyResponse("self_harm", "en"));
  });
});
