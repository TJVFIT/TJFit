import { isJsonObject } from "@/lib/read-request-json";
import { positiveId, type LemonConfig } from "./config";

export type DigitalIntent = {
  id: string; user_id: string; email: string; program_slug: string; product_kind: "bundle" | "tjai_pass";
  amount_minor: number; store_id: string; product_id: string; variant_id: string; test_mode: boolean;
  locale: string; intake_id: string | null; status: string; expires_at: string;
  checkout_id: string | null; checkout_url: string | null;
};

async function api(config: LemonConfig, path: string, body?: unknown): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.lemonsqueezy.com/v1/${path}`, {
    method: body ? "POST" : "GET", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
    headers: { Accept: "application/vnd.api+json", "Content-Type": "application/vnd.api+json", Authorization: `Bearer ${config.apiKey}` },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (!response.ok) throw new Error("Payment provider unavailable");
  const value: unknown = await response.json();
  if (!isJsonObject(value)) throw new Error("Invalid provider response");
  return value;
}

function attributes(value: Record<string, unknown>, type: string, id: string): Record<string, unknown> {
  if (!isJsonObject(value.data) || value.data.type !== type || String(value.data.id) !== id || !isJsonObject(value.data.attributes)) throw new Error("Unexpected provider resource");
  return value.data.attributes;
}

export function isLemonCheckoutUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && /^[a-z0-9-]+\.lemonsqueezy\.com$/.test(url.hostname) && url.pathname.startsWith("/checkout/");
  } catch { return false; }
}

export async function createLemonCheckout(config: LemonConfig, intent: DigitalIntent): Promise<{ id: string; url: string }> {
  // Read authoritative resources before exposing a charge URL. Use current Price objects.
  const [storeResult, productResult, variantResult, priceResult] = await Promise.all([
    api(config, `stores/${intent.store_id}`), api(config, `products/${intent.product_id}`),
    api(config, `variants/${intent.variant_id}`), api(config, `prices?filter[variant_id]=${intent.variant_id}&page[size]=1`)
  ]);
  const store = attributes(storeResult, "stores", intent.store_id);
  const product = attributes(productResult, "products", intent.product_id);
  const variant = attributes(variantResult, "variants", intent.variant_id);
  const firstPrice = Array.isArray(priceResult.data) ? priceResult.data[0] : null;
  const price = isJsonObject(firstPrice) && firstPrice.type === "prices" && isJsonObject(firstPrice.attributes) ? firstPrice.attributes : null;
  if (store.currency !== "USD" || positiveId(product.store_id) !== intent.store_id || product.test_mode !== intent.test_mode
    || product.status !== "published" || positiveId(variant.product_id) !== intent.product_id || variant.test_mode !== intent.test_mode
    || !["published", "pending"].includes(String(variant.status)) || !price || positiveId(price.variant_id) !== intent.variant_id
    || price.category !== "one_time" || price.scheme !== "standard" || price.unit_price !== intent.amount_minor
    || price.usage_aggregation != null) throw new Error("Product is not configured for this purchase");
  const returnPath = intent.product_kind === "tjai_pass"
    ? `/${intent.locale}/tjai/checkout?intake=${intent.intake_id}&orderId=${intent.id}`
    : `/${intent.locale}/checkout?program=${encodeURIComponent(intent.program_slug)}&orderId=${intent.id}`;
  const result = await api(config, "checkouts", { data: {
    type: "checkouts", attributes: {
      custom_price: intent.amount_minor, test_mode: intent.test_mode, expires_at: intent.expires_at, preview: true,
      product_options: { enabled_variants: [Number(intent.variant_id)], redirect_url: `${config.siteUrl}${returnPath}` },
      checkout_options: { discount: false, skip_trial: true },
      checkout_data: { email: intent.email, custom: { tjfit_intent: intent.id }, variant_quantities: [{ variant_id: Number(intent.variant_id), quantity: 1 }] }
    }, relationships: { store: { data: { type: "stores", id: intent.store_id } }, variant: { data: { type: "variants", id: intent.variant_id } } }
  } });
  if (!isJsonObject(result.data) || result.data.type !== "checkouts" || typeof result.data.id !== "string" || !isJsonObject(result.data.attributes)) throw new Error("Invalid checkout response");
  const a = result.data.attributes;
  if (positiveId(a.store_id) !== intent.store_id || positiveId(a.variant_id) !== intent.variant_id || a.test_mode !== intent.test_mode || a.custom_price !== intent.amount_minor || !isLemonCheckoutUrl(a.url)) throw new Error("Checkout response mismatch");
  if (!isJsonObject(a.preview) || a.preview.currency !== "USD" || a.preview.subtotal !== intent.amount_minor || a.preview.discount_total !== 0) throw new Error("Checkout price preview mismatch");
  return { id: result.data.id, url: a.url };
}
