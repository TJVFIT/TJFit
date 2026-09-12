import type { SupabaseClient } from "@supabase/supabase-js";
import type { GumroadSale } from "@/lib/gumroad/client";

export type RefundEventPayload = { url_params?: Record<string, string> };
export type RefundHandlerResult =
  | { ok: true; action: string; details: Record<string, unknown> }
  | { ok: false; action: string; error: string };

/** Verified refunds touch only durable Gumroad sale bindings, never buyer-supplied account/order IDs. */
export async function handleRefund(sale: GumroadSale, _payload: RefundEventPayload, admin: SupabaseClient): Promise<RefundHandlerResult> {
  if (!sale.id || (sale.refunded !== true && sale.disputed !== true)) return { ok: false, action: "review_refund", error: "refund_not_confirmed" };
  const { data: orders, error: orderError } = await admin.from("program_orders")
    .update({ status: "refunded" }).eq("provider_order_id", sale.id).eq("provider", "gumroad")
    .in("status", ["paid", "pending"]).select("id");
  if (orderError) return { ok: false, action: "refund_order", error: orderError.message };
  const { data: commissions, error: commissionError } = await admin.from("sale_commissions")
    .update({ status: "refunded" }).eq("gumroad_sale_id", sale.id).neq("status", "refunded").select("id");
  if (commissionError) return { ok: false, action: "refund_commission", error: commissionError.message };
  // A refund of an older charge does not prove a newer paid subscription ended.
  // Credits and unbound historical website orders need explicit reconciliation.
  const { data: credits, error: creditError } = await admin.from("tjai_credit_transactions")
    .select("id").eq("metadata->>gumroad_sale_id", sale.id).eq("reason", "purchase").limit(1);
  if (creditError) return { ok: false, action: "review_refund", error: "credit_reconciliation_unavailable" };
  return { ok: true, action: "refund", details: {
    sale_id: sale.id, requires_review: Boolean(sale.subscription_id || credits?.length || !orders?.length),
    revoked: { direct_order_ids: (orders ?? []).map(row => row.id), commission_ids: (commissions ?? []).map(row => row.id) }
  } };
}
