import { NextRequest, NextResponse } from "next/server";

import { fulfillProgramOrderPaid } from "@/lib/checkout-fulfill-order";
import { paddleLogDebug, paddleLogError, paddleLogWarn, redactPaddleId } from "@/lib/paddle-safe-log";
import { sendApexRenewalEmail, sendProMonthlyProgramEmail } from "@/lib/pro-renewal-email";
import { verifyPaddleWebhookSignature } from "@/lib/paddle-webhook-verify";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function extractTjfitOrderId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  const cd = (data as { custom_data?: unknown }).custom_data;
  if (!cd || typeof cd !== "object") return null;
  const id = (cd as { tjfit_order_id?: unknown }).tjfit_order_id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

function extractEventType(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const t = (payload as { event_type?: unknown }).event_type;
  return typeof t === "string" ? t : null;
}

function extractEventId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const id = (payload as { event_id?: unknown }).event_id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

function extractTransactionId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  const id = (data as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

function extractEntityId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object") return null;
  const id = (data as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/**
 * Paddle Billing notification destination URL.
 * Subscribe to `transaction.completed` and `subscription.renewed`.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    paddleLogWarn("webhook", "PADDLE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const sig =
    request.headers.get("paddle-signature") ?? request.headers.get("Paddle-Signature");

  paddleLogDebug("webhook", "incoming POST", {
    bodyBytes: Buffer.byteLength(rawBody, "utf8"),
    hasSignatureHeader: Boolean(sig)
  });

  if (!verifyPaddleWebhookSignature(rawBody, sig, secret)) {
    paddleLogWarn("webhook", "signature verification failed", {
      bodyBytes: Buffer.byteLength(rawBody, "utf8"),
      hasSignatureHeader: Boolean(sig)
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    paddleLogWarn("webhook", "invalid JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = extractEventType(payload);
  const eventId = extractEventId(payload);
  const txnId = extractTransactionId(payload);

  paddleLogDebug("webhook", "parsed event", {
    eventType: eventType ?? "(none)",
    eventId: redactPaddleId(eventId, 16),
    transactionId: redactPaddleId(txnId, 18)
  });

  const admin = getSupabaseServerClient();
  if (!admin) {
    paddleLogError("webhook", "Supabase admin client missing");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  if (eventType === "transaction.completed") {
    const orderId = extractTjfitOrderId(payload);
    if (!orderId) {
      paddleLogWarn("webhook", "transaction.completed missing custom_data.tjfit_order_id", {
        eventId: redactPaddleId(eventId, 16),
        transactionId: redactPaddleId(txnId, 18)
      });
      return NextResponse.json({ received: true, ignored: "no tjfit_order_id" });
    }

    paddleLogDebug("webhook", "fulfilling order", {
      orderId: redactPaddleId(orderId, 12),
      eventId: redactPaddleId(eventId, 16),
      transactionId: redactPaddleId(txnId, 18)
    });

    const result = await fulfillProgramOrderPaid(admin, orderId, { requirePaddleLiveOrder: true });
    if (!result.ok) {
      paddleLogError("webhook", "fulfillProgramOrderPaid failed", {
        orderId: redactPaddleId(orderId, 12),
        eventId: redactPaddleId(eventId, 16),
        transactionId: redactPaddleId(txnId, 18),
        error: result.error
      });
      return NextResponse.json({ received: true, fulfillError: result.error });
    }

    paddleLogDebug("webhook", "fulfillment ok", {
      orderId: redactPaddleId(orderId, 12),
      alreadyPaid: result.alreadyPaid ?? false
    });

    return NextResponse.json({ received: true, fulfilled: true, alreadyPaid: result.alreadyPaid ?? false });
  }

  if (eventType === "subscription.renewed") {
    const subscriptionId = extractEntityId(payload);
    if (!subscriptionId) return NextResponse.json({ received: true, ignored: "no subscription id" });
    const { data: subscription } = await admin
      .from("user_subscriptions")
      .select("user_id,tier")
      .eq("paddle_subscription_id", subscriptionId)
      .maybeSingle();
    if (!subscription?.user_id) {
      return NextResponse.json({ received: true, ignored: "subscription not linked" });
    }
    const userLookup = await admin.auth.admin.getUserById(subscription.user_id);
    const email = userLookup.data.user?.email;
    if (!email) return NextResponse.json({ received: true, ignored: "user email missing" });

    if (subscription.tier === "pro") {
      const { data: lastPlan } = await admin
        .from("saved_tjai_plans")
        .select("answers_json")
        .eq("user_id", subscription.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      await sendProMonthlyProgramEmail({
        userId: subscription.user_id,
        email,
        answers: (lastPlan?.answers_json as Record<string, unknown> | null | undefined) ?? null
      });
      return NextResponse.json({ received: true, processed: "pro_renewal_email_sent" });
    }

    if (subscription.tier === "apex") {
      await sendApexRenewalEmail(subscription.user_id, email);
      return NextResponse.json({ received: true, processed: "apex_renewal_email_sent" });
    }
    return NextResponse.json({ received: true, ignored: "non-pro-apex-tier" });
  }

  paddleLogDebug("webhook", "ignored event type", { eventType: eventType ?? "unknown" });
  return NextResponse.json({ received: true, ignored: eventType ?? "unknown" });
}
