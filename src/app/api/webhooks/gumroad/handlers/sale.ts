// v5 round 2 — handleSale: route an inbound Gumroad sale to the right
// effect based on the synced product type.
//
// Inputs: parsed Gumroad event payload (signature already verified
// by the route) + a Supabase admin client.
//
// Outputs: { ok, action, error? } — never throws; route logs status
// onto payment_webhooks.
//
// Effects (per product_type from product_gumroad_sync):
//   tjai_credits → grant_tjai_credit RPC adds the pack's credits to
//                   the buyer's balance + ledger row
//   program/diet → grant the entitlement (paid program_orders row)
//                   when a slug resolves, and insert a sale_commissions
//                   audit row at a fixed 0/100 split — no coach attaches
//                   to this lane (static-code catalogs, no trainer_id).
//                   The 5-tier hierarchy lives unused in
//                   src/lib/gumroad/commission.ts until a coach lane
//                   reaches this handler.
//
// The buyer is matched / auto-created by email. New accounts go
// through Supabase Auth admin API and get a confirmed-email row in
// `profiles` so the rest of the app sees them immediately.

import type { SupabaseClient } from "@supabase/supabase-js";

import { computeShareUSD } from "@/lib/gumroad/commission";
import { getProgram } from "@/lib/programs";

export type GumroadSalePayload = {
  resource_name?: string;
  sale_id?: string;
  product_id?: string;
  product_permalink?: string;
  email?: string;
  full_name?: string;
  // Gumroad reports prices as integer cents (e.g. 599 = $5.99).
  price?: string | number;
  gumroad_fee?: string | number;
  currency?: string;
  custom_fields?: Record<string, string>;
  // Query params echoed from the tracked checkout URL — carry the buyer's
  // chosen membership tier / billing mode / program slug.
  url_params?: Record<string, string>;
  // Present when the sale is the first charge of a recurring subscription.
  subscription_id?: string;
  // Gumroad billing cadence: "monthly" | "yearly" | "quarterly" | etc.
  recurrence?: string;
  // ISO timestamp of the sale (used as the subscription period start).
  sale_timestamp?: string;
  test?: boolean;
};

export type SaleHandlerResult =
  | { ok: true; action: string; details?: Record<string, unknown> }
  | { ok: false; action: string; error: string };

function asCents(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0;
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Math.round(value);
  return Number.isFinite(n) ? n : 0;
}

// Paid membership tiers a Gumroad subscription can grant. 'core' is the
// free/default tier and is never granted by a purchase.
export type PaidTier = "pro" | "apex";
export type BillingMode = "monthly" | "annual";

/**
 * Resolve the paid membership tier + billing cadence for a subscription sale.
 *
 * Source of truth is the checkout URL params the membership page stamps
 * (`tjfit_tier` / `tjfit_billing_mode` — see membership-pricing.tsx). The sale
 * itself is already re-verified against the Gumroad API by the route, so these
 * buyer-selected params only decide WHICH plan the (real, paid) sale unlocks.
 *
 * Returns null when no valid paid tier can be determined — the caller must
 * then fail loudly rather than silently grant the wrong (or free) tier.
 */
export function resolveSubscriptionPlan(
  payload: Pick<GumroadSalePayload, "url_params" | "custom_fields" | "recurrence">
): { tier: PaidTier; billingMode: BillingMode } | null {
  const bag = { ...(payload.custom_fields ?? {}), ...(payload.url_params ?? {}) };
  const rawTier = String(bag.tjfit_tier ?? "").trim().toLowerCase();
  const tier: PaidTier | null = rawTier === "pro" || rawTier === "apex" ? rawTier : null;
  if (!tier) return null;

  const rawMode = String(bag.tjfit_billing_mode ?? "").trim().toLowerCase();
  // Prefer the explicit checkout mode; fall back to the Gumroad recurrence so a
  // direct-storefront subscription (no url_params mode) still resolves a period.
  const recurrence = String(payload.recurrence ?? "").trim().toLowerCase();
  const billingMode: BillingMode =
    rawMode === "annual" || rawMode === "yearly"
      ? "annual"
      : rawMode === "monthly"
        ? "monthly"
        : recurrence === "yearly" || recurrence === "annual"
          ? "annual"
          : "monthly";

  return { tier, billingMode };
}

/**
 * Compute the subscription period end from its start. Prefers the authoritative
 * Gumroad `recurrence` (what the buyer was actually charged for) over the
 * checkout billing mode. Yearly/annual → +1 year; everything else → +1 month.
 */
