import { Coach, Goal } from "@/lib/content";

export type CoachMatchInput = {
  goal: Goal;
  experienceLevel: string;
  language: string;
  budget: number;
  trainingLocation: string;
};

export type CoachMatchResult = Coach & {
  score: number;
  reasons: string[];
};

export function rankCoaches(coaches: Coach[], input: CoachMatchInput): CoachMatchResult[] {
  return coaches
    .map((coach) => {
      let score = 0;
      const reasons: string[] = [];

      if (coach.goals.includes(input.goal)) {
        score += 30;
        reasons.push("Matches your goal");
      }

      if (coach.experienceLevels.includes(input.experienceLevel)) {
        score += 12;
        reasons.push("Fits your experience level");
      }

      if (coach.languages.includes(input.language)) {
        score += 16;
        reasons.push("Speaks your language");
      }

      if (coach.trainingLocations.includes(input.trainingLocation)) {
        score += 10;
        reasons.push("Works with your training location");
      }

      if (coach.price <= input.budget) {
        score += 10;
        reasons.push("Fits your budget");
      } else {
        const overspend = coach.price - input.budget;
        score -= Math.min(overspend / 40, 10);
      }

      score += coach.rating * 4;
      score += coach.successRate * 0.18;
      score += coach.availabilityScore * 0.12;

      return {
        ...coach,
        score: Math.round(score),
        reasons: reasons.slice(0, 3)
      };
    })
    .sort((a, b) => b.score - a.score);
}
