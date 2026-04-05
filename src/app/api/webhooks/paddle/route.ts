import { NextRequest, NextResponse } from "next/server";

import { fulfillProgramOrderPaid } from "@/lib/checkout-fulfill-order";
import { paddleLogDebug, paddleLogError, paddleLogWarn, redactPaddleId } from "@/lib/paddle-safe-log";
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

/**
 * Paddle Billing notification destination URL.
 * Subscribe to `transaction.completed` in Paddle → Developer tools → Notifications.
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

  if (eventType !== "transaction.completed") {
    paddleLogDebug("webhook", "ignored event type", { eventType: eventType ?? "unknown" });
    return NextResponse.json({ received: true, ignored: eventType ?? "unknown" });
  }

  const orderId = extractTjfitOrderId(payload);
  if (!orderId) {
    paddleLogWarn("webhook", "transaction.completed missing custom_data.tjfit_order_id", {
      eventId: redactPaddleId(eventId, 16),
      transactionId: redactPaddleId(txnId, 18)
    });
    return NextResponse.json({ received: true, ignored: "no tjfit_order_id" });
  }

  const admin = getSupabaseServerClient();
  if (!admin) {
    paddleLogError("webhook", "Supabase admin client missing");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
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
