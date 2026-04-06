import { NextRequest, NextResponse } from "next/server";
import { generateDiscountCode } from "@/lib/tjfit-coin";
import { readRequestJson } from "@/lib/read-request-json";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
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
  const offerKey = String(body.offerKey ?? "").trim();
  if (!offerKey) {
    return NextResponse.json({ error: "offerKey is required" }, { status: 400 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  await adminClient.from("tjfit_coin_wallets").upsert({ user_id: user.id }, { onConflict: "user_id" });

  const { data: offer } = await adminClient
    .from("tjfit_discount_offers")
    .select("key,title,coin_cost,discount_percent,active")
    .eq("key", offerKey)
    .eq("active", true)
    .maybeSingle();

  if (!offer) {
    return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  }

  // Supabase update does not support arithmetic update directly.
  // Fetch current and apply safe decrement manually with a compare-and-set step.
  const { data: wallet } = await adminClient
    .from("tjfit_coin_wallets")
    .select("balance,lifetime_earned,lifetime_spent")
    .eq("user_id", user.id)
    .single();

  if (!wallet || wallet.balance < offer.coin_cost) {
    return NextResponse.json({ error: "Insufficient TJFITcoin balance" }, { status: 400 });
  }

  const { data: finalWallet, error: walletUpdateError } = await adminClient
    .from("tjfit_coin_wallets")
    .update({
      balance: wallet.balance - offer.coin_cost,
      lifetime_spent: wallet.lifetime_spent + offer.coin_cost,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id)
    .eq("balance", wallet.balance)
    .select("balance,lifetime_earned,lifetime_spent")
    .single();

  if (walletUpdateError || !finalWallet) {
    return NextResponse.json({ error: "Please retry redeeming this offer." }, { status: 409 });
  }

  const code = generateDiscountCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await adminClient.from("tjfit_discount_codes").insert({
    code,
    user_id: user.id,
    offer_key: offer.key,
    discount_percent: offer.discount_percent,
    status: "available"
  });

  await adminClient.from("user_discount_codes").insert({
    user_id: user.id,
    code,
    discount_percent: offer.discount_percent,
    product_type: String(offer.key).includes("diet")
      ? "diet"
      : String(offer.key).includes("program")
        ? "program"
        : String(offer.key).includes("bundle")
          ? "bundle"
          : "any",
    coins_spent: offer.coin_cost,
    redeemed_at: new Date().toISOString(),
    expires_at: expiresAt,
    status: "available"
  });

  await adminClient.from("tjfit_coin_ledger").insert({
    user_id: user.id,
    delta: -offer.coin_cost,
    reason: "discount_code_redeem",
    metadata: { offerKey: offer.key, discountPercent: offer.discount_percent, code }
  });

  return NextResponse.json({ code, offer, wallet: finalWallet });
}
