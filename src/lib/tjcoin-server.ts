import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { TJCoinRewardReason } from "@/lib/tjcoin-events";

type AwardOptions = {
  metadata?: Record<string, unknown>;
  category?: string;
  allowNegative?: boolean;
};

// TJCoin retired. Set TJFIT_COIN_LEGACY=true to re-enable coin grants.
const COIN_LEGACY_ENABLED = process.env.TJFIT_COIN_LEGACY === "true";

export async function awardTJCoin(userId: string, reason: TJCoinRewardReason | string, amount: number, options?: AwardOptions) {
  if (!COIN_LEGACY_ENABLED) {
    return { ok: true as const, wallet: null, notification: null };
  }

  if (!userId) {
    return { ok: false as const, error: "Missing user id" };
  }

  if (!Number.isFinite(amount) || (!options?.allowNegative && amount < 0)) {
    return { ok: false as const, error: "Invalid amount" };
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return { ok: false as const, error: "Server not configured" };
  }

  await adminClient.from("tjfit_coin_wallets").upsert({ user_id: userId }, { onConflict: "user_id" });

  const { data: wallet } = await adminClient
    .from("tjfit_coin_wallets")
    .select("balance,lifetime_earned,lifetime_spent")
    .eq("user_id", userId)
    .single();

  const prevBalance = wallet?.balance ?? 0;
  // Spends (negative, allowNegative) must not silently clamp an over-spend to
  // zero — reject if the balance can't cover it. Awards never reach this since
  // a positive amount on a non-negative balance is always >= 0.
  if (amount < 0 && prevBalance + amount < 0) {
    return { ok: false as const, error: "Insufficient TJCOIN balance" };
  }
  const nextBalance = Math.max(0, prevBalance + amount);
  const earnedDelta = amount > 0 ? amount : 0;
  const spentDelta = amount < 0 ? Math.abs(amount) : 0;

  const { data: updatedWallet, error: updateError } = await adminClient
    .from("tjfit_coin_wallets")
    .update({
      balance: nextBalance,
      lifetime_earned: (wallet?.lifetime_earned ?? 0) + earnedDelta,
      lifetime_spent: (wallet?.lifetime_spent ?? 0) + spentDelta,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", userId)
    .eq("balance", prevBalance)
    .select("balance,lifetime_earned,lifetime_spent")
    .single();

  if (updateError || !updatedWallet) {
    return { ok: false as const, error: "Failed to update wallet" };
  }

  await adminClient.from("tjfit_coin_ledger").insert({
    user_id: userId,
    delta: amount,
    reason,
    category: options?.category ?? "general",
    metadata: options?.metadata ?? {}
  });

  return {
    ok: true as const,
    wallet: updatedWallet,
    notification: {
      type: amount >= 0 ? "coins" : "purchase",
      message: `${amount >= 0 ? "+" : ""}${amount} TJCOIN`
    }
  };
}

