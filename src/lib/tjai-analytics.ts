import type { SupabaseClient } from "@supabase/supabase-js";
import { buildTjaiUserProfile } from "@/lib/tjai-intake";

function getAgeRange(age: number): string {
  if (age < 20) return "16-19";
  if (age < 25) return "20-24";
  if (age < 30) return "25-29";
  if (age < 35) return "30-34";
  if (age < 40) return "35-39";
  if (age < 50) return "40-49";
  return "50+";
}

function getWeightRange(kg: number): string {
  if (kg < 50) return "<50kg";
  if (kg < 60) return "50-59kg";
  if (kg < 70) return "60-69kg";
  if (kg < 80) return "70-79kg";
  if (kg < 90) return "80-89kg";
  if (kg < 100) return "90-99kg";
  if (kg < 120) return "100-119kg";
  return "120+kg";
}

export async function recordPlanGeneration(
  supabase: SupabaseClient,
  answers: Record<string, unknown>,
  generatedCalories: number,
  generatedProtein: number
) {
  try {
    const profile = buildTjaiUserProfile(answers);

    await supabase.from("tjai_plan_analytics").insert({
      goal: profile.goal,
      sex: profile.sex,
      age_range: profile.age > 0 ? getAgeRange(profile.age) : null,
      weight_range: profile.weightKg > 0 ? getWeightRange(profile.weightKg) : null,
      fitness_level: profile.experienceLevel,
      training_location: profile.trainingLocation,
      training_days: profile.trainingDays,
      dietary_restrictions: profile.dietaryRestrictions.filter((item) => item !== "none"),
      generated_calories: generatedCalories,
      generated_protein: generatedProtein
    });
  } catch (err) {
    // Non-critical: analytics failure should not break plan generation
    console.error("TJAI analytics record error:", err);
  }
}

export async function getSimilarUserInsight(
  supabase: SupabaseClient,
  answers: Record<string, unknown>
): Promise<string | null> {
  try {
    const profile = buildTjaiUserProfile(answers);

    const { data } = await supabase
      .from("tjai_plan_analytics")
      .select("generated_calories, generated_protein, outcome_weight_change")
      .eq("goal", profile.goal)
      .eq("sex", profile.sex)
      .eq("age_range", profile.age > 0 ? getAgeRange(profile.age) : "")
      .not("outcome_weight_change", "is", null)
      .limit(10);

    if (!data || data.length < 3) {
      // Task 9 — fallback: use rows even without outcome data — show calorie/protein averages
      const { data: fallbackData } = await supabase
        .from("tjai_plan_analytics")
        .select("generated_calories,generated_protein")
        .eq("goal", profile.goal)
        .eq("sex", profile.sex)
        .limit(20);

      if (!fallbackData || fallbackData.length < 3) return null;

      const avgCalories = Math.round(
        fallbackData.reduce((s, r) => s + Number(r.generated_calories ?? 0), 0) / fallbackData.length
      );
      const avgProtein = Math.round(
        fallbackData.reduce((s, r) => s + Number(r.generated_protein ?? 0), 0) / fallbackData.length
      );

      return `COMMUNITY BENCHMARK: Among ${fallbackData.length} similar users (${profile.sex}, ${getAgeRange(profile.age)}, goal: ${profile.goal}), average targets are ${avgCalories} kcal/day and ${avgProtein}g protein. Use as a calibration reference.`;
    }

    const avgCalories = Math.round(
      data.reduce((sum, r) => sum + Number(r.generated_calories ?? 0), 0) / data.length
    );
    const avgProtein = Math.round(
      data.reduce((sum, r) => sum + Number(r.generated_protein ?? 0), 0) / data.length
    );
    const avgOutcome = (
      data.reduce((sum, r) => sum + Number(r.outcome_weight_change ?? 0), 0) / data.length
    ).toFixed(2);

    return `LEARNING FROM PAST USERS (${data.length} similar users — ${profile.sex}, ${getAgeRange(profile.age)}, ${profile.experienceLevel}, goal: ${profile.goal}): average targets ${avgCalories} kcal/day, ${avgProtein}g protein/day, average weekly weight change ${avgOutcome}kg. Use as calibration reference.`;
  } catch {
    return null;
  }
}
