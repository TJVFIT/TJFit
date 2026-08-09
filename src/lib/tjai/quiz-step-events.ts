import { isSupportedLocale } from "@/lib/i18n";

/**
 * Server-side validation for the public quiz step-funnel beacon.
 *
 * The quiz fires one `quiz_step_reached` per (quiz session, step id) the
 * first time a step is displayed; `"review"` is the pre-submit summary and
 * arrives with stepIndex === totalSteps. Drop-off per step = distinct
 * sessions that reached step s minus those that reached the one after it.
 * The endpoint is public (the quiz runs pre-signup), so every field is
 * strictly validated and bounded before it can reach the event stream.
 */
export type QuizStepEvent = {
  stepId: string;
  stepIndex: number;
  totalSteps: number;
  quizSessionId: string;
  locale: string | null;
};

const STEP_ID_RE = /^[a-z][a-z0-9_]{1,63}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_STEPS = 99;

export function parseQuizStepEvent(body: unknown): QuizStepEvent | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const record = body as Record<string, unknown>;
  const { stepId, stepIndex, totalSteps, quizSessionId, locale } = record;
  if (typeof stepId !== "string" || !STEP_ID_RE.test(stepId)) return null;
  if (typeof quizSessionId !== "string" || !UUID_RE.test(quizSessionId)) return null;
  if (typeof stepIndex !== "number" || !Number.isInteger(stepIndex) || stepIndex < 0) return null;
  if (
    typeof totalSteps !== "number" ||
    !Number.isInteger(totalSteps) ||
    totalSteps < 1 ||
    totalSteps > MAX_STEPS
  ) {
    return null;
  }
  if (stepIndex > totalSteps) return null;
  return {
    stepId,
    stepIndex,
    totalSteps,
    quizSessionId: quizSessionId.toLowerCase(),
    locale: typeof locale === "string" && isSupportedLocale(locale) ? locale : null
  };
}
