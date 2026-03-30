import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = String(body?.orderId ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data: existingOrder } = await adminClient
    .from("program_orders")
    .select("id,user_id,status,discount_code")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (existingOrder.status === "paid") {
    const { data: wallet } = await adminClient
      .from("tjfit_coin_wallets")
      .select("balance,lifetime_earned,lifetime_spent")
      .eq("user_id", user.id)
      .single();
    return NextResponse.json({
      success: true,
      alreadyPaid: true,
      wallet: wallet ?? { balance: 0, lifetime_earned: 0, lifetime_spent: 0 }
    });
  }

  const { data: paidOrder, error: orderUpdateError } = await adminClient
    .from("program_orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      tjfit_coins_earned: TJFIT_COINS_PER_PROGRAM_PURCHASE
    })
    .eq("id", existingOrder.id)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .select("id,discount_code")
    .single();

  if (orderUpdateError || !paidOrder) {
    return NextResponse.json({ error: "Order could not be completed." }, { status: 409 });
  }

  await adminClient.from("tjfit_coin_wallets").upsert({ user_id: user.id }, { onConflict: "user_id" });

  const { data: walletBefore } = await adminClient
    .from("tjfit_coin_wallets")
    .select("balance,lifetime_earned,lifetime_spent")
    .eq("user_id", user.id)
    .single();

  const walletBalance = walletBefore?.balance ?? 0;
  const lifetimeEarned = walletBefore?.lifetime_earned ?? 0;
  const lifetimeSpent = walletBefore?.lifetime_spent ?? 0;

  const { data: walletAfter } = await adminClient
    .from("tjfit_coin_wallets")
    .update({
      balance: walletBalance + TJFIT_COINS_PER_PROGRAM_PURCHASE,
      lifetime_earned: lifetimeEarned + TJFIT_COINS_PER_PROGRAM_PURCHASE,
      lifetime_spent: lifetimeSpent,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id)
    .eq("balance", walletBalance)
    .select("balance,lifetime_earned,lifetime_spent")
    .single();

  await adminClient.from("tjfit_coin_ledger").insert({
    user_id: user.id,
    delta: TJFIT_COINS_PER_PROGRAM_PURCHASE,
    reason: "program_purchase",
    order_id: existingOrder.id,
    metadata: { source: "checkout_complete", coinsPerProgram: TJFIT_COINS_PER_PROGRAM_PURCHASE }
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
      .eq("user_id", user.id)
      .eq("status", "available");
  }

  return NextResponse.json({
    success: true,
    coinsEarned: TJFIT_COINS_PER_PROGRAM_PURCHASE,
    wallet: walletAfter ?? walletBefore ?? { balance: 0, lifetime_earned: 0, lifetime_spent: 0 }
  });
}
