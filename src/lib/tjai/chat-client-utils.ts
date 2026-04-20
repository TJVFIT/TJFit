/** Client-only helpers for TJAI chat UX (no server import). */

export function getCoachThinkingDelayMs(): number {
  if (typeof window === "undefined") return 0;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  return 360;
}

export const COACH_FOLLOW_UP_PROMPTS = {
  simplify: "Please answer in fewer bullet points and shorter sentences.",
  deeper: "Give me a more detailed breakdown with concrete examples.",
  nextStep: "What is the single most important action I should take this week?",
  protein: "Help me hit my protein target with simple food swaps while staying close to my calorie plan.",
  timeCrunch: "I only have 35 minutes today. Give me a minimal effective session that still matches my goal.",
  deload: "I feel beat up this week. Suggest a deload or recovery week structure without losing momentum."
} as const;
