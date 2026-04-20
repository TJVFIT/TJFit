/**
 * Versioned facade over legacy prompt builders in `@/lib/tjai-prompts`.
 * Bump PROMPT_VERSION when changing coaching rules or JSON contracts materially.
 */
export { buildTJAISystemPrompt, buildTJAIUserPrompt } from "@/lib/tjai-prompts";

export const TJAI_PROMPT_VERSION = "2026.04.1";
