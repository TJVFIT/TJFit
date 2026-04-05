import type { SupabaseClient } from "@supabase/supabase-js";

import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";
import { isPaddleLiveCheckoutStored } from "@/lib/payments/stored-provider";

export type FulfillOrderResult =
  | { ok: true; alreadyPaid?: boolean; coinsEarned: number }
  | { ok: false; error: string };

/**
 * Marks a program order paid, credits TJFITcoin, and consumes a wallet discount code if present.
 * Used by test checkout completion and Paddle webhooks (idempotent if already paid).
 */
export async function fulfillProgramOrderPaid(
  adminClient: SupabaseClient,
  orderId: string,
  opts?: { requirePaddleLiveOrder?: boolean }
): Promise<FulfillOrderResult> {
  const { data: existingOrder, error: fetchErr } = await adminClient
    .from("program_orders")
    .select("id,user_id,status,discount_code,provider")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchErr || !existingOrder) {
    return { ok: false, error: "Order not found" };
  }

  if (opts?.requirePaddleLiveOrder && !isPaddleLiveCheckoutStored(existingOrder.provider)) {
    return { ok: false, error: "Order is not a Paddle live checkout" };
  }

  if (existingOrder.status === "paid") {
    return { ok: true, alreadyPaid: true, coinsEarned: TJFIT_COINS_PER_PROGRAM_PURCHASE };
  }

  if (existingOrder.status !== "pending") {
    return { ok: false, error: "Order is not pending" };
  }

  const { data: paidOrder, error: orderUpdateError } = await adminClient
    .from("program_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      tjfit_coins_earned: TJFIT_COINS_PER_PROGRAM_PURCHASE
    })
    .eq("id", existingOrder.id)
    .eq("status", "pending")
    .select("id,discount_code")
    .single();

  if (orderUpdateError || !paidOrder) {
    return { ok: false, error: "Order could not be completed." };
  }

  await adminClient.from("tjfit_coin_wallets").upsert({ user_id: existingOrder.user_id }, { onConflict: "user_id" });

  const { data: walletBefore } = await adminClient
    .from("tjfit_coin_wallets")
    .select("balance,lifetime_earned,lifetime_spent")
    .eq("user_id", existingOrder.user_id)
    .single();

  const walletBalance = walletBefore?.balance ?? 0;
  const lifetimeEarned = walletBefore?.lifetime_earned ?? 0;
  const lifetimeSpent = walletBefore?.lifetime_spent ?? 0;

  await adminClient
    .from("tjfit_coin_wallets")
    .update({
      balance: walletBalance + TJFIT_COINS_PER_PROGRAM_PURCHASE,
      lifetime_earned: lifetimeEarned + TJFIT_COINS_PER_PROGRAM_PURCHASE,
      lifetime_spent: lifetimeSpent,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", existingOrder.user_id)
    .eq("balance", walletBalance);

  await adminClient.from("tjfit_coin_ledger").insert({
    user_id: existingOrder.user_id,
    delta: TJFIT_COINS_PER_PROGRAM_PURCHASE,
    reason: "program_purchase",
    order_id: existingOrder.id,
    metadata: { source: "checkout_fulfill", coinsPerProgram: TJFIT_COINS_PER_PROGRAM_PURCHASE }
  });

  if (paidOrder.discount_code) {
    await adminClient
      .from("tjfit_discount_codes")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
        order_id: existingOrder.id
      })
      .eq("code", paidOrder.discount_code)
      .eq("user_id", existingOrder.user_id)
      .eq("status", "available");
  }

  return { ok: true, coinsEarned: TJFIT_COINS_PER_PROGRAM_PURCHASE };
}
