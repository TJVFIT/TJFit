// v5 — Gumroad REST API client (raw fetch wrapper).
//
// We deliberately avoid the `@deox/gumroad` SDK suggested by the v5
// prompt — that package is third-party + adds an install for a thin
// wrapper around 6 endpoints. This module is the same shape the SDK
// would expose, kept zero-dep + Vercel-edge-compatible.
//
// Reference: https://gumroad.com/help/api  (REST v2)
//   - Auth: Bearer token in Authorization header
//   - Base URL: https://api.gumroad.com/v2
//   - All responses { success: boolean, ... }
//
// Webhook signature verification lives in
// `src/lib/gumroad-webhook-verify.ts` (shipped in v2). This client
// is for OUTBOUND calls only.

const GUMROAD_BASE_URL = "https://api.gumroad.com/v2";

/**
 * Resolve the hosted Gumroad checkout URL for a TJFit program slug.
 * Mapping comes from env: `GUMROAD_PRODUCT_<SLUG_IN_SCREAMING_SNAKE>=<short_url>`.
 * Falls back to `GUMROAD_DEFAULT_PRODUCT_URL` if set.
 *
 * The returned URL has order tracking + email pre-fill appended so the
 * Gumroad webhook can correlate the sale back to the originating order.
 */
type CheckoutUrlOpts = {
  programSlug: string;
  orderId: string;
  email?: string;
  userId?: string;
  locale?: string;
};

/**
 * Append TJFit order-tracking params to a Gumroad product base URL. Gumroad
 * echoes arbitrary query params back in `url_params` on the sale webhook, so
 * we use them for idempotent fulfillment. Returns null for an invalid base.
 */
