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
  | "motivation_accountability"
  | "form_check"
  | "readiness_recovery";

export function routeCoachChatIntent(message: string): CoachChatIntent {
  const m = message.toLowerCase();

  if (/\b(form check|check my form|video|clip|photo|picture|depth|tucked|bar path|knees cave|butt wink)\b/.test(m)) {
    return "form_check";
  }

  if (
    /\b(injury|injured|hurt|hurts|pain|painful|sprain|strain|tendon|ligament|rehab|contraindicat|imping|sciatica|swollen|numb)\b/.test(
      m
    )
  ) {
    return "injury_recovery";
  }

  if (
    /\b(readiness|recovery|deload|overtrain|hrv|resting heart rate|rhr|tired|burnt out|burnout|soreness|sore|exhaust|sleep debt|no energy|zapped)\b/.test(
      m
    )
  ) {
    return "readiness_recovery";
  }

  if (/\b(weight trend|plateau|progress|stalled|not losing|not gaining|body fat %|waist|logged)\b/.test(m)) {
    return "progress_analysis";
  }

  if (/\b(motivat|accountab|habit|discipline|lazy|consisten|streak|mental|stress eating)\b/.test(m)) {
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
    /\b(workout|training|split|exercise|lift|lifting|reps|sets|hypertrophy|strength|program|rpe|rir|volume|pr|pb)\b/.test(
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
      return "\n\nFOCUS MODE — TRAINING: Prescribe in weekly sets (MEV→MAV) and RPE/RIR. Pick top-SFR exercises for the user's equipment. Stay practical and progressive.";
    case "diet_nutrition":
      return "\n\nFOCUS MODE — NUTRITION: Prioritise the protein floor (g/kg), a sensible calorie target, and adherence. No extreme restriction. No moralising about food.";
    case "injury_recovery":
      return "\n\nFOCUS MODE — SAFETY: Be conservative with load and volume. Never diagnose. Substitute down the SFR list. For sharp pain, numbness, major swelling, or acute trauma, urge prompt in-person medical evaluation.";
    case "progress_analysis":
      return "\n\nFOCUS MODE — DATA: Ground conclusions in logged workouts and metrics. If data is thin, say so and suggest the 1–2 datapoints that would unlock a better answer.";
    case "motivation_accountability":
      return "\n\nFOCUS MODE — BEHAVIOUR: Motivational Interviewing voice. Reflect first, ask one targeted question, then propose the smallest next action that fits their life this week. No shame language.";
    case "form_check":
      return "\n\nFOCUS MODE — FORM CHECK: If a photo/video is present, describe what you can literally see (camera angle, bar path, joint alignment) — do not invent details. If no media is provided, ask for one short clip at a standard angle and give 3 self-check cues they can film. Always add the caveat that remote form review is not a substitute for an in-person coach if something looks painful.";
    case "readiness_recovery":
      return "\n\nFOCUS MODE — READINESS: Walk the user through the deload-trigger checklist (sleep, RHR, HRV, reps-at-load, RPE drift, joint pain). If 2+ are positive, prescribe a deload week (sets -40%, load -10–20%, RPE cap 7). If fewer, keep training and name what to watch for this week.";
    default:
      return "";
  }
}
