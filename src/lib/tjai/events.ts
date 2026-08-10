import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * TJAI behavioral event stream (TJFITV.10X PR8).
 *
 * A single privacy-minimized instrumentation API for the data flywheel. Writes
 * scalar-only metadata to `tjai_events` (service role) — never raw chat text or
 * raw plan JSON. Fire-and-forget: failures are swallowed so instrumentation can
 * never break a user-facing request.
 */

export type TjaiEventName =
  | "plan_generated"
  | "plan_generation_failed"
  | "plan_validation_failed"
  | "plan_saved"
  | "plan_regenerated"
  | "chat_response_completed"
  | "chat_response_failed"
  | "safety_guard_triggered"
  | "trial_limit_hit"
  | "credit_refunded"
  | "weekly_checkin_submitted"
  | "workout_feedback_submitted"
  | "suggestion_accepted"
  | "suggestion_rejected"
  | "coach_review_requested"
  | "support_refund_routed"
  | "locale_failure_flagged"
  | "quiz_step_reached";

export type TjaiEventScalar = string | number | boolean | null;

export type TjaiEvent = {
  event: TjaiEventName;
  userId?: string | null;
  locale?: string | null;
  tier?: string | null;
  planId?: string | null;
  conversationId?: string | null;
  promptVersion?: string | null;
  policyVersion?: string | null;
  modelProvider?: string | null;
  modelName?: string | null;
  intent?: string | null;
  riskLevel?: "low" | "medium" | "high" | "critical" | null;
  outcome?: "success" | "failure" | "accepted" | "rejected" | "aborted" | null;
  metadata?: Record<string, TjaiEventScalar>;
};

/** Drop any non-scalar metadata so raw objects/arrays/text blobs never leak in. */
export function sanitizeEventMetadata(
  metadata: Record<string, unknown> | undefined
): Record<string, TjaiEventScalar> {
  if (!metadata) return {};
  const out: Record<string, TjaiEventScalar> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      out[key] = value;
    }
  }
  return out;
}

/** Build the DB row from a typed event (exported for unit testing). */
export function toEventRow(event: TjaiEvent): Record<string, unknown> {
  return {
    user_id: event.userId ?? null,
    event: event.event,
    locale: event.locale ?? null,
    tier: event.tier ?? null,
    plan_id: event.planId ?? null,
    conversation_id: event.conversationId ?? null,
    prompt_version: event.promptVersion ?? null,
    policy_version: event.policyVersion ?? null,
    model_provider: event.modelProvider ?? null,
    model_name: event.modelName ?? null,
    intent: event.intent ?? null,
    risk_level: event.riskLevel ?? null,
    outcome: event.outcome ?? null,
    metadata: sanitizeEventMetadata(event.metadata)
  };
}

/**
 * Record a flywheel event. Fire-and-forget — never awaited on the hot path and
 * never throws. Requires a service-role client (RLS allows service role only).
 */
export function recordTjaiEvent(client: SupabaseClient, event: TjaiEvent): void {
  void client
    .from("tjai_events")
    .insert(toEventRow(event))
    .then(({ error }) => {
      if (error && process.env.TJAI_DEBUG_PIPELINE) {
        // eslint-disable-next-line no-console
        console.error("[TJAI event] insert failed", event.event, error.message);
      }
    });
}
