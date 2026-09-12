import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyGumroadSeller } from "@/lib/gumroad-webhook-verify";
import { getSale } from "@/lib/gumroad/client";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isJsonObject, readRequestText } from "@/lib/read-request-json";
import { handleRefund } from "./handlers/refund";
export const dynamic = "force-dynamic";

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
  const forbidden = new Set(["__proto__", "prototype", "constructor"]);
  const validate = (value: unknown): GumroadEventBody => {
    if (!isJsonObject(value)) throw new Error("Webhook must be an object");
    for (const key of Object.keys(value)) {
      if (forbidden.has(key)) throw new Error("Invalid field");
    }
    for (const key of ["resource_name", "seller_id", "sale_id", "subscription_id", "product_permalink", "permalink", "product_id", "product_name", "email", "full_name", "currency", "sale_timestamp"]) {
      if (value[key] !== undefined && typeof value[key] !== "string") throw new Error("Invalid field type");
    }
    for (const key of ["url_params", "custom_fields"]) {
      const nested = value[key];
      if (nested === undefined) continue;
      if (!isJsonObject(nested) || Object.entries(nested).some(([name, item]) => forbidden.has(name) || typeof item !== "string")) {
        throw new Error("Invalid nested field");
      }
    }
    return value as GumroadEventBody;
  };
  if (contentType.includes("application/json")) {
    return validate(JSON.parse(rawBody));
  }
  const params = new URLSearchParams(rawBody);
  const obj: Record<string, unknown> = Object.create(null);
  for (const [key, value] of params.entries()) {
    const nested = key.match(/^([^[]+)\[([^\]]+)\]$/);
    if (nested) {
      const [, parent, child] = nested;
      if (forbidden.has(parent) || forbidden.has(child)) throw new Error("Invalid field");
      if (obj[parent] !== undefined && !isJsonObject(obj[parent])) throw new Error("Conflicting field");
      const bucket = (obj[parent] as Record<string, string> | undefined) ?? Object.create(null);
      bucket[child] = value;
      obj[parent] = bucket;
    } else {
      if (forbidden.has(key)) throw new Error("Invalid field");
      obj[key] = value;
    }
  }
  return validate(obj);
}


export async function POST(request: NextRequest) {
  const expectedSeller = process.env.GUMROAD_SELLER_ID?.trim();
  if (!expectedSeller) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  const raw = await readRequestText(request, 65536);
  if (!raw.ok) return raw.response;
  let payload: GumroadEventBody;
  try { payload = parseGumroadBody(raw.value, request.headers.get("content-type") ?? ""); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  if (!verifyGumroadSeller(payload.seller_id, expectedSeller)) return NextResponse.json({ error: "Invalid seller" }, { status: 401 });
  const eventType = payload.resource_name ?? (payload.sale_id ? "sale" : "unknown");
  if (!["sale", "refund", "dispute"].includes(eventType)) {
    // Gumroad lifecycle notifications are unsigned and no authoritative subscription
    // snapshot is available here. Existing rights stay untouched pending reconciliation.
    return NextResponse.json({ received: true, status: "review", reason: "legacy_lifecycle_requires_reconciliation" });
  }
  const saleId = payload.sale_id?.trim();
  if (!saleId || !/^[a-zA-Z0-9_-]{1,200}$/.test(saleId)) return NextResponse.json({ error: "Invalid sale" }, { status: 400 });
  let sale;
  try { sale = await getSale(saleId); }
  catch { return NextResponse.json({ error: "Verification will retry" }, { status: 503 }); }
  if (!sale || sale.id !== saleId) return NextResponse.json({ error: "Unverified sale" }, { status: 401 });
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Webhook storage unavailable" }, { status: 503 });
  const refund = sale.refunded === true || sale.disputed === true;
  if (eventType !== "sale" && !refund) return NextResponse.json({ error: "Refund not confirmed" }, { status: 409 });
  let reason = "legacy_new_fulfillment_requires_reconciliation";
  if (refund) {
    const result = await handleRefund(sale, {}, admin);
    if (!result.ok) return NextResponse.json({ error: "Refund processing will retry" }, { status: 503 });
    reason = result.details.requires_review ? "legacy_refund_requires_reconciliation" : "bound_refund_applied";
  }
  // Record only API-verified facts. Retrying after a logging error is safe because
  // refunds are idempotent status updates and this route grants no new rights.
  const eventId = "verified-contained-v3:" + (refund ? "refund:" : "sale:") + createHash("sha256").update(sale.id).digest("hex");
  const { error } = await admin.from("payment_webhooks").upsert({
    provider: "gumroad", event_id: eventId, event_type: refund ? "refund" : "sale",
    raw_payload: { sale_id: sale.id, product_id: sale.product_id, refunded: refund },
    signature_valid: true, status: reason === "bound_refund_applied" ? "processed" : "ignored",
    handler_error: reason, processed_at: new Date().toISOString()
  }, { onConflict: "provider,event_id" });
  if (error) return NextResponse.json({ error: "Webhook storage will retry" }, { status: 503 });
  return NextResponse.json({ received: true, status: reason === "bound_refund_applied" ? "processed" : "review" });
}
