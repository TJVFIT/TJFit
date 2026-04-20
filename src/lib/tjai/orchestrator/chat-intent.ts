/**
 * Lightweight chat orchestration: map the latest user message to a coaching focus.
 * Keyword-based (deterministic, fast, safe) — swap for a small classifier model later if needed.
 */

export type CoachChatIntent =
  | "general_qa"
  | "program_training"
  | "diet_nutrition"
  | "injury_recovery"
  | "progress_analysis"
  | "motivation_accountability";

export function routeCoachChatIntent(message: string): CoachChatIntent {
  const m = message.toLowerCase();

  if (
    /\b(injury|injured|hurt|hurts|pain|painful|sprain|strain|tendon|ligament|rehab|recovery|contraindicat|imping|sciatica|swollen|numb)\b/.test(
      m
    )
  ) {
    return "injury_recovery";
  }

  if (/\b(weight trend|plateau|progress|stalled|not losing|not gaining|body fat %|waist|logged)\b/.test(m)) {
    return "progress_analysis";
  }

  if (/\b(motivat|accountab|habit|discipline|burnout|lazy|consisten|streak|mental|stress eating)\b/.test(m)) {
    return "motivation_accountability";
  }

  if (
    /\b(meal|meals|diet|nutrition|macro|macros|calorie|calories|protein|carb|carbs|fat intake|hunger|fast|ramadan|refeed|cheat meal)\b/.test(
      m
    )
  ) {
    return "diet_nutrition";
  }

  if (
    /\b(workout|training|split|exercise|lift|lifting|reps|sets|hypertrophy|strength|program|rpe|volume|deload|pr|pb)\b/.test(
      m
    )
  ) {
    return "program_training";
  }

  return "general_qa";
}

export function coachChatIntentSystemAddendum(intent: CoachChatIntent): string {
  switch (intent) {
    case "program_training":
      return "\n\nFOCUS MODE — TRAINING: Prioritize split design, exercise selection, volume, intensity, and recovery. Stay practical and progressive.";
    case "diet_nutrition":
      return "\n\nFOCUS MODE — NUTRITION: Prioritize sustainable meals, macro balance, and adherence. No medical diagnosis or extreme restriction.";
    case "injury_recovery":
      return "\n\nFOCUS MODE — SAFETY: Be conservative with load and volume. Never diagnose. For sharp pain, numbness, major swelling, or acute trauma, urge prompt in-person medical evaluation.";
    case "progress_analysis":
      return "\n\nFOCUS MODE — DATA: Ground conclusions in logged workouts and metrics provided. If data is thin, say so and suggest what to log next.";
    case "motivation_accountability":
      return "\n\nFOCUS MODE — COACHING: Warm, direct tone. Emphasize small wins, consistency systems, and realistic expectations — no shame language.";
    default:
      return "";
  }
}
