// Gumroad subscription lifecycle handler.
//
// The FIRST charge of a membership arrives as a `sale` event and is granted in
// handlers/sale.ts (grant_subscription). AFTER that, Gumroad emits resource
// events for the life of the subscription:
//
//   subscription_updated    — recurring charge succeeded / plan changed → active
//   subscription_restarted  — buyer resubscribed after cancelling      → active
//   subscription_ended      — subscription terminated (period elapsed or
//                             failed final charge)                      → revoke
//   cancellation            — buyer cancelled but is still inside the paid
//                             period                                    → keep
//                             access until it ends, stop auto-renew
//
// Access model: every premium endpoint reads `user_subscriptions.tier`
// directly, so `tier` is the real access switch. We only downgrade tier→'core'
// when the paid period is actually over (subscription_ended / refund), never on
// a mere cancellation (the buyer paid through the current period).
//
// These events are NOT re-fetched against a sale id (they have none), so the
// user is resolved from the Gumroad subscription id we stored on the first
// charge, falling back to the buyer email. Unknown subscriptions are a safe
// no-op. Idempotency: the route's (provider,event_id) unique row blocks
// reprocessing; the writes here are also naturally idempotent.

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  computeSubscriptionPeriodEnd,
  resolveSubscriptionPlan,
  upsertUserSubscription,
  type BillingMode,
  type PaidTier
} from "./sale";

export type SubscriptionEventPayload = {
  resource_name?: string;
  subscription_id?: string;
  email?: string;
  recurrence?: string;
  url_params?: Record<string, string>;
  custom_fields?: Record<string, string>;
  // Gumroad may include an explicit end/cancel timestamp on these events.
  ended_at?: string;
  cancelled_at?: string;
};

export type SubscriptionHandlerResult =
  | { ok: true; action: string; details?: Record<string, unknown> }
  | { ok: false; action: string; error: string };

type ExistingSub = {
  user_id: string;
  tier: "core" | "pro" | "apex";
  current_period_end: string | null;
};

/**
 * Resolve the user_subscriptions row this event targets. Matches on the stored
 * Gumroad subscription id first (set on the first charge), then on the buyer
 * email via profiles. Returns null when neither locates a user we know.
 */
async function resolveExistingSubscription(
  admin: SupabaseClient,
  payload: SubscriptionEventPayload
): Promise<ExistingSub | null> {
  const subId = payload.subscription_id?.trim();
  if (subId) {
    const { data } = await admin
      .from("user_subscriptions")
      .select("user_id, tier, current_period_end")
      .eq("gumroad_subscription_id", subId)
      .maybeSingle();
    if (data?.user_id) return data as ExistingSub;
  }

  const email = payload.email?.trim().toLowerCase();
  if (email) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (profile?.id) {
      const { data: sub } = await admin
        .from("user_subscriptions")
        .select("user_id, tier, current_period_end")
        .eq("user_id", profile.id)
        .maybeSingle();
      if (sub?.user_id) return sub as ExistingSub;
      // Known user, no subscription row yet — return a stub so a restart/update
      // carrying an explicit tier can still create one.
      return { user_id: profile.id, tier: "core", current_period_end: null };
    }
  }
  return null;
}

export async function handleSubscriptionEvent(
  eventType: string,
  payload: SubscriptionEventPayload,
  admin: SupabaseClient
): Promise<SubscriptionHandlerResult> {
  const existing = await resolveExistingSubscription(admin, payload);
  if (!existing) {
    // Not a subscription we know about (e.g. lifecycle event before we ever
    // saw the first charge, or a non-TJFit buyer). No-op, not an error.
    return { ok: true, action: `${eventType}:noop_unknown_subscription` };
  }

  const subId = payload.subscription_id?.trim() ?? null;

  if (eventType === "subscription_ended") {
    // The paid period is over — downgrade to the free tier.
    const res = await upsertUserSubscription(admin, {
      userId: existing.user_id,
      tier: "core",
      status: "cancelled",
      gumroadSubscriptionId: subId
    });
    if (!res.ok) return { ok: false, action: "subscription_ended", error: res.error };
    return {
      ok: true,
      action: "subscription_ended",
      details: { user_id: existing.user_id, tier: "core", revoked: true }
    };
  }

  // subscription_updated / subscription_restarted (and the generic
  // "subscription" alias): the membership is (still) active. Keep the paid tier
  // and refresh the period. If the row is a fresh stub with no paid tier, try
  // to adopt an explicit checkout tier from the event params.
  const plan = resolveSubscriptionPlan(payload);
  let tier: "core" | "pro" | "apex" = existing.tier;
  let billingMode: BillingMode | undefined;
  if (existing.tier === "core" && plan) {
    tier = plan.tier as PaidTier;
    billingMode = plan.billingMode;
  } else if (plan) {
    billingMode = plan.billingMode;
  }

  if (tier === "core") {
    // Active event but we can't tell which paid tier — leave access unchanged
    // rather than guess. Record as a benign no-op.
    return { ok: true, action: `${eventType}:noop_no_tier` };
  }

  const periodStart = new Date().toISOString();
  const periodEnd = computeSubscriptionPeriodEnd(periodStart, {
    recurrence: payload.recurrence,
    billingMode
  });

  const res = await upsertUserSubscription(admin, {
    userId: existing.user_id,
    tier,
    status: "active",
    periodStart,
    periodEnd,
    gumroadSubscriptionId: subId
  });
  if (!res.ok) return { ok: false, action: eventType, error: res.error };
  return {
    ok: true,
    action: eventType,
    details: { user_id: existing.user_id, tier, current_period_end: periodEnd }
  };
}

/**
 * Buyer-initiated cancellation. They keep the tier they paid for until the
 * current period ends (a later subscription_ended downgrades them), so we only
 * flip status to 'cancelled' and stop treating it as auto-renewing. Access is
 * intentionally NOT revoked here.
 */
export async function handleSubscriptionCancellation(
  payload: SubscriptionEventPayload,
  admin: SupabaseClient
): Promise<SubscriptionHandlerResult> {
  const existing = await resolveExistingSubscription(admin, payload);
  if (!existing) {
    return { ok: true, action: "cancellation:noop_unknown_subscription" };
  }
  // Keep tier as-is; only mark not-renewing.
  const res = await upsertUserSubscription(admin, {
    userId: existing.user_id,
    tier: existing.tier,
    status: "cancelled",
    gumroadSubscriptionId: payload.subscription_id?.trim() ?? null
  });
  if (!res.ok) return { ok: false, action: "cancellation", error: res.error };
  return {
    ok: true,
    action: "cancellation",
    details: {
      user_id: existing.user_id,
      tier: existing.tier,
      access_retained_until: existing.current_period_end
    }
  };
}
