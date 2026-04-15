import type { SupabaseClient } from "@supabase/supabase-js";

import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";
import { isPaddleLiveCheckoutStored } from "@/lib/payments/stored-provider";
import { TJCOIN_REWARDS } from "@/lib/tjcoin-events";

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
  const rewardAmount = TJCOIN_REWARDS.program_purchase ?? TJFIT_COINS_PER_PROGRAM_PURCHASE;
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
    return { ok: true, alreadyPaid: true, coinsEarned: rewardAmount };
  }

  if (existingOrder.status !== "pending") {
    return { ok: false, error: "Order is not pending" };
  }

  const { data: paidOrder, error: orderUpdateError } = await adminClient
    .from("program_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      tjfit_coins_earned: rewardAmount
    })
    .eq("id", existingOrder.id)
    .eq("status", "pending")
    .select("id,discount_code")
    .single();

  if (orderUpdateError || !paidOrder) {
    return { ok: false, error: "Order could not be completed." };
  }

  const { error: walletUpsertError } = await adminClient
    .from("tjfit_coin_wallets")
    .upsert({ user_id: existingOrder.user_id }, { onConflict: "user_id" });
  if (walletUpsertError) {
    console.error("fulfillProgramOrderPaid: wallet upsert failed", walletUpsertError);
    return { ok: false, error: "Failed to initialize coin wallet." };
  }

  const { data: walletBefore, error: walletFetchError } = await adminClient
    .from("tjfit_coin_wallets")
    .select("balance,lifetime_earned,lifetime_spent")
    .eq("user_id", existingOrder.user_id)
    .single();
  if (walletFetchError || !walletBefore) {
    console.error("fulfillProgramOrderPaid: wallet fetch failed", walletFetchError);
    return { ok: false, error: "Failed to read coin wallet." };
  }

  const walletBalance = walletBefore.balance ?? 0;
  const lifetimeEarned = walletBefore.lifetime_earned ?? 0;
  const lifetimeSpent = walletBefore.lifetime_spent ?? 0;

  const { error: walletUpdateError } = await adminClient
    .from("tjfit_coin_wallets")
    .update({
      balance: walletBalance + rewardAmount,
      lifetime_earned: lifetimeEarned + rewardAmount,
      lifetime_spent: lifetimeSpent,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", existingOrder.user_id)
    .eq("balance", walletBalance);
  if (walletUpdateError) {
    console.error("fulfillProgramOrderPaid: wallet update failed", walletUpdateError);
    return { ok: false, error: "Failed to update coin wallet." };
  }

  const { error: ledgerError } = await adminClient.from("tjfit_coin_ledger").insert({
    user_id: existingOrder.user_id,
    delta: rewardAmount,
    reason: "program_purchase",
    order_id: existingOrder.id,
    metadata: { source: "checkout_fulfill", coinsPerProgram: rewardAmount }
  });
  if (ledgerError) {
    console.error("fulfillProgramOrderPaid: ledger insert failed", ledgerError);
    // Non-fatal: coins were credited to wallet; ledger is for history only
  }

  if (paidOrder.discount_code) {
    const { error: discountUpdateError } = await adminClient
      .from("tjfit_discount_codes")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
        order_id: existingOrder.id
      })
      .eq("code", paidOrder.discount_code)
      .eq("user_id", existingOrder.user_id)
      .eq("status", "available");
    if (discountUpdateError) {
      console.error("fulfillProgramOrderPaid: discount code update failed", discountUpdateError);
      // Non-fatal: order is already paid; discount code may remain in an inconsistent state
    }
  }

  return { ok: true, coinsEarned: rewardAmount };
}
