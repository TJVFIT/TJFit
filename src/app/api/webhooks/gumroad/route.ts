import { NextRequest, NextResponse } from "next/server";

import { verifyGumroadWebhookSignature } from "@/lib/gumroad-webhook-verify";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { handleSale, type GumroadSalePayload } from "./handlers/sale";

export const dynamic = "force-dynamic";

// Gumroad webhook endpoint (master upgrade prompt v2, Phase 2.3).
//
// Per founder direction: Gumroad is the primary merchant of record
// after Paddle/Stripe rejections. This route receives lifecycle
// events and routes them to the right handlers.
//
// Subscribe to (in Gumroad dashboard): sale, refund, cancellation,
// subscription_restarted, subscription_updated, subscription_ended.
//
// Idempotency: every event is logged to `payment_webhooks` keyed on
// (provider, event_id). Re-deliveries are short-circuited so retries
// from Gumroad don't double-grant access.

type GumroadEventBody = {
  // Gumroad uses different field names in different event types;
  // we capture loosely and let handlers narrow.
  resource_name?: string;
  sale_id?: string;
  subscription_id?: string;
  product_permalink?: string;
  product_id?: string;
  product_name?: string;
  email?: string;
  full_name?: string;
  price?: string | number;
  currency?: string;
  test?: boolean;
  url_params?: Record<string, string>;
  // Custom fields configured per product — we use this to carry the
  // TJFit user_id and the canonical product slug.
  custom_fields?: Record<string, string>;
};

function readEventId(body: GumroadEventBody, headers: Headers): string {
  // Gumroad doesn't always include a top-level event_id; build a
  // stable composite from sale_id / subscription_id + resource_name.
  const headerId = headers.get("x-gumroad-event-id");
  if (headerId) return headerId;
  const parts = [
    body.resource_name ?? "unknown",
    body.sale_id ?? "",
    body.subscription_id ?? "",
    body.product_permalink ?? body.product_id ?? ""
  ].filter(Boolean);
  return parts.join(":") || `unidentified:${Date.now()}`;
}

export async function POST(request: NextRequest) {
  const secret = process.env.GUMROAD_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.warn("[gumroad webhook] GUMROAD_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-gumroad-signature") ??
    request.headers.get("X-Gumroad-Signature");

  const signatureValid = verifyGumroadWebhookSignature(rawBody, signature, secret);
  if (!signatureValid) {
    console.warn("[gumroad webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: GumroadEventBody;
  try {
    payload = JSON.parse(rawBody) as GumroadEventBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.resource_name ?? "unknown";
  const eventId = readEventId(payload, request.headers);

  const admin = getSupabaseServerClient();
  if (!admin) {
    console.error("[gumroad webhook] supabase admin client missing");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Idempotency: insert (gumroad, event_id) — if it conflicts the
  // event has been seen before, return ok without reprocessing.
  const { data: insertResult, error: insertError } = await admin
    .from("payment_webhooks")
    .insert({
      provider: "gumroad",
      event_id: eventId,
      event_type: eventType,
      raw_payload: payload,
      signature: signature ?? null,
      signature_valid: true,
      status: "received"
    })
    .select("id")
    .maybeSingle();

  if (insertError) {
    // Most likely a duplicate (unique violation on (provider, event_id))
    // — treat as success but mark in logs.
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, deduped: true });
    }
    console.error("[gumroad webhook] failed to log webhook", insertError);
    return NextResponse.json({ received: true, logError: insertError.message });
  }

  const webhookRowId = insertResult?.id ?? null;

  // Route to handler. Handlers stub for now — the canonical
  // fulfillment flow lives in src/lib/checkout-fulfill-order.ts and
  // can be wired here once Gumroad product IDs are mapped to TJFit
  // SKUs in env (GUMROAD_PRODUCT_<SKU>=<id>).
  let status: "processed" | "ignored" | "failed" = "ignored";
  let handlerError: string | null = null;

  try {
    switch (eventType) {
      case "sale": {
        // v5 round 2 — wired. Routes credit-pack purchases to
        // grant_tjai_credit RPC; routes program/diet purchases to a
        // sale_commissions row with the resolved 5-tier split.
        const result = await handleSale(payload as GumroadSalePayload, admin);
        if (result.ok) {
          status = "processed";
        } else {
          status = "failed";
          handlerError = `sale[${result.action}]: ${result.error}`;
        }
        break;
      }
      case "refund": {
        // TODO: mark order refunded, revoke access, emit audit log.
        status = "ignored";
        break;
      }
      case "subscription": {
        // Covers subscription_started, subscription_updated,
        // subscription_restarted, subscription_ended depending on
        // payload.subscription state. Update user_subscriptions.
        status = "ignored";
        break;
      }
      case "cancellation": {
        // Set subscription_active_until to current period end; do
        // NOT immediately revoke (let user finish their cycle).
        status = "ignored";
        break;
      }
      default: {
        status = "ignored";
        break;
      }
    }
  } catch (err) {
    status = "failed";
    handlerError = err instanceof Error ? err.message : String(err);
    console.error("[gumroad webhook] handler error", { eventType, eventId, error: handlerError });
  }

  if (webhookRowId) {
    await admin
      .from("payment_webhooks")
      .update({
        status,
        handler_error: handlerError,
        processed_at: new Date().toISOString()
      })
      .eq("id", webhookRowId);
  }

  return NextResponse.json({ received: true, eventType, status });
}
