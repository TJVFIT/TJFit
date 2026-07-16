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
  | "support_refund"
  | "fasting_religious"
  | "missed_workout_rescue"
  | "form_check"
  | "plan_explanation";

export function routeCoachChatIntent(message: string): CoachChatIntent {
  const m = message.toLowerCase();

  // Support/refund/billing routing takes priority — coaching does not solve it.
  if (/\b(refund|cancel|billing|charged|payment|invoice|subscription|unsubscribe|support team|contact support)\b/.test(m)) {
    return "support_refund";
  }

  if (
    /\b(injury|injured|hurt|hurts|pain|painful|sprain|strain|tendon|ligament|rehab|recovery|contraindicat|imping|sciatica|swollen|numb)\b/.test(
      m
    )
  ) {
    return "injury_recovery";
  }

  // Fasting/religious scheduling before generic nutrition so Ramadan etc. get the right addendum.
  if (/\b(ramadan|fasting|fast|suhoor|sehri|iftar|halal|eid|lent)\b/.test(m)) {
    return "fasting_religious";
  }

  if (/\b(missed|skipped|fell off|haven'?t trained|stopped working out|got back|restart|behind on)\b/.test(m)) {
    return "missed_workout_rescue";
  }

  if (
    /\b(form check|check my form|my form|proper form|good form|bad form|technique|bar path|knee cave|butt wink|elbow flare|hips? (rise|rising|shoot)|am i doing (it|this|these) (right|correctly|wrong))\b/.test(
      m
    )
  ) {
    return "form_check";
  }

  if (/\b(weight trend|plateau|progress|stalled|not losing|not gaining|body fat %|waist|logged)\b/.test(m)) {
    return "progress_analysis";
  }

  if (
    /\b(why|explain|reasoning|rationale|what does|how come|walk me through|break down)\b[^.?!]*\b(my |the )?plan\b|\bplan\b[^.?!]*\b(why|explain|mean|means|reasoning|rationale)\b/.test(
      m
    )
  ) {
    return "plan_explanation";
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
      return "\n\nFOCUS MODE — TRAINING: Prioritize split design, exercise selection, volume, intensity, and recovery. Stay practical and progressive.\nSTYLE: Give the prescription first, then a one-line rationale — no theory lectures.";
    case "diet_nutrition":
      return "\n\nFOCUS MODE — NUTRITION: Prioritize sustainable meals, macro balance, and adherence. No medical diagnosis or extreme restriction.\nSTYLE: Anchor every recommendation to the user's calorie and protein targets with concrete gram/food examples.";
    case "injury_recovery":
      return "\n\nFOCUS MODE — SAFETY: Be conservative with load and volume. Never diagnose. For sharp pain, numbness, major swelling, or acute trauma, urge prompt in-person medical evaluation.\nSTYLE: Lay out a cautious step-by-step return path (what to stop, what to substitute, when to progress) and close with the safety note.";
    case "progress_analysis":
      return "\n\nFOCUS MODE — DATA: Ground conclusions in logged workouts and metrics provided. If data is thin, say so and suggest what to log next.\nSTYLE: Diagnose first from their numbers, then prescribe one specific adjustment — diagnosis before prescription, always.";
    case "motivation_accountability":
      return "\n\nFOCUS MODE — COACHING: Warm, direct tone. Emphasize small wins, consistency systems, and realistic expectations — no shame language.\nSTYLE: Keep it short and human — one insight, one small commitment, no bullet walls.";
    case "support_refund":
      return "\n\nFOCUS MODE — SUPPORT: This is a billing/account/support request, not a coaching problem. Do not pretend coaching solves it. Briefly acknowledge, then direct them to TJFit support (the contact/support page) for refunds, cancellations, or payment issues.\nSTYLE: Two or three sentences maximum — acknowledge, point to /support, done.";
    case "fasting_religious":
      return "\n\nFOCUS MODE — FASTING/RELIGIOUS: Adjust session timing, intensity, hydration, and protein distribution around the user's fasting windows (e.g. iftar/suhoor). Respect the practice — never advise breaking a religious fast. Keep meals halal/compliant where indicated.\nSTYLE: Organize advice around the user's fasting timeline (pre-fast, during, post-fast) so it is immediately actionable.";
    case "missed_workout_rescue":
      return "\n\nFOCUS MODE — RESCUE: The user fell behind. No shame or punishment. Resume at the next planned session or offer a short restart session, and reduce friction with one tiny next action.\nSTYLE: Brief and forward-looking — skip the autopsy, give the single next session to do.";
    case "form_check":
      return "\n\nFOCUS MODE — FORM: The user is asking about exercise technique. Break the movement into numbered step-by-step cues (setup, execution, common faults), keep each cue one short line, and end with a one-line safety note on when to lower the load or stop.\nSTYLE: Numbered cues, one action per line — coach the movement, not the theory.";
    case "plan_explanation":
      return "\n\nFOCUS MODE — PLAN EXPLANATION: The user wants to understand their TJAI plan. Explain the reasoning behind the specific numbers in THEIR plan (calories, protein, training days, exercise choices) using their stored data — never generic textbook rationale.\nSTYLE: Walk through it section by section, citing their actual plan values, and finish by inviting follow-up questions on any part.";
    default:
      return "\n\nSTYLE: Answer the question directly in the first sentence, then add only the context needed.";
  }
}

/**
 * Deterministic per-intent token budget for the streamed chat reply.
 * Depth-heavy intents (form breakdowns, injury protocols, plan walkthroughs)
 * get more room; quick answers and motivation nudges stay tight.
 */
export function coachIntentMaxTokens(intent: CoachChatIntent, message: string): number {
  if (intent === "form_check" || intent === "injury_recovery" || intent === "plan_explanation") return 950;
  if (intent === "motivation_accountability") return 500;
  if (intent === "general_qa" && message.trim().split(/\s+/).filter(Boolean).length <= 12) return 500;
  return 700;
}
