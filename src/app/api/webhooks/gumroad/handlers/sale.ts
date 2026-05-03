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
//   program/diet → insert sale_commissions row with the commission
//                   split resolved from the 5-tier hierarchy. (No
//                   program_access / diet_access tables exist yet —
//                   sale_commissions is the audit trail until those
//                   land in a follow-up session.)
//
// The buyer is matched / auto-created by email. New accounts go
// through Supabase Auth admin API and get a confirmed-email row in
// `profiles` so the rest of the app sees them immediately.

import type { SupabaseClient } from "@supabase/supabase-js";

import { computeShareUSD, resolveCommissionRate } from "@/lib/gumroad/commission";

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

async function findOrCreateUserByEmail(
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
      // Look up coach (trainer_id on programs) — not all surfaces have
      // a coach attached. If no coach, log a 0/100 commission row to
      // preserve the audit trail.
      let coachId: string | null = null;
      if (syncRow.product_type === "program") {
        const { data: program } = await admin
          .from("programs")
          .select("trainer_id")
          .eq("id", syncRow.product_id)
          .maybeSingle();
        coachId = (program?.trainer_id as string | null) ?? null;
      }

      let coachPct = 0;
      let tjfitPct = 100;
      let appliedRule: "global" | "product_type" | "per_product" | "per_coach" | "override" =
        "override";
      let appliedRuleId: string | null = null;

      if (coachId) {
        try {
          const resolved = await resolveCommissionRate(admin, {
            productType: syncRow.product_type as "program" | "diet",
            productId: syncRow.product_id as string,
            coachId
          });
          coachPct = resolved.coachPct;
          tjfitPct = resolved.tjfitPct;
          appliedRule = resolved.ruleSource;
          appliedRuleId = resolved.ruleId;
        } catch {
          // Fall back to 0/100 — TJFit-keeps-all when the resolver
          // can't satisfy. Logged below.
        }
      }

      const { coachUsd, tjfitUsd } = computeShareUSD(
        { coachPct, tjfitPct, ruleSource: appliedRule, ruleId: appliedRuleId ?? "" },
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
            details: { user_id: userId, deduped: true, sale_id: saleId }
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
          applied_rule: appliedRule
        }
      };
    }

    case "subscription":
      // Subscriptions are handled separately via subscription_started /
      // _renewed / _cancelled / _failed events — not the sale event.
      // If a subscription product fires a `sale` event (Gumroad does
      // for the first charge), v5 round 3 will route that path.
      return { ok: true, action: "subscription_first_charge_deferred" };

    default:
      return { ok: false, action: "lookup_sync", error: `unsupported product_type: ${syncRow.product_type}` };
  }
}
