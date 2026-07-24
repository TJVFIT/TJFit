import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/require-auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  exceedsDeclaredBodySize,
  isTrustedMutationRequest
} from "@/lib/request-security";

type RedemptionResult = {
  code: string;
  offer: {
    key: string;
    title: string;
    coin_cost: number;
    discount_percent: number;
    active: boolean;
  };
  wallet: {
    balance: number;
    lifetime_earned: number;
    lifetime_spent: number;
  };
  idempotent: boolean;
};

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (exceedsDeclaredBodySize(request, 8 * 1024)) {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }

  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const limiter = await rateLimit({
    key: `coin-redeem:${auth.user.id}`,
    limit: 10,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json(
      { error: "Too many redemption attempts." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limiter.resetAt - Date.now()) / 1000)) }
      }
    );
  }

  const body = await request.json().catch(() => null);
  const offerKey = String(body?.offerKey ?? "").trim();
  if (!/^[a-z0-9_-]{1,64}$/.test(offerKey)) {
    return NextResponse.json({ error: "A valid offerKey is required." }, { status: 400 });
  }

  const idempotencyHeader = request.headers.get("idempotency-key")?.trim() ?? "";
  if (
    idempotencyHeader &&
    !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyHeader)
  ) {
    return NextResponse.json({ error: "Invalid Idempotency-Key header." }, { status: 400 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data, error: redeemError } = await adminClient.rpc("redeem_tjfit_discount", {
    p_user_id: auth.user.id,
    p_offer_key: offerKey,
    p_idempotency_key: idempotencyHeader || null
  });

  if (redeemError) {
    if (redeemError.code === "TJ001") {
      return NextResponse.json({ error: "Insufficient TJFITcoin balance." }, { status: 400 });
    }
    if (redeemError.code === "TJ002") {
      return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "The offer could not be redeemed. Please retry." },
      { status: 409 }
    );
  }

  const result = data as RedemptionResult | null;
  if (!result?.code || !result.offer || !result.wallet) {
    return NextResponse.json(
      { error: "The offer could not be redeemed. Please retry." },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { code: result.code, offer: result.offer, wallet: result.wallet },
    { headers: { "Cache-Control": "no-store" } }
  );
}
