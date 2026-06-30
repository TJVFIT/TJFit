import { NextRequest, NextResponse } from "next/server";

import { checkGumroadWebhookFreshness, verifyGumroadSeller } from "@/lib/gumroad-webhook-verify";
import { getSale } from "@/lib/gumroad/client";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { handleSale, type GumroadSalePayload } from "./handlers/sale";

export const dynamic = "force-dynamic";

// Gumroad webhook endpoint.
//
// Per founder direction: Gumroad is the primary merchant of record
// after Gumroad/Stripe rejections. This route receives lifecycle
// events and routes them to the right handlers.
//
// Verification model (IMPORTANT — Gumroad ≠ Stripe/Paddle):
//   Gumroad Ping / Resource-Subscription webhooks are NOT HMAC-signed.
//   They arrive as application/x-www-form-urlencoded params and carry
//   the account `seller_id`. We verify in two layers:
//     1. seller_id must match GUMROAD_SELLER_ID (cheap reject of spam).
//     2. For `sale` events the sale_id is re-fetched from the Gumroad
//        API and that authoritative record — not the POST body — drives
//        fulfillment. This makes forged "free credit" pings impossible:
//        an attacker can't fabricate a sale_id that exists in our
//        Gumroad account.
//
// Idempotency: every event is logged to `payment_webhooks` keyed on
// (provider, event_id). Re-deliveries are short-circuited so retries
// from Gumroad don't double-grant access.

type GumroadEventBody = {
  // Gumroad uses different field names in different event types;
  // we capture loosely and let handlers narrow.
  resource_name?: string;
  seller_id?: string;
  sale_id?: string;
  subscription_id?: string;
  product_permalink?: string;
  permalink?: string;
  product_id?: string;
  product_name?: string;
  email?: string;
  full_name?: string;
  price?: string | number;
  currency?: string;
  sale_timestamp?: string;
  test?: boolean | string;
  url_params?: Record<string, string>;
  // Custom fields configured per product — we use this to carry the
  // TJFit user_id and the canonical product slug.
  custom_fields?: Record<string, string>;
};

/**
 * Parse a Gumroad webhook body. Gumroad sends
 * application/x-www-form-urlencoded with bracket notation for nested
 * objects (e.g. `custom_fields[tjfit_user_id]=...`). We also accept
 * JSON so tests and any future Gumroad change keep working.
 */
function parseGumroadBody(rawBody: string, contentType: string): GumroadEventBody {
  if (contentType.includes("application/json")) {
    return JSON.parse(rawBody) as GumroadEventBody;
  }
  const params = new URLSearchParams(rawBody);
  const obj: Record<string, unknown> = {};
  for (const [key, value] of params.entries()) {
    const nested = key.match(/^([^[]+)\[([^\]]+)\]$/);
    if (nested) {
      const [, parent, child] = nested;
      const bucket = (obj[parent] as Record<string, string> | undefined) ?? {};
      bucket[child] = value;
      obj[parent] = bucket;
    } else {
      obj[key] = value;
    }
  }
  return obj as GumroadEventBody;
}

function readEventId(body: GumroadEventBody, headers: Headers): string {
  // Gumroad doesn't always include a top-level event_id; build a
  // stable composite from sale_id / subscription_id + resource_name.
  const headerId = headers.get("x-gumroad-event-id");
  if (headerId) return headerId;
  const parts = [
    body.resource_name ?? "sale",
    body.sale_id ?? "",
    body.subscription_id ?? "",
    body.product_permalink ?? body.permalink ?? body.product_id ?? ""
  ].filter(Boolean);
  return parts.join(":") || `unidentified:${Date.now()}`;
}

export async function POST(request: NextRequest) {
  const expectedSeller = process.env.GUMROAD_SELLER_ID?.trim();
  if (!expectedSeller) {
    console.warn("[gumroad webhook] GUMROAD_SELLER_ID not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const contentType = request.headers.get("content-type") ?? "";

  let payload: GumroadEventBody;
  try {
    payload = parseGumroadBody(rawBody, contentType);
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Layer 1: seller_id gate.
  if (!verifyGumroadSeller(payload.seller_id, expectedSeller)) {
    console.warn("[gumroad webhook] seller_id verification failed");
    return NextResponse.json({ error: "Invalid seller" }, { status: 401 });
  }

  // Replay-window check (best-effort — idempotency on (provider,
  // event_id) is the primary defense; this is defense-in-depth).
  const freshness = checkGumroadWebhookFreshness(payload);
  if (!freshness.ok) {
    console.warn("[gumroad webhook] freshness check failed", freshness.reason);
    return NextResponse.json({ error: "Webhook too old", reason: freshness.reason }, { status: 400 });
  }

  // A dashboard Ping for a sale has no `resource_name`; infer it.
  const eventType = payload.resource_name ?? (payload.sale_id ? "sale" : "unknown");
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
      signature: payload.seller_id ?? null,
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

  let status: "processed" | "ignored" | "failed" = "ignored";
  let handlerError: string | null = null;

  try {
    switch (eventType) {
      case "sale": {
        // Layer 2: re-fetch the sale from Gumroad's API and fulfill from
        // that authoritative record, not the (forgeable) POST body.
        const saleId = payload.sale_id?.trim();
        if (!saleId) {
          status = "failed";
          handlerError = "sale event without sale_id";
          break;
        }

        let confirmed;
        try {
          confirmed = await getSale(saleId);
        } catch (err) {
          status = "failed";
          handlerError = `gumroad_api_verify: ${err instanceof Error ? err.message : String(err)}`;
          break;
        }

        if (!confirmed) {
          status = "failed";
          handlerError = `sale ${saleId} not found in Gumroad — possible forgery, not fulfilled`;
          break;
        }
        if (confirmed.refunded) {
          status = "ignored";
          break;
        }

        const salePayload: GumroadSalePayload = {
          resource_name: "sale",
          sale_id: confirmed.id,
          product_id: confirmed.product_id,
          product_permalink: confirmed.permalink,
          email: confirmed.email,
          full_name: confirmed.full_name,
          price: confirmed.price,
          gumroad_fee: confirmed.gumroad_fee,
          currency: confirmed.currency,
          custom_fields: confirmed.custom_fields,
          test: payload.test === true || payload.test === "true"
        };

        const result = await handleSale(salePayload, admin);
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
