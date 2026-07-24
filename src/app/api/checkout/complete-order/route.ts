import { NextRequest, NextResponse } from "next/server";

import { fulfillProgramOrderPaid } from "@/lib/checkout-fulfill-order";
import { allowsSimulatedPaidCompletionForStoredProvider } from "@/lib/payments";
import { readRequestJson } from "@/lib/read-request-json";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";

export async function POST(request: NextRequest) {
  if (process.env.ALLOW_TEST_CHECKOUT !== "true") {
    return NextResponse.json(
      { error: "Test order completion is disabled in this environment." },
      { status: 403 }
    );
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const orderId = String(body.orderId ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data: existingOrder } = await adminClient
    .from("program_orders")
    .select("id,user_id,status,discount_code,provider")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!allowsSimulatedPaidCompletionForStoredProvider(existingOrder.provider)) {
    return NextResponse.json(
      { error: "This order cannot be completed from the browser. Use the configured payment gateway." },
      { status: 403 }
    );
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

  const fulfilled = await fulfillProgramOrderPaid(adminClient, existingOrder.id);
  if (!fulfilled.ok) {
    return NextResponse.json({ error: fulfilled.error }, { status: 409 });
  }

  const { data: walletAfter } = await adminClient
    .from("tjfit_coin_wallets")
    .select("balance,lifetime_earned,lifetime_spent")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    success: true,
    coinsEarned: fulfilled.coinsEarned ?? TJFIT_COINS_PER_PROGRAM_PURCHASE,
    wallet: walletAfter ?? { balance: 0, lifetime_earned: 0, lifetime_spent: 0 }
  });
}
