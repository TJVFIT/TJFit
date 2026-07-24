import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured." }, { status: 503 });
  }

  const [
    { data: wallet, error: walletError },
    { data: ledger, error: ledgerError },
    { data: offers, error: offersError },
    { data: codes, error: codesError }
  ] = await Promise.all([
    adminClient
      .from("tjfit_coin_wallets")
      .select("balance,lifetime_earned,lifetime_spent")
      .eq("user_id", auth.user.id)
      .maybeSingle(),
    adminClient
      .from("tjfit_coin_ledger")
      .select("id,delta,reason,metadata,created_at")
      .eq("user_id", auth.user.id)
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
      .eq("user_id", auth.user.id)
      .eq("status", "available")
      .order("created_at", { ascending: false })
  ]);

  if (walletError || ledgerError || offersError || codesError) {
    return NextResponse.json(
      { error: "Unable to load the coin wallet." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      wallet: wallet ?? { balance: 0, lifetime_earned: 0, lifetime_spent: 0 },
      ledger: ledger ?? [],
      offers: offers ?? [],
      codes: codes ?? []
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