export function computeSubscriptionPeriodEnd(
  startISO: string,
  opts: { recurrence?: string; billingMode?: BillingMode }
): string {
  const start = new Date(startISO);
  const base = Number.isFinite(start.getTime()) ? start : new Date();
  const recurrence = String(opts.recurrence ?? "").trim().toLowerCase();
  const isYearly =
    recurrence === "yearly" ||
    recurrence === "annual" ||
    (!recurrence && opts.billingMode === "annual");
  const end = new Date(base);
  if (isYearly) {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end.toISOString();
}

/**
 * Upsert the entitlement row that gates the paid TJAI tiers. Keyed on the
 * unique (user_id) index so Gumroad redelivery is idempotent. All premium
 * endpoints read `user_subscriptions.tier` directly, so `tier` is the field
 * that actually grants/revokes access; `status` + period are bookkeeping.
 */
export async function upsertUserSubscription(
  admin: SupabaseClient,
  input: {
    userId: string;
    tier: "core" | "pro" | "apex";
    status: "active" | "cancelled" | "paused";
    periodStart?: string | null;
    periodEnd?: string | null;
    gumroadSubscriptionId?: string | null;
  }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row: Record<string, unknown> = {
    user_id: input.userId,
    tier: input.tier,
    status: input.status,
    updated_at: new Date().toISOString()
  };
  if (input.periodStart !== undefined) row.current_period_start = input.periodStart;
  if (input.periodEnd !== undefined) row.current_period_end = input.periodEnd;
  if (input.gumroadSubscriptionId !== undefined) {
    row.gumroad_subscription_id = input.gumroadSubscriptionId;
  }

  const { error } = await admin
    .from("user_subscriptions")
    .upsert(row, { onConflict: "user_id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Resolve the entitlement slug for a direct program/diet sale. Priority:
 *   1. tjfit_program_slug from the tracked checkout URL params / custom fields
 *      (buildGumroadTrackedUrl stamps this on every TJFit-initiated checkout).
 *   2. the static program registry, keyed by the sync row's product_id
 *      (programs only). Neither programs nor diets have a DB table — the
 *      catalogs are static code (src/lib/programs, src/lib/diets), so a
 *      program sync row's product_id must be the program slug for a
 *      storefront purchase (no stamped params) to be fulfillable.
 * Returns null when neither source resolves (e.g. a diet bought straight
 * from the Gumroad storefront, or a program sync row keyed by something
 * that isn't a registered slug).
 */
export async function resolveEntitlementSlug(
  admin: SupabaseClient,
  productType: "program" | "diet",
  productId: string,
  payload: Pick<GumroadSalePayload, "url_params" | "custom_fields">
): Promise<string | null> {
  void admin; // catalogs are static code — kept in the signature so a future DB-backed catalog is a drop-in
  const bag = { ...(payload.custom_fields ?? {}), ...(payload.url_params ?? {}) };
  const stamped = String(bag.tjfit_program_slug ?? "").trim();
  if (stamped) return stamped;

  if (productType === "program") {
    const program = getProgram(productId.trim());
    if (program) return program.slug;
  }
  return null;
}

/**
 * Grant a real program/diet entitlement by writing a paid program_orders row
 * (the same row hasPurchasedProgram gates on). Idempotent via the unique
 * provider_order_id = Gumroad sale id, so redelivery is a no-op.
 */
export async function grantProgramEntitlement(
  admin: SupabaseClient,
  input: {
    userId: string;
    programSlug: string;
    saleId: string;
    currency?: string;
    locale?: string;
  }
): Promise<{ ok: true; deduped?: boolean } | { ok: false; error: string }> {
  const { error } = await admin.from("program_orders").insert({
    user_id: input.userId,
    program_slug: input.programSlug,
    amount_try: 0,
    final_amount_try: 0,
    currency: input.currency ?? "USD",
    locale: input.locale ?? "en",
    provider: "gumroad",
    provider_order_id: input.saleId,
    status: "paid",
    paid_at: new Date().toISOString()
  });
  if (error) {
    // 23505 = unique violation on provider_order_id → already fulfilled.
    if (error.code === "23505") return { ok: true, deduped: true };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function findOrCreateUserByEmail(
  admin: SupabaseClient,
  email: string,
  fullName?: string
): Promise<{ userId: string; created: boolean } | { error: string }> {
  // Search profiles first (fast path — already-known users).
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingProfile?.id) return { userId: existingProfile.id, created: false };

  // Auth admin createUser. If a user with this email already exists in
  // auth (but not in profiles, somehow), it returns 422 — fall back to
  // a listUsers lookup.
  try {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName ?? null, source: "gumroad_purchase" }
    });
    if (created?.user?.id && !error) {
      // Best-effort profile insert — many schemas have a trigger that
      // auto-creates a profile row on auth.users insert; this UPSERT is
      // additive either way.
      await admin
        .from("profiles")
        .upsert(
          { id: created.user.id, email, role: "user" },
          { onConflict: "id", ignoreDuplicates: true }
        );

      // Magic-link follow-up so the buyer can sign in & set a password.
      try {
        await admin.auth.admin.generateLink({
          type: "magiclink",
          email
        });
      } catch {
        /* non-blocking — Resend handoff lives in a separate template */
      }

      return { userId: created.user.id, created: true };
    }
  } catch {
    /* swallow — fall through to listUsers lookup */
  }

  // Fallback: scan auth.users for the email.
  const { data: list } = await admin.auth.admin.listUsers();
  const match = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (match?.id) return { userId: match.id, created: false };

  return { error: `unable to resolve user for ${email}` };
}

export async function handleSale(
  payload: GumroadSalePayload,
  admin: SupabaseClient
): Promise<SaleHandlerResult> {
  const gumroadProductId = payload.product_id?.trim();
  const buyerEmail = payload.email?.trim().toLowerCase();
  const saleId = payload.sale_id?.trim() ?? "";

  if (!gumroadProductId) return { ok: false, action: "lookup", error: "no product_id in payload" };
  if (!buyerEmail) return { ok: false, action: "lookup", error: "no email in payload" };
  if (!saleId) return { ok: false, action: "lookup", error: "no sale_id in payload" };

  const grossCents = asCents(payload.price);
  const feeCents = asCents(payload.gumroad_fee);
  const grossUsd = grossCents / 100;
  const feeUsd = feeCents / 100;
  const netUsd = Math.max(0, grossUsd - feeUsd);

  // 1. Resolve which TJFit product this Gumroad sale corresponds to.
  const { data: syncRow, error: syncErr } = await admin
    .from("product_gumroad_sync")
    .select("product_type, product_id, gumroad_product_id")
    .eq("gumroad_product_id", gumroadProductId)
    .maybeSingle();

  if (syncErr) return { ok: false, action: "lookup_sync", error: syncErr.message };
  if (!syncRow) {
    return {
      ok: false,
      action: "lookup_sync",
      error: `gumroad product ${gumroadProductId} not in product_gumroad_sync — admin needs to reconcile`
    };
  }

  // 2. Resolve the buyer (auto-create if first purchase ever).
  const userResolution = await findOrCreateUserByEmail(admin, buyerEmail, payload.full_name);
  if ("error" in userResolution) {
    return { ok: false, action: "resolve_user", error: userResolution.error };
  }
  const userId = userResolution.userId;

  // 3. Effect by product type.
  switch (syncRow.product_type) {
    case "tjai_credits": {
      const { data: pack, error: packErr } = await admin
        .from("tjai_credit_packs")
        .select("credits, slug")
        .eq("id", syncRow.product_id)
        .maybeSingle();
      if (packErr || !pack) {
        return { ok: false, action: "lookup_pack", error: packErr?.message ?? "pack not found" };
      }

      const { error: rpcErr } = await admin.rpc("grant_tjai_credit", {
        p_user_id: userId,
        p_amount: pack.credits,
        p_reason: "purchase",
        p_metadata: {
          gumroad_sale_id: saleId,
          pack_slug: pack.slug,
          pack_id: syncRow.product_id,
          gross_usd: grossUsd
        }
      });
      if (rpcErr) return { ok: false, action: "grant_credit", error: rpcErr.message };

      return {
        ok: true,
        action: "grant_credit",
        details: {
          user_id: userId,
          credits_granted: pack.credits,
          pack_slug: pack.slug,
          new_user: userResolution.created
        }
      };
    }

    case "program":
    case "diet": {
      // 3a. Grant the REAL entitlement first — this is what actually unlocks
      // the product for the buyer (hasPurchasedProgram gates on a paid
      // program_orders row). The sale_commissions row written below is only
      // the payout audit trail, not an access grant.
      const entitlementSlug = await resolveEntitlementSlug(
        admin,
        syncRow.product_type as "program" | "diet",
        syncRow.product_id as string,
        payload
      );
      let entitlementGranted = false;
      let entitlementNote: string | null = null;
      if (entitlementSlug) {
        const grant = await grantProgramEntitlement(admin, {
          userId,
          programSlug: entitlementSlug,
          saleId,
          currency: payload.currency,
          locale: payload.url_params?.tjfit_locale
        });
        if (!grant.ok) {
          // A hard DB error here means the buyer paid but has no access — fail
          // so Gumroad retries and the miss is visible in payment_webhooks.
          return { ok: false, action: "grant_entitlement", error: grant.error };
        }
        entitlementGranted = true;
      } else {
        // No slug resolvable (e.g. a diet bought straight from the Gumroad
        // storefront — diets have no DB table yet). Keep the commission audit
        // and surface the gap rather than retrying a structurally-unfulfillable
        // sale forever.
        entitlementNote = "no_program_slug_resolved";
      }

      // No coach attaches to this lane: programs/diets are static-code
      // catalogs (no DB table, no trainer_id — see resolveEntitlementSlug),
      // so every sale here is TJFit-keeps-all. Coach-authored programs sell
      // through custom_programs, not Gumroad sync; when a coach lane reaches
      // this handler, resolveCommissionRate() in src/lib/gumroad/commission.ts
      // holds the 5-tier split hierarchy to wire in.
      const coachId: string | null = null;
      const coachPct = 0;
      const tjfitPct = 100;
      const appliedRule = "override" as const;
      const appliedRuleId: string | null = null;

      const { coachUsd, tjfitUsd } = computeShareUSD(
        { coachPct, tjfitPct, ruleSource: appliedRule, ruleId: "" },
        netUsd
      );

      const { error: insErr } = await admin.from("sale_commissions").insert({
        gumroad_sale_id: saleId,
        product_type: syncRow.product_type,
        product_id: syncRow.product_id,
        coach_id: coachId,
        buyer_id: userId,
        gross_amount_usd: grossUsd,
        gumroad_fee_usd: feeUsd,
        net_amount_usd: netUsd,
        coach_share_pct: coachPct,
        tjfit_share_pct: tjfitPct,
        coach_amount_usd: coachUsd,
        tjfit_amount_usd: tjfitUsd,
        applied_rule: appliedRule,
        applied_rule_id: appliedRuleId,
        status: coachId ? "payable" : "paid"
      });
      if (insErr) {
        // Idempotency: 23505 means the same gumroad_sale_id row is
        // already there — treat as success.
        if (insErr.code === "23505") {
          return {
            ok: true,
            action: "log_sale_commission",
            details: {
              user_id: userId,
              deduped: true,
              sale_id: saleId,
              entitlement_granted: entitlementGranted,
              entitlement_slug: entitlementSlug,
              entitlement_note: entitlementNote
            }
          };
        }
        return { ok: false, action: "log_sale_commission", error: insErr.message };
      }

      return {
        ok: true,
        action: "log_sale_commission",
        details: {
          user_id: userId,
          new_user: userResolution.created,
          coach_id: coachId,
          coach_amount_usd: coachUsd,
          tjfit_amount_usd: tjfitUsd,
          applied_rule: appliedRule,
          entitlement_granted: entitlementGranted,
          entitlement_slug: entitlementSlug,
          entitlement_note: entitlementNote
        }
      };
    }

    case "subscription": {
      // First charge of a recurring membership. Gumroad fires a `sale` event
      // for it (subsequent lifecycle changes arrive as subscription_* events,
      // handled in handlers/subscription.ts). Grant the paid tier now so the
      // 16+ premium endpoints (which read user_subscriptions.tier) unlock.
      const plan = resolveSubscriptionPlan(payload);
      if (!plan) {
        // A real, paid subscription sale we can't map to pro/apex — do NOT
        // silently grant nothing or the wrong tier. Fail so it's visible.
        return {
          ok: false,
          action: "grant_subscription",
          error: "could not resolve paid tier from tjfit_tier url_param"
        };
      }

      const periodStart = payload.sale_timestamp
        ? new Date(payload.sale_timestamp).toISOString()
        : new Date().toISOString();
      const periodEnd = computeSubscriptionPeriodEnd(periodStart, {
        recurrence: payload.recurrence,
        billingMode: plan.billingMode
      });

      const upsert = await upsertUserSubscription(admin, {
        userId,
        tier: plan.tier,
        status: "active",
        periodStart,
        periodEnd,
        gumroadSubscriptionId: payload.subscription_id ?? null
      });
      if (!upsert.ok) {
        return { ok: false, action: "grant_subscription", error: upsert.error };
      }

      return {
        ok: true,
        action: "grant_subscription",
        details: {
          user_id: userId,
          new_user: userResolution.created,
          tier: plan.tier,
          billing_mode: plan.billingMode,
          current_period_end: periodEnd,
          gumroad_subscription_id: payload.subscription_id ?? null
        }
      };
    }

    default:
      return { ok: false, action: "lookup_sync", error: `unsupported product_type: ${syncRow.product_type}` };
  }
}
