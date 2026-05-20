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

  // Atomic redeem via Postgres function. Wallet debit + ledger insert +
  // discount-code generation all share one transaction frame, so any failure
  // rolls back the wallet debit. The previous step-by-step JS implementation
  // could leave the user with deducted coins and no discount code.
  const code = generateDiscountCode();
  const { data: rpcRows, error: rpcError } = await adminClient.rpc("tjfit_redeem_discount", {
    p_user_id: user.id,
    p_offer_key: offerKey,
    p_code: code,
    p_ttl_days: 7
  });

  if (rpcError) {
    console.error("coins/redeem: rpc failed", rpcError);
    return NextResponse.json(
      { error: "Could not redeem offer. Please try again." },
      { status: 500 }
    );
  }

  const result = (Array.isArray(rpcRows) ? rpcRows[0] : rpcRows) as
    | {
        ok?: boolean;
        reason?: string;
        balance?: number;
        lifetime_earned?: number;
        lifetime_spent?: number;
        discount_percent?: number;
      }
    | null;

  if (!result?.ok) {
    if (result?.reason === "offer_not_found") {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }
    if (result?.reason === "insufficient_balance") {
      return NextResponse.json({ error: "Insufficient TJFITcoin balance" }, { status: 400 });
    }
    if (result?.reason === "wallet_missing") {
      return NextResponse.json({ error: "Wallet not found. Please try again." }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Could not redeem offer. Please try again." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    code,
    offer: {
      key: offerKey,
      discount_percent: result.discount_percent ?? 0
    },
    wallet: {
      balance: result.balance ?? 0,
      lifetime_earned: result.lifetime_earned ?? 0,
      lifetime_spent: result.lifetime_spent ?? 0
    }
  });
}
