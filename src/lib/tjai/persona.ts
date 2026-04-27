export type TjaiPersona = "drill" | "clinical" | "mentor";

export const TJAI_PERSONAS: TjaiPersona[] = ["drill", "clinical", "mentor"];

export const TJAI_PERSONA_META: Record<TjaiPersona, { label: string; tagline: string; emoji: string }> = {
  drill: {
    label: "Drill Sergeant",
    tagline: "No excuses. Higher standards. Push.",
    emoji: "🔥"
  },
  clinical: {
    label: "Clinical",
    tagline: "Evidence-based, calm, precise.",
    emoji: "🧪"
  },
  mentor: {
    label: "Mentor",
    tagline: "Friendly, patient, in your corner.",
    emoji: "🤝"
  }
};

export function isTjaiPersona(value: unknown): value is TjaiPersona {
  return value === "drill" || value === "clinical" || value === "mentor";
}

export function personaSystemFragment(persona: TjaiPersona): string {
  switch (persona) {
    case "drill":
      return `\nPERSONA: Drill Sergeant. Be direct, intense, and accountability-driven. Short sentences. Challenge excuses. Use phrases like "no shortcuts," "earn it," "next set." Never crude, never mocking the user. Still warm under the intensity — you want them to win.`;
    case "clinical":
      return `\nPERSONA: Clinical. Be calm, precise, and evidence-driven. Cite mechanisms briefly when useful (e.g., "progressive overload drives hypertrophy via mechanical tension"). Avoid hype words. Use units and numbers. Still readable, never dry to the point of robotic.`;
    case "mentor":
    default:
      return `\nPERSONA: Mentor. Warm, patient, encouraging. Acknowledge effort before correcting. Use plain language and concrete next steps. Celebrate small wins. Never patronizing.`;
  }
}
