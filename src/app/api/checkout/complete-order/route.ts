import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import {
  exceedsDeclaredBodySize,
  isTrustedMutationRequest
} from "@/lib/request-security";
import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export async function POST(request: NextRequest) {
  if (!isTrustedMutationRequest(request)) {
    return json({ error: "Forbidden" }, 403);
  }
  if (exceedsDeclaredBodySize(request, 2 * 1024)) {
    return json({ error: "Request body is too large." }, 413);
  }

  if (
    process.env.ALLOW_TEST_CHECKOUT !== "true" ||
    process.env.NODE_ENV === "production"
  ) {
    return json(
      { error: "Test order completion is disabled in this environment." },
      403
    );
  }

  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  try {
    supabase = await createServerSupabaseClient();
  } catch {
    return json({ error: "Authentication service is not configured." }, 503);
  }
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  const body = await request.json().catch(() => null);
  const orderId =
    body && typeof body === "object" && !Array.isArray(body)
      ? String((body as Record<string, unknown>).orderId ?? "").trim()
      : "";

  if (!UUID_PATTERN.test(orderId)) {
    return json({ error: "A valid orderId is required." }, 400);
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return json({ error: "Server not configured." }, 503);
  }

  const { data: result, error: fulfillmentError } = await adminClient.rpc(
    "fulfill_test_program_order",
    {
      p_order_id: orderId,
      p_user_id: user.id,
      p_coins_earned: TJFIT_COINS_PER_PROGRAM_PURCHASE
    }
  );

  if (fulfillmentError || !result) {
    const message = fulfillmentError?.message ?? "";
    if (message.includes("order_not_found")) {
      return json({ error: "Order not found." }, 404);
    }
    if (message.includes("invalid_order_provider")) {
      return json(
        { error: "Only local test orders can be completed directly." },
        403
      );
    }
    if (message.includes("order_not_pending")) {
      return json({ error: "Order cannot be completed." }, 409);
    }

    return json({ error: "Order could not be completed." }, 500);
  }

  const value = result as {
    result?: "paid" | "already_paid";
    wallet?: {
      balance: number;
      lifetime_earned: number;
      lifetime_spent: number;
    } | null;
  };

  return json({
    success: true,
    alreadyPaid: value.result === "already_paid",
    coinsEarned:
      value.result === "already_paid" ? 0 : TJFIT_COINS_PER_PROGRAM_PURCHASE,
    wallet: value.wallet ?? {
      balance: 0,
      lifetime_earned: 0,
      lifetime_spent: 0
    }
  });
}
