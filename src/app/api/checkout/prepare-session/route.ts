import { NextRequest, NextResponse } from "next/server";

import { paddleCreateTransaction } from "@/lib/paddle-api";
import { isPaddleServerConfigured, parsePaddlePriceMap } from "@/lib/paddle-config";
import { getPaddlePriceIdForProgramSlug } from "@/lib/paddle-prices";
import { paddleLogDebug, redactPaddleId } from "@/lib/paddle-safe-log";
import { isPaddleLiveCheckoutStored } from "@/lib/payments/stored-provider";
import { readRequestJson } from "@/lib/read-request-json";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const TJFIT_ORDER_CUSTOM_KEY = "tjfit_order_id";

/**
 * Creates a Paddle Billing transaction and returns `transactionId` for Paddle.js
 * `Paddle.Checkout.open({ transactionId })`.
 */
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
  const orderId = String(body.orderId ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data: order } = await adminClient
    .from("program_orders")
    .select("id,user_id,status,provider,program_slug,discount_percent,discount_code")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "pending") {
    return NextResponse.json({ error: "Order is not awaiting payment." }, { status: 409 });
  }

  if (order.provider === "test") {
    return NextResponse.json(
      {
        error:
          "This order uses test checkout. Complete it with the simulated flow — Paddle is not used for test orders."
      },
      { status: 400 }
    );
  }

  if (!isPaddleLiveCheckoutStored(order.provider)) {
    return NextResponse.json(
      { error: "This order cannot be paid with Paddle (unrecognized provider)." },
      { status: 400 }
    );
  }

  if (!isPaddleServerConfigured()) {
    return NextResponse.json(
      {
        code: "PADDLE_NOT_CONFIGURED",
        error: "Set PADDLE_API_KEY and map catalog prices via PADDLE_PRICE_MAP or PADDLE_DEFAULT_PRICE_ID."
      },
      { status: 503 }
    );
  }

  const map = parsePaddlePriceMap();
  const priceId = getPaddlePriceIdForProgramSlug(order.program_slug);
  const priceSource = map[order.program_slug]
    ? "PADDLE_PRICE_MAP"
    : process.env.PADDLE_DEFAULT_PRICE_ID?.trim()
      ? "PADDLE_DEFAULT_PRICE_ID"
      : "(none)";

  if (!priceId) {
    paddleLogDebug("prepare-session", "no price id for slug", {
      programSlug: order.program_slug,
      mapEntryCount: Object.keys(map).length,
      hasDefault: Boolean(process.env.PADDLE_DEFAULT_PRICE_ID?.trim())
    });
    return NextResponse.json(
      {
        error: `No Paddle price configured for program "${order.program_slug}". Add it to PADDLE_PRICE_MAP or set PADDLE_DEFAULT_PRICE_ID.`
      },
      { status: 400 }
    );
  }

  const discountPercent = Number(order.discount_percent ?? 0);
  const paddleDiscountId =
    discountPercent > 0 ? process.env.PADDLE_WALLET_DISCOUNT_ID?.trim() || null : null;

  paddleLogDebug("prepare-session", "creating Paddle transaction", {
    orderId: redactPaddleId(order.id, 12),
    programSlug: order.program_slug,
    priceSource,
    priceId: redactPaddleId(priceId, 16),
    discountPercent,
    hasPaddleDiscountId: Boolean(paddleDiscountId)
  });

  const created = await paddleCreateTransaction({
    items: [{ priceId, quantity: 1 }],
    customData: {
      [TJFIT_ORDER_CUSTOM_KEY]: order.id,
      tjfit_user_id: user.id,
      tjfit_program_slug: order.program_slug
    },
    discountId: paddleDiscountId
  });

  if ("error" in created) {
    return NextResponse.json({ error: created.error }, { status: 502 });
  }

  paddleLogDebug("prepare-session", "transaction ready for checkout.open", {
    orderId: redactPaddleId(order.id, 12),
    transactionId: redactPaddleId(created.id, 18)
  });

  return NextResponse.json({
    transactionId: created.id,
    customerEmail: user.email ?? undefined
  });
}
