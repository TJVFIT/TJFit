import { describe, expect, it } from "vitest";
import { normalizeQuizAnswers, buildTjaiUserProfile } from "@/lib/tjai-intake";

describe("questionnaire goal normalization", () => {
  it.each(["fat_loss", "muscle_gain", "recomposition", "fitness", "stay_active"] as const)(
    "preserves the canonical %s selection through repeated edits and profile construction",
    goal => {
      const first = normalizeQuizAnswers({ s2_goal: goal });
      const edited = normalizeQuizAnswers({ ...first, s1_age: 31 });
      const restored = normalizeQuizAnswers(edited);
      expect(first.s2_goal).toBe(goal);
      expect(edited.s2_goal).toBe(goal);
      expect(restored).toEqual(edited);
      expect(buildTjaiUserProfile(restored).goal).toBe(goal);
    }
  );

  it("normalizes a legacy stay-active answer once without turning it into fat loss on later edits", () => {
    const first = normalizeQuizAnswers({ s2_goal: "Stay active" });
    expect(first.s2_goal).toBe("stay_active");
    expect(first.s2_goal_detail).toBe("consistency");
    expect(normalizeQuizAnswers(first)).toEqual(first);
  });
});
