import { getCoachStructuredOutputContract } from "@/lib/tjai/coaching-output-contract";
import { coachChatIntentSystemAddendum, type CoachChatIntent } from "@/lib/tjai/orchestrator/chat-intent";
import { LANGUAGE_NAME_EN, type SupportedLocale } from "@/lib/i18n";
import { buildTjaiUserProfile } from "@/lib/tjai-intake";
import type { TjaiMemorySnapshot } from "@/lib/tjai-types";

export type ChatCoachPreferenceRow = { preference_key: string; preference_value: string };

export type ChatCoachWorkoutLog = {
  workout_date: string | null;
  exercise: string | null;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  duration_minutes: number | null;
};

export type ChatCoachProgressEntry = {
  entry_date: string | null;
  weight_kg: number | null;
  body_fat_percent: number | null;
  waist_cm: number | null;
};

export type ChatCoachPlanRow = {
  goal: string | null;
  daily_calories: number | null;
  protein_g: number | null;
  training_days_per_week: number | null;
  training_location: string | null;
  version_number: number | null;
  answers_json: Record<string, unknown> | null;
  plan_json: { summary?: Record<string, unknown> } | null;
};

function detectProgressiveOverload(logs: ChatCoachWorkoutLog[]): string {
  if (logs.length < 4) return "";

  const byExercise = new Map<string, Array<{ date: string; weight: number | null; reps: number | null }>>();
  for (const log of logs) {
    const key = (log.exercise ?? "").toLowerCase().trim();
    if (!key) continue;
    if (!byExercise.has(key)) byExercise.set(key, []);
    byExercise.get(key)!.push({
      date: log.workout_date ?? "",
      weight: log.weight_kg !== null ? Number(log.weight_kg) : null,
      reps: log.reps !== null ? Number(log.reps) : null
    });
  }

  const insights: string[] = [];
  for (const [exercise, sessions] of byExercise) {
    if (sessions.length < 2) continue;
    const withWeight = sessions.filter((s) => s.weight !== null);
    if (withWeight.length >= 2) {
      const first = withWeight[withWeight.length - 1].weight!;
      const latest = withWeight[0].weight!;
      if (latest > first) {
        insights.push(`${exercise}: progressed from ${first}kg to ${latest}kg ✓`);
      } else if (latest === first && withWeight.length >= 3) {
        insights.push(
          `${exercise}: weight stalled at ${latest}kg for ${withWeight.length} sessions — consider adding a set or a small weight increment`
        );
      }
    }
  }

  return insights.length > 0 ? `\nPROGRESSIVE OVERLOAD ANALYSIS:\n${insights.slice(0, 4).join("\n")}` : "";
}

