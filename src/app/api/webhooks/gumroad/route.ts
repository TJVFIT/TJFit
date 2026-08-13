import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

import { checkGumroadWebhookFreshness, verifyGumroadSeller } from "@/lib/gumroad-webhook-verify";
import { rateLimit } from "@/lib/rate-limit";
import { redactEmails } from "@/lib/redact-pii";
import { getSale, type GumroadSale } from "@/lib/gumroad/client";
import { fulfillProgramOrderPaid } from "@/lib/checkout-fulfill-order";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { handleSale, findOrCreateUserByEmail, type GumroadSalePayload } from "./handlers/sale";
import { handleRefund } from "./handlers/refund";
import {
  handleSubscriptionCancellation,
  handleSubscriptionEvent
} from "./handlers/subscription";

export const dynamic = "force-dynamic";

// Real program_orders ids are UUIDs. The TJAI credits storefront stamps a
// non-UUID sentinel (e.g. "credits-plan-1") as tjfit_order_id, which must
// NOT be treated as an order to fulfil — it routes by product instead.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

/**
 * Resolve a TJFit bundle slug from the Gumroad product on a confirmed
 * sale. Matches on the Gumroad product_id first, then falls back to the
 * permalink embedded in the mapped short_url. Returns null for products
 * that aren't bundles (e.g. credit packs / diets handled elsewhere).
 */
async function resolveBundleSlug(
  admin: SupabaseClient,
  sale: GumroadSale
): Promise<string | null> {
  const productId = sale.product_id?.trim();
  if (productId) {
    const { data } = await admin
      .from("bundle_gumroad_products")
      .select("slug")
      .eq("product_id", productId)
      .maybeSingle();
    if (data?.slug) return data.slug;
  }
  const permalink = sale.permalink?.trim();
  if (permalink) {
    const { data } = await admin
      .from("bundle_gumroad_products")
      .select("slug")
      .ilike("short_url", `%/${permalink}`)
      .maybeSingle();
    if (data?.slug) return data.slug;
  }
  return null;
}

