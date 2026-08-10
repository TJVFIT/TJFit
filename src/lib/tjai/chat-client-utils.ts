/** Client-only helpers for TJAI chat UX (no server import). */

/** Loose multilingual topic hints used to pick context-aware suggestion chips. */
export const COACH_NUTRITION_HINT_RE =
  /protein|prot[eé]in|prote[íi]na|meal|kcal|calorie|calor[íi]a|carb|macro|öğün|kalori|yemek|بروتين|وجبة|سعرة|repas/i;
export const COACH_TRAINING_HINT_RE =
  /workout|training|\bsets?\b|\breps?\b|exercise|deload|antrenman|egzersiz|تمرين|تدريب|entrenamiento|ejercicio|entra[îi]nement|s[eé]ance/i;

export const COACH_FOLLOW_UP_PROMPTS = {
  simplify: "Please answer in fewer bullet points and shorter sentences.",
  deeper: "Give me a more detailed breakdown with concrete examples.",
  nextStep: "What is the single most important action I should take this week?",
  protein: "Help me hit my protein target with simple food swaps while staying close to my calorie plan.",
  timeCrunch: "I only have 35 minutes today. Give me a minimal effective session that still matches my goal.",
  deload: "I feel beat up this week. Suggest a deload or recovery week structure without losing momentum."
} as const;