export function buildChatCoachSystemPrompt(input: {
  planRow: ChatCoachPlanRow | null;
  memorySnapshot: TjaiMemorySnapshot;
  preferences: ChatCoachPreferenceRow[];
  workouts: ChatCoachWorkoutLog[];
  entries: ChatCoachProgressEntry[];
  /** Routed from the latest user message — adds a short coaching focus block. */
  coachIntent?: CoachChatIntent;
  /** Selected website locale — forces TJAI to respond in this language. */
  locale?: SupportedLocale;
}): string {
  const planSummary = (input.planRow?.plan_json?.summary ?? {}) as Record<string, unknown>;
  const preferencesLine =
    input.preferences.length > 0
      ? input.preferences.map((p) => `${p.preference_key}: ${p.preference_value}`).join("; ")
      : "No stored preferences yet.";

  const profileContext = input.planRow?.answers_json
    ? buildTjaiUserProfile(input.planRow.answers_json).dailyRoutine
    : "No normalized TJAI profile stored yet.";

  const planContext = input.planRow
    ? `USER'S TJAI PLAN:
- Goal: ${input.planRow.goal ?? "fat_loss"}
- Daily Calories: ${input.planRow.daily_calories ?? planSummary?.["daily_calories"] ?? "not set"}
- Protein Target: ${input.planRow.protein_g ?? planSummary?.["protein_g"] ?? "not set"}g
- Training Days: ${input.planRow.training_days_per_week ?? 4}/week
- Location: ${input.planRow.training_location ?? "gym"}${
        input.planRow.version_number && Number(input.planRow.version_number) > 1
          ? `\n- Plan version: ${input.planRow.version_number}`
          : ""
      }`
    : "User has not generated a TJAI plan yet.";

  const workouts = input.workouts;
  const entries = input.entries;

  const workoutSummary =
    workouts.length > 0
      ? workouts
          .slice(0, 10)
          .map((w) =>
            `${w.workout_date ?? "?"}: ${w.exercise ?? "unknown"}${w.sets ? ` ${w.sets}×${w.reps ?? "?"}` : ""}${
              w.weight_kg ? ` @ ${w.weight_kg}kg` : ""
            }${w.duration_minutes ? ` (${w.duration_minutes}min)` : ""}`
          )
          .join("\n")
      : "No workouts logged yet.";

  const weightTrend =
    entries.length >= 2
      ? (() => {
          const latest = Number(entries[0]?.weight_kg ?? 0);
          const oldest = Number(entries[entries.length - 1]?.weight_kg ?? 0);
          const diff = latest - oldest;
          return `${latest}kg (${diff > 0 ? "+" : ""}${diff.toFixed(1)}kg over last ${entries.length} entries)`;
        })()
      : entries[0]?.weight_kg
        ? `${entries[0].weight_kg}kg (only 1 data point)`
        : "No weight logged yet.";

  const latestBodyFat = entries[0]?.body_fat_percent ? `${entries[0].body_fat_percent}%` : "Not logged";
  const overloadContext = detectProgressiveOverload(workouts);

  const realDataContext = `
LIVE USER DATA (use this to give hyper-personalized advice):
Recent workouts (last 14 days):
${workoutSummary}

Body metrics trend:
- Current weight: ${weightTrend}
- Latest body fat: ${latestBodyFat}${entries[0]?.waist_cm ? `\n- Waist: ${entries[0].waist_cm}cm` : ""}${overloadContext}`;

  const languageName = input.locale ? LANGUAGE_NAME_EN[input.locale] : null;
  const languageDirective = languageName
    ? `CRITICAL LANGUAGE RULE: The user has selected ${languageName} as their site language. You MUST respond ONLY in ${languageName}, regardless of what language the user writes in. Translate exercise names, units, and coaching terminology naturally. Never mix languages in a single response.`
    : "You respond in the same language the user writes in.";

  const core = `You are TJAI — TJFit's elite AI fitness and nutrition coach. You are warm, precise, and data-driven.
You ALWAYS answer fitness, nutrition, training, and health questions.
${languageDirective}

${planContext}

${realDataContext}

USER PREFERENCES:
${preferencesLine}

TJAI MEMORY SNAPSHOT:
- Latest plan summary: ${input.memorySnapshot.latestPlanSummary ?? "none"}
- Prior plan goal: ${input.memorySnapshot.priorPlanGoal ?? "none"}
- Adaptive checkpoint: ${
    input.memorySnapshot.adaptiveCheckpoint
      ? `${input.memorySnapshot.adaptiveCheckpoint.urgency} urgency; trigger regen ${input.memorySnapshot.adaptiveCheckpoint.triggerRegen}`
      : "none"
  }
- Stored profile routine: ${profileContext}

TJFIT PROGRAMS YOU CAN RECOMMEND:
- Gym Fat Loss Protocol (12 weeks, gym, fat loss)
- Gym Mass Builder (12 weeks, gym, muscle gain)
- Hypertrophy System (12 weeks, gym, advanced)
- Home Fat Burn Accelerator (12 weeks, home, fat loss)
- Home Fat Loss Starter (4 weeks, home, free, beginner)
- Gym Muscle Starter (4 weeks, gym, free, beginner)

COACHING RULES:
- Reference the user's ACTUAL logged workouts and weight when giving advice. Be specific — name the exercises they logged, the weights they used.
- If their weight trend doesn't match their plan's projections, acknowledge it and diagnose why.
- For injury or medical topics: include a short safety disclaimer and recommend a qualified professional when needed.
- Never fabricate workout data. If no data exists, say so and encourage logging.
- Keep responses concise (under 280 words) unless a detailed breakdown is needed.
- Close with the action format defined in the OUTPUT FORMAT CONTRACT (one concrete move, grounded in their data).`;

  const intent = input.coachIntent ?? "general_qa";
  return core + coachChatIntentSystemAddendum(intent) + getCoachStructuredOutputContract();
}
