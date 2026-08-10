// Gumroad refund handler.
//
// The route re-fetches the sale from the Gumroad API and confirms
// `refunded === true` BEFORE calling this — so, exactly like the sale path, a
// forged refund ping can't revoke access: only Gumroad's own record can.
//
// Revocation is idempotent (plain status updates) and covers every entitlement
// a sale could have granted:
//   - website-checkout order   (program_orders by id, via tjfit_order_id)
//   - direct-storefront order  (program_orders by provider_order_id = sale id)
//   - commission audit row     (sale_commissions → 'refunded')
//   - subscription first charge (user_subscriptions → downgraded to 'core')
//
// TJAI credit packs are intentionally NOT clawed back here: credits may already
// be spent and the balance RPC can't go negative. That reversal needs a
// dedicated (possibly manual) flow — see the note in the caller's report.

import type { SupabaseClient } from "@supabase/supabase-js";

import type { GumroadSale } from "@/lib/gumroad/client";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RefundEventPayload = {
  url_params?: Record<string, string>;
};

export type RefundHandlerResult =
  | { ok: true; action: string; details: Record<string, unknown> }
  | { ok: false; action: string; error: string };

export async function handleRefund(
  sale: GumroadSale,
  payload: RefundEventPayload,
  admin: SupabaseClient
): Promise<RefundHandlerResult> {
  const saleId = sale.id;
  const revoked: Record<string, unknown> = {};

  // 1. Website-checkout order referenced by the tracked order id.
  const rawOrderId = payload.url_params?.tjfit_order_id?.trim();
  const orderId = rawOrderId && UUID_RE.test(rawOrderId) ? rawOrderId : null;
  if (orderId) {
    const { data, error } = await admin
      .from("program_orders")
      .update({ status: "refunded" })
      .eq("id", orderId)
      .in("status", ["paid", "pending"])
      .select("id");
    if (error) return { ok: false, action: "refund_order", error: error.message };
    revoked.order_ids = (data ?? []).map((r) => r.id);
  }

  // 2. Direct-storefront order keyed on the Gumroad sale id.
  {
    const { data, error } = await admin
      .from("program_orders")
      .update({ status: "refunded" })
      .eq("provider_order_id", saleId)
      .in("status", ["paid", "pending"])
      .select("id");
    if (error) return { ok: false, action: "refund_direct_order", error: error.message };
    const ids = (data ?? []).map((r) => r.id);
    if (ids.length) revoked.direct_order_ids = ids;
  }

  // 3. Commission audit row.
  {
    const { data, error } = await admin
      .from("sale_commissions")
      .update({ status: "refunded" })
      .eq("gumroad_sale_id", saleId)
      .neq("status", "refunded")
      .select("id");
    if (error) return { ok: false, action: "refund_commission", error: error.message };
    const ids = (data ?? []).map((r) => r.id);
    if (ids.length) revoked.commission_ids = ids;
  }

  // 4. Subscription first-charge refund → downgrade the buyer to free.
  if (sale.subscription_id) {
    const subId = sale.subscription_id.trim();
    let userId: string | null = null;
    const { data: bySub } = await admin
      .from("user_subscriptions")
      .select("user_id")
      .eq("gumroad_subscription_id", subId)
      .maybeSingle();
    if (bySub?.user_id) {
      userId = bySub.user_id;
    } else {
      const email = sale.email?.trim().toLowerCase();
      if (email) {
        const { data: profile } = await admin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        userId = profile?.id ?? null;
      }
    }
    if (userId) {
      const { error } = await admin
        .from("user_subscriptions")
        .update({ tier: "core", status: "cancelled", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) return { ok: false, action: "refund_subscription", error: error.message };
      revoked.subscription_user_id = userId;
    }
  }

  return { ok: true, action: "refund", details: { sale_id: saleId, revoked } };
}
