import { createHmac, timingSafeEqual } from "node:crypto";
import { isJsonObject } from "@/lib/read-request-json";
import { positiveId, UUID_RE } from "./config";

export function verifyLemonSignature(raw: Uint8Array, signature: string | null, secret: string): boolean {
  if (!secret || !signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  return timingSafeEqual(createHmac("sha256", secret).update(raw).digest(), Buffer.from(signature, "hex"));
}

export type LemonOrderEvent = {
  intentId: string; orderId: string; eventName: "order_created" | "order_refunded";
  storeId: string; productId: string; variantId: string; email: string;
  testMode: boolean; amountMinor: number; totalMinor: number; refunded: boolean;
};
const money = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

/** Signature must be checked before this parser. Account ownership comes from the DB intent. */
export function parseLemonOrderEvent(payload: unknown, authenticatedTestMode: boolean): LemonOrderEvent {
  if (!isJsonObject(payload) || !isJsonObject(payload.meta) || !isJsonObject(payload.data)) throw new Error("Invalid envelope");
  const { meta, data } = payload;
  if (meta.event_name !== "order_created" && meta.event_name !== "order_refunded") throw new Error("Unsupported event");
  const a = data.attributes;
  if (data.type !== "orders" || !isJsonObject(a) || !isJsonObject(a.first_order_item) || !isJsonObject(meta.custom_data)) throw new Error("Invalid order");
  const item = a.first_order_item;
  const orderId = positiveId(data.id), storeId = positiveId(a.store_id), productId = positiveId(item.product_id), variantId = positiveId(item.variant_id);
  const intentId = meta.custom_data.tjfit_intent;
  if (!orderId || !storeId || !productId || !variantId || positiveId(item.order_id) !== orderId || typeof intentId !== "string" || !UUID_RE.test(intentId)) throw new Error("Invalid binding");
  if (a.test_mode !== authenticatedTestMode || item.test_mode !== authenticatedTestMode) throw new Error("Wrong mode");
  if (typeof a.user_email !== "string" || !a.user_email.includes("@") || a.user_email.length > 254) throw new Error("Invalid account");
  if (a.currency !== "USD" || a.discount_total !== 0 || !money(a.subtotal) || !money(a.total) || !money(a.tax) || !money(item.price) || !money(a.refunded_amount) || a.refunded_amount > a.total) throw new Error("Invalid amount");
  // Store must use tax-exclusive USD prices; tax may be added by the merchant of record.
  if (a.tax_inclusive !== false || a.total !== a.subtotal + a.tax || item.price !== a.subtotal || (a.setup_fee !== undefined && a.setup_fee !== 0)) throw new Error("Unexpected pricing");
  const refunded = a.refunded === true || a.refunded_amount > 0 || ["refunded", "partial_refund", "fraudulent"].includes(String(a.status));
  if ((!refunded && (a.status !== "paid" || a.refunded !== false)) || (meta.event_name === "order_refunded" && !refunded)) throw new Error("Unconfirmed payment state");
  return { intentId, orderId, storeId, productId, variantId, email: a.user_email.trim().toLowerCase(), testMode: authenticatedTestMode, eventName: meta.event_name, amountMinor: a.subtotal, totalMinor: a.total, refunded };
}
