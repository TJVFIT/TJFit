/**
 * Named TJAI capabilities — extend here when adding new flows (router + tools).
 * HTTP routes remain the public surface; this registry documents and future-proofs dispatch.
 */

export const TJAI_SKILL_IDS = {
  CREATE_PROGRAM: "create_program",
  COACH_CHAT: "coach_chat",
  SWAP_MEAL: "swap_meal",
  REPLACE_MEAL: "replace_meal",
  SUMMARIZE_PROGRESS: "summarize_progress",
  WEEKLY_CHECK_IN: "weekly_check_in"
} as const;

export type TjaiSkillId = (typeof TJAI_SKILL_IDS)[keyof typeof TJAI_SKILL_IDS];

export type TjaiSkillMeta = {
  id: TjaiSkillId;
  description: string;
};

export const TJAI_SKILL_REGISTRY: Record<TjaiSkillId, TjaiSkillMeta> = {
  create_program: {
    id: "create_program",
    description: "12-week TJAI plan JSON (workout + diet) from quiz intake."
  },
  coach_chat: {
    id: "coach_chat",
    description: "Streaming fitness coach Q&A grounded in plan, logs, and memory."
  },
  swap_meal: {
    id: "swap_meal",
    description: "Single-meal substitution in an existing diet plan."
  },
  replace_meal: {
    id: "replace_meal",
    description: "Replace a meal slot while preserving macro targets."
  },
  summarize_progress: {
    id: "summarize_progress",
    description: "Future: structured progress narrative from logs and checkpoints."
  },
  weekly_check_in: {
    id: "weekly_check_in",
    description: "User-submitted weekly energy/adherence check-in (tjai_weekly_check_ins)."
  }
};
