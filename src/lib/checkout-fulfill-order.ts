import type { SupabaseClient } from "@supabase/supabase-js";

import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";
import {
  isGumroadCheckoutStored,
  isLegacyCheckoutStored
} from "@/lib/payments/stored-provider";
import { TJCOIN_REWARDS } from "@/lib/tjcoin-events";

// TJCoin retired (Phase 4 cleanup). Set TJFIT_COIN_LEGACY=true to re-enable
// coin credits on program purchase. Default off — fulfillment skips the coin
// RPC and writes 0 to tjfit_coins_earned, but the column and tables remain so
// historical data is preserved.
const COIN_LEGACY_ENABLED = process.env.TJFIT_COIN_LEGACY === "true";

export type FulfillOrderResult =
  | { ok: true; alreadyPaid?: boolean; coinsEarned: number }
  | { ok: false; error: string };

/**
 * Marks a program order paid, credits TJFITcoin atomically via SQL function,
 * and consumes a wallet discount code if present. Safe under Gumroad webhook
 * redelivery: ledger uniqueness and the order status transition both guard
 * against double-effects.
 */
export async function fulfillProgramOrderPaid(
  adminClient: SupabaseClient,
  orderId: string,
  opts?: { requireLiveOrder?: boolean }
): Promise<FulfillOrderResult> {
  const rewardAmount = COIN_LEGACY_ENABLED
    ? (TJCOIN_REWARDS.program_purchase ?? TJFIT_COINS_PER_PROGRAM_PURCHASE)
    : 0;
  const { data: existingOrder, error: fetchErr } = await adminClient
    .from("program_orders")
    .select("id,user_id,status,discount_code,provider")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchErr || !existingOrder) {
    return { ok: false, error: "Order not found" };
  }

  if (
    opts?.requireLiveOrder &&
    !isGumroadCheckoutStored(existingOrder.provider) &&
    !isLegacyCheckoutStored(existingOrder.provider)
  ) {
    return { ok: false, error: "Order is not a live checkout" };
  }

  if (existingOrder.status !== "paid" && existingOrder.status !== "pending") {
    return { ok: false, error: "Order is not pending" };
  }

  let discountCode: string | null = existingOrder.discount_code ?? null;

  if (existingOrder.status === "pending") {
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
      // A concurrent webhook may have flipped status under us. Re-read; if it
      // is now paid we still need to run the (idempotent) coin grant below.
      const { data: recheck } = await adminClient
        .from("program_orders")
        .select("status,discount_code")
        .eq("id", existingOrder.id)
        .maybeSingle();
      if (recheck?.status !== "paid") {
        return { ok: false, error: "Order could not be completed." };
      }
      discountCode = recheck.discount_code ?? null;
    } else {
      discountCode = paidOrder.discount_code ?? null;
    }
  }

  // Atomic ledger insert + wallet credit. The RPC returns false if a prior
  // call already credited this order (ledger row exists via unique index).
  // Skipped entirely when TJCoin legacy mode is disabled (default).
  let granted: boolean | null = false;
  if (COIN_LEGACY_ENABLED) {
    const { data, error: grantError } = await adminClient.rpc(
      "tjfit_grant_program_purchase_coins",
      {
        p_user_id: existingOrder.user_id,
        p_order_id: existingOrder.id,
        p_amount: rewardAmount
      }
    );
    if (grantError) {
      console.error("fulfillProgramOrderPaid: coin grant rpc failed", grantError);
      // Order is already paid at this point; coin grant can be retried by next
      // webhook delivery. Return ok so we don't churn the order status.
      return { ok: true, alreadyPaid: existingOrder.status === "paid", coinsEarned: 0 };
    }
    granted = data;
  }

  if (discountCode) {
    const { error: discountUpdateError } = await adminClient
      .from("tjfit_discount_codes")
      .update({
        status: "used",
        used_at: new Date().toISOString(),
        order_id: existingOrder.id
      })
      .eq("code", discountCode)
      .eq("user_id", existingOrder.user_id)
      .eq("status", "available");
    if (discountUpdateError) {
      console.error("fulfillProgramOrderPaid: discount code update failed", discountUpdateError);
      // Non-fatal: order is already paid; discount code may remain in an inconsistent state
    }
  }

  return {
    ok: true,
    alreadyPaid: existingOrder.status === "paid",
    coinsEarned: granted === true ? rewardAmount : 0
  };
}
