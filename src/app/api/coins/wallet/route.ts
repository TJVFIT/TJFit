import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Skip per-request upsert. The wallet is created on first earn/redeem;
  // until then this endpoint just returns the safe default. Previously
  // every GET (e.g. a polling client) wrote to the wallets table, which
  // burned writes for no value.
  const [walletResult, ledgerResult, offersResult, codesResult] = await Promise.all([
    adminClient
      .from("tjfit_coin_wallets")
      .select("balance,lifetime_earned,lifetime_spent")
      .eq("user_id", user.id)
      .maybeSingle(),
    adminClient
      .from("tjfit_coin_ledger")
      .select("id,delta,reason,metadata,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    adminClient
      .from("tjfit_discount_offers")
      .select("key,title,coin_cost,discount_percent,active")
      .eq("active", true)
      .order("coin_cost", { ascending: true }),
    adminClient
      .from("tjfit_discount_codes")
      .select("code,offer_key,discount_percent,status,created_at")
      .eq("user_id", user.id)
      .eq("status", "available")
      .order("created_at", { ascending: false })
  ]);

  return NextResponse.json({
    wallet: walletResult.data ?? { balance: 0, lifetime_earned: 0, lifetime_spent: 0 },
    ledger: ledgerResult.data ?? [],
    offers: offersResult.data ?? [],
    codes: codesResult.data ?? []
  });
  } catch (err) {
    console.error("Wallet route crash:", err);
    return NextResponse.json({ wallet: { balance: 0, lifetime_earned: 0, lifetime_spent: 0 }, ledger: [], offers: [], codes: [] });
  }
}