// WP-SEC-10 / WP-INFRA-11 — Sentry observability for money-affecting webhook
// failures. This endpoint has no HTTP-level error path Vercel would surface
// on its own (every branch returns 200 with `{ status: "failed" }` recorded
// only in `payment_webhooks`), so without this a fulfillment miss, a
// forgery-rejected sale, or a failed subscription upsert is invisible until
// someone thinks to query the table. Distinct `gumroad_action` tags per
// branch let a dashboard alert (see docs/runbooks/sentry-alerts.md) fire on
// `surface:gumroad-webhook` without losing which code path failed.
function reportGumroadFailure(input: {
  eventType: string;
  eventId: string;
  action: string;
  message: string;
  err?: unknown;
}): void {
  // Handler error strings can embed buyer emails (sale.ts builds
  // "unable to resolve user for <email>") — redact before anything
  // leaves for Sentry; the payment_webhooks row keeps the raw string.
  const safeMessage = redactEmails(input.message);
  Sentry.withScope((scope) => {
    scope.setTag("surface", "gumroad-webhook");
    scope.setTag("event_type", input.eventType);
    scope.setTag("gumroad_action", input.action);
    scope.setContext("gumroad_webhook", {
      event_id: input.eventId,
      event_type: input.eventType,
      action: input.action,
      message: safeMessage
    });
    if (input.err instanceof Error) {
      Sentry.captureException(input.err);
    } else {
      Sentry.captureMessage(safeMessage, "error");
    }
  });
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

  // Flood guard (WP-SEC-07): the endpoint is unauthenticated by design, so a
  // garbage flood would otherwise burn function time + Gumroad API re-verify
  // calls. 120/min per IP is orders of magnitude above real Gumroad traffic;
  // the helper fails OPEN on limiter errors, so a legitimate sale ping can
  // never be dropped by infrastructure trouble.
  const limiter = await rateLimit({
    key: `gumroad-webhook:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"}`,
    limit: 120,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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
    reportGumroadFailure({
      eventType,
      eventId,
      action: "admin_client_missing",
      message: "[gumroad webhook] supabase admin client missing"
    });
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
    reportGumroadFailure({
      eventType,
      eventId,
      action: "webhook_log_insert_failed",
      message: `[gumroad webhook] failed to log webhook: ${insertError.message}`
    });
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
          reportGumroadFailure({ eventType, eventId, action: "sale_missing_sale_id", message: handlerError });
          break;
        }

        let confirmed;
        try {
          confirmed = await getSale(saleId);
        } catch (err) {
          status = "failed";
          handlerError = `gumroad_api_verify: ${err instanceof Error ? err.message : String(err)}`;
          reportGumroadFailure({
            eventType,
            eventId,
            action: "sale_api_reverify_failed",
            message: handlerError,
            err
          });
          break;
        }

        if (!confirmed) {
          status = "failed";
          handlerError = `sale ${saleId} not found in Gumroad — possible forgery, not fulfilled`;
          reportGumroadFailure({ eventType, eventId, action: "sale_not_found_in_gumroad", message: handlerError });
          break;
        }
        if (confirmed.refunded) {
          status = "ignored";
          break;
        }

        // Resolve which bundle (if any) this confirmed Gumroad product
        // maps to. Used both to cross-check website orders and to fulfil
        // direct Gumroad-storefront purchases.
        const bundleSlug = await resolveBundleSlug(admin, confirmed);

        // Path A — website checkout. Checkout stamps the program_orders
        // id onto the Gumroad URL (buildGumroadTrackedUrl); Gumroad
        // echoes it back in url_params. Flipping that order to paid is
        // what unlocks the in-app bundle via hasPurchasedProgram. Only a
        // real (UUID) order that actually exists is handled here; anything
        // else (e.g. the "credits-*" sentinel) falls through to product
        // routing below.
        const rawOrderId = payload.url_params?.tjfit_order_id?.trim();
        const orderId = rawOrderId && UUID_RE.test(rawOrderId) ? rawOrderId : null;
        if (orderId) {
          const { data: order } = await admin
            .from("program_orders")
            .select("program_slug")
            .eq("id", orderId)
            .maybeSingle();
          if (order) {
            // Integrity check: the order being fulfilled must correspond
            // to the product actually purchased. Only enforced when we can
            // map the Gumroad product to a bundle (legacy programs map to
            // null and are trusted via the unguessable order id alone).
            if (bundleSlug && order.program_slug !== bundleSlug) {
              status = "failed";
              handlerError = `order_product_mismatch: order ${orderId} is ${order.program_slug} but sale is ${bundleSlug}`;
              reportGumroadFailure({ eventType, eventId, action: "order_product_mismatch", message: handlerError });
              break;
            }
            const fulfilled = await fulfillProgramOrderPaid(admin, orderId, { requireLiveOrder: true });
            if (fulfilled.ok) {
              status = "processed";
            } else {
              status = "failed";
              handlerError = `fulfill_order[${orderId}]: ${fulfilled.error}`;
              reportGumroadFailure({ eventType, eventId, action: "fulfill_order_failed", message: handlerError });
            }
            break;
          }
          // UUID but no such order — fall through to product routing.
        }

        // Path B — direct Gumroad-storefront purchase (no website order).
        // Grant access from the API-confirmed sale email. The buyer
        // controls that email (they paid with it), and the sale is
        // already verified against Gumroad, so this is safe. Idempotent
        // via the unique provider_order_id = sale id.
        if (bundleSlug) {
          const buyerEmail = confirmed.email?.trim().toLowerCase();
          if (!buyerEmail) {
            status = "failed";
            handlerError = "direct_purchase: confirmed sale has no email";
            reportGumroadFailure({ eventType, eventId, action: "direct_purchase_no_email", message: handlerError });
            break;
          }
          const resolved = await findOrCreateUserByEmail(admin, buyerEmail, confirmed.full_name);
          if ("error" in resolved) {
            status = "failed";
            handlerError = `direct_purchase_user: ${resolved.error}`;
            reportGumroadFailure({ eventType, eventId, action: "direct_purchase_user_resolve_failed", message: handlerError });
            break;
          }
          const { error: insErr } = await admin.from("program_orders").insert({
            user_id: resolved.userId,
            program_slug: bundleSlug,
            amount_try: 0,
            final_amount_try: 0,
            currency: confirmed.currency ?? "USD",
            provider: "gumroad",
            provider_order_id: confirmed.id,
            status: "paid",
            paid_at: new Date().toISOString()
          });
          if (insErr) {
            // 23505 = unique violation on provider_order_id: this sale was
            // already fulfilled. Treat as success.
            if (insErr.code === "23505") {
              status = "processed";
            } else {
              status = "failed";
              handlerError = `direct_purchase_insert: ${insErr.message}`;
              reportGumroadFailure({ eventType, eventId, action: "direct_purchase_insert_failed", message: handlerError });
            }
          } else {
            status = "processed";
          }
          break;
        }

        // Path C — mapped product (TJAI credit packs / diets resolved via
        // product_gumroad_sync by Gumroad product id).
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
          // Prefer the API record's url_params; fall back to the (already
          // seller-verified) webhook body so the buyer's tier / program-slug /
          // order-id selection survives even if the API omits them.
          url_params: confirmed.url_params ?? payload.url_params,
          subscription_id: confirmed.subscription_id ?? payload.subscription_id,
          recurrence: confirmed.recurrence,
          sale_timestamp: confirmed.created_at ?? payload.sale_timestamp,
          test: payload.test === true || payload.test === "true"
        };

        const result = await handleSale(salePayload, admin);
        if (result.ok) {
          status = "processed";
        } else {
          status = "failed";
          handlerError = `sale[${result.action}]: ${result.error}`;
          reportGumroadFailure({ eventType, eventId, action: `sale_handler_${result.action}`, message: handlerError });
        }
        break;
      }
      case "refund":
      case "dispute": {
        // Re-fetch the sale from Gumroad and confirm it is actually refunded
        // before revoking anything — same anti-forgery property as the sale
        // path (an attacker can't fabricate a refunded sale_id in our account).
        const saleId = payload.sale_id?.trim();
        if (!saleId) {
          status = "failed";
          handlerError = `${eventType} event without sale_id`;
          reportGumroadFailure({ eventType, eventId, action: "refund_missing_sale_id", message: handlerError });
          break;
        }
        let confirmed;
        try {
          confirmed = await getSale(saleId);
        } catch (err) {
          status = "failed";
          handlerError = `gumroad_api_verify: ${err instanceof Error ? err.message : String(err)}`;
          reportGumroadFailure({
            eventType,
            eventId,
            action: "refund_api_reverify_failed",
            message: handlerError,
            err
          });
          break;
        }
        if (!confirmed) {
          status = "failed";
          handlerError = `sale ${saleId} not found in Gumroad — cannot verify refund`;
          reportGumroadFailure({ eventType, eventId, action: "refund_sale_not_found", message: handlerError });
          break;
        }
        if (!confirmed.refunded && !confirmed.disputed) {
          // Gumroad's record shows neither a refund nor a dispute (race /
          // partial) — do not revoke access on an unverifiable claim.
          status = "ignored";
          break;
        }
        const result = await handleRefund(confirmed, payload, admin);
        if (result.ok) {
          status = "processed";
        } else {
          status = "failed";
          handlerError = `refund[${result.action}]: ${result.error}`;
          reportGumroadFailure({ eventType, eventId, action: `refund_handler_${result.action}`, message: handlerError });
        }
        break;
      }
      case "subscription":
      case "subscription_updated":
      case "subscription_restarted":
      case "subscription_ended": {
        // Post-first-charge lifecycle. Keeps user_subscriptions in sync:
        // renew/restart → active + extend period; ended → downgrade to core.
        const result = await handleSubscriptionEvent(eventType, payload, admin);
        if (result.ok) {
          status = "processed";
        } else {
          status = "failed";
          handlerError = `subscription[${result.action}]: ${result.error}`;
          reportGumroadFailure({
            eventType,
            eventId,
            action: `subscription_upsert_${result.action}`,
            message: handlerError
          });
        }
        break;
      }
      case "cancellation": {
        // Buyer cancelled auto-renew — keep their tier until the paid period
        // ends (a later subscription_ended revokes). Do NOT revoke now.
        const result = await handleSubscriptionCancellation(payload, admin);
        if (result.ok) {
          status = "processed";
        } else {
          status = "failed";
          handlerError = `cancellation[${result.action}]: ${result.error}`;
          reportGumroadFailure({
            eventType,
            eventId,
            action: `subscription_cancellation_${result.action}`,
            message: handlerError
          });
        }
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
    reportGumroadFailure({ eventType, eventId, action: "uncaught_handler_error", message: handlerError, err });
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