export function buildGumroadTrackedUrl(base: string, opts: CheckoutUrlOpts): string | null {
  const trimmed = base?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    url.searchParams.set("wanted", "true");
    url.searchParams.set("tjfit_order_id", opts.orderId);
    url.searchParams.set("tjfit_program_slug", opts.programSlug);
    if (opts.userId) url.searchParams.set("tjfit_user_id", opts.userId);
    if (opts.locale) url.searchParams.set("tjfit_locale", opts.locale);
    if (opts.email) url.searchParams.set("email", opts.email);
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Resolve the hosted Gumroad checkout URL from ENV mapping only
 * (`GUMROAD_PRODUCT_<SLUG>` → `GUMROAD_DEFAULT_PRODUCT_URL`). For the
 * DB-backed admin-managed mapping, use resolveBundleGumroadUrl in
 * src/lib/gumroad/resolve.ts (which falls back to this).
 */
export function getGumroadCheckoutUrl(opts: CheckoutUrlOpts): string | null {
  const envKey = `GUMROAD_PRODUCT_${opts.programSlug.toUpperCase().replace(/-/g, "_")}`;
  const base =
    process.env[envKey]?.trim() || process.env.GUMROAD_DEFAULT_PRODUCT_URL?.trim();
  if (!base) return null;
  return buildGumroadTrackedUrl(base, opts);
}

class GumroadConfigError extends Error {}
class GumroadAPIError extends Error {
  constructor(
    public status: number,
    public body: string,
    public path: string
  ) {
    super(`Gumroad ${path} → ${status}: ${body.slice(0, 200)}`);
  }
}

function getApiKey(): string {
  const key = process.env.GUMROAD_API_KEY?.trim();
  if (!key) {
    throw new GumroadConfigError(
      "GUMROAD_API_KEY not set — see .env.example for setup. Outbound Gumroad calls disabled."
    );
  }
  return key;
}

export type GumroadResponse<T = unknown> = {
  success: boolean;
} & T;

// Generic fetch helper. Body is JSON unless `multipart` flag set
// (Gumroad's file upload endpoint uses multipart/form-data).
export async function gumroadAPI<T = unknown>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown> | FormData;
    multipart?: boolean;
  } = {}
): Promise<GumroadResponse<T>> {
  const apiKey = getApiKey();
  const url = `${GUMROAD_BASE_URL}${path}`;
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`
  };
  if (!isFormData && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: isFormData
      ? (options.body as FormData)
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
    cache: "no-store"
  });

  const text = await res.text();
  if (!res.ok) {
    throw new GumroadAPIError(res.status, text, path);
  }
  try {
    return JSON.parse(text) as GumroadResponse<T>;
  } catch {
    throw new GumroadAPIError(res.status, "non-JSON response", path);
  }
}

// ============================================================
// Typed convenience methods
// ============================================================

export type GumroadProduct = {
  id: string;
  name: string;
  short_url: string;
  url: string;
  price: number;
  currency: string;
  published: boolean;
  description: string;
  preview_url?: string | null;
  thumbnail_url?: string | null;
  custom_summary?: string | null;
  file_info?: Record<string, unknown>;
  custom_fields?: Array<{ name: string; required: boolean }>;
};

export type GumroadSale = {
  id: string;
  email: string;
  full_name: string;
  product_id: string;
  product_name: string;
  permalink: string;
  price: number;
  gumroad_fee: number;
  currency: string;
  quantity: number;
  subscription_id?: string;
  recurrence?: string;
  recurrence_charge_count?: number;
  refunded?: boolean;
  disputed?: boolean;
  custom_fields?: Record<string, string>;
  variants?: Record<string, string>;
  // Query params echoed back from the checkout URL (buildGumroadTrackedUrl
  // stamps tjfit_order_id / tjfit_program_slug / tjfit_tier / tjfit_billing_mode
  // here). Buyer-influenced, so only used to route already-API-verified sales.
  url_params?: Record<string, string>;
  created_at: string;
};

export async function getProduct(id: string): Promise<GumroadProduct | null> {
  try {
    const r = await gumroadAPI<{ product: GumroadProduct }>(`/products/${id}`);
    return r.product ?? null;
  } catch (err) {
    if (err instanceof GumroadAPIError && err.status === 404) return null;
    throw err;
  }
}

export async function listProducts(): Promise<GumroadProduct[]> {
  const r = await gumroadAPI<{ products: GumroadProduct[] }>("/products");
  return r.products ?? [];
}

export async function createProduct(input: {
  name: string;
  // Cents (Gumroad expects int cents).
  priceCents: number;
  description?: string;
  published?: boolean;
}): Promise<GumroadProduct> {
  const r = await gumroadAPI<{ product: GumroadProduct }>("/products", {
    method: "POST",
    body: {
      name: input.name,
      price: input.priceCents,
      description: input.description ?? "",
      published: input.published ?? false,
      require_shipping: false,
      customizable_price: false
    }
  });
  return r.product;
}

export async function updateProduct(
  id: string,
  input: {
    name?: string;
    priceCents?: number;
    description?: string;
    published?: boolean;
  }
): Promise<GumroadProduct> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.priceCents !== undefined) body.price = input.priceCents;
  if (input.description !== undefined) body.description = input.description;
  if (input.published !== undefined) body.published = input.published;
  const r = await gumroadAPI<{ product: GumroadProduct }>(`/products/${id}`, {
    method: "PUT",
    body
  });
  return r.product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  await gumroadAPI(`/products/${id}`, { method: "DELETE" });
  return true;
}

export async function getSale(id: string): Promise<GumroadSale | null> {
  try {
    const r = await gumroadAPI<{ sale: GumroadSale }>(`/sales/${id}`);
    return r.sale ?? null;
  } catch (err) {
    if (err instanceof GumroadAPIError && err.status === 404) return null;
    throw err;
  }
}

export async function refundSale(id: string, amountCents?: number): Promise<boolean> {
  const body: Record<string, unknown> = {};
  if (amountCents) body.amount_cents = amountCents;
  await gumroadAPI(`/sales/${id}/refund`, { method: "PUT", body });
  return true;
}

// Idempotent: returns true if Gumroad reports success or already-refunded.
export async function safeRefundSale(id: string, amountCents?: number): Promise<{ ok: boolean; error?: string }> {
  try {
    await refundSale(id, amountCents);
    return { ok: true };
  } catch (err) {
    if (err instanceof GumroadAPIError && err.body.includes("already")) {
      return { ok: true };
    }
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
