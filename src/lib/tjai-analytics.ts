import type { SupabaseClient } from "@supabase/supabase-js";

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
    const age = Number(answers.s1_age ?? 0);
    const weight = Number(answers.s1_weight ?? 0);
    const restrictions = Array.isArray(answers.s13_allergies)
      ? (answers.s13_allergies as string[])
      : [];

    await supabase.from("tjai_plan_analytics").insert({
      goal: String(answers.s2_goal ?? ""),
      sex: String(answers.s1_gender ?? ""),
      age_range: age > 0 ? getAgeRange(age) : null,
      weight_range: weight > 0 ? getWeightRange(weight) : null,
      fitness_level: String(answers.s5_trains ?? ""),
      training_location: String(answers.s5_type ?? ""),
      training_days: (() => {
        const d = String(answers.s5_days ?? "");
        if (d.startsWith("1")) return 2;
        if (d.startsWith("3")) return 4;
        if (d.startsWith("4")) return 5;
        if (d.startsWith("5")) return 6;
        return 3;
      })(),
      dietary_restrictions: restrictions.length > 0 ? restrictions : null,
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
    const age = Number(answers.s1_age ?? 0);
    const goal = String(answers.s2_goal ?? "");
    const sex = String(answers.s1_gender ?? "");
    const fitnessLevel = String(answers.s5_trains ?? "");

    const { data } = await supabase
      .from("tjai_plan_analytics")
      .select("generated_calories, generated_protein, outcome_weight_change")
      .eq("goal", goal)
      .eq("sex", sex)
      .eq("age_range", age > 0 ? getAgeRange(age) : "")
      .not("outcome_weight_change", "is", null)
      .limit(10);

    if (!data || data.length < 3) return null;

    const avgCalories = Math.round(
      data.reduce((sum, r) => sum + Number(r.generated_calories ?? 0), 0) / data.length
    );
    const avgProtein = Math.round(
      data.reduce((sum, r) => sum + Number(r.generated_protein ?? 0), 0) / data.length
    );

    return `LEARNING FROM PAST USERS: Similar users (${sex}, ${getAgeRange(age)}, ${fitnessLevel}, goal: ${goal}) achieved best results at approximately ${avgCalories} kcal/day and ${avgProtein}g protein/day. Use this as a data point when setting calorie and protein targets.`;
  } catch {
    return null;
  }
}
