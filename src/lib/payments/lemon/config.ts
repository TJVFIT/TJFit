import { getBundle } from "@/lib/bundles";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type DigitalProduct = { slug: string; kind: "bundle" | "tjai_pass"; amountMinor: number };
export type LemonMapping = { productId: string; variantId: string };
export type LemonConfig = { testMode: boolean; storeId: string; apiKey: string; siteUrl: string; products: Record<string, LemonMapping> };

export function getDigitalProduct(slug: string): DigitalProduct | null {
  if (slug === "tjai-pass") return { slug, kind: "tjai_pass", amountMinor: 1999 };
  const bundle = getBundle(slug);
  return bundle && !bundle.isFree && bundle.priceUsd === 10 ? { slug, kind: "bundle", amountMinor: 1000 } : null;
}

export function positiveId(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const id = String(value);
  return /^[1-9][0-9]{0,14}$/.test(id) && Number.isSafeInteger(Number(id)) ? id : null;
}

/** No implicit live/default provider. Preview test receipts cannot grant access. */
export function getLemonCheckoutConfig(): LemonConfig | null {
  const mode = process.env.LEMON_MODE ?? "test";
  if (mode !== "test" && mode !== "live") return null;
  const testMode = mode === "test";
  // Adding test credentials must not silently open purchasing on a public preview.
  if (testMode && process.env.ALLOW_TEST_CHECKOUT !== "true") return null;
  if (!testMode && process.env.LEMON_LIVE_ENABLED !== "true") return null;
  // Platform-owned server context only. Any explicit production context takes priority.
  const productionDeployment = process.env.VERCEL_ENV === "production" || process.env.CONTEXT === "production";
  const previewDeployment = process.env.VERCEL_ENV === "preview" || process.env.CONTEXT === "deploy-preview" || process.env.CONTEXT === "branch-deploy";
  if (testMode && (productionDeployment || (process.env.NODE_ENV === "production" && !previewDeployment))) return null;
  const prefix = `LEMON_${testMode ? "TEST" : "LIVE"}_`;
  const apiKey = process.env[`${prefix}API_KEY`]?.trim();
  const storeId = positiveId(process.env[`${prefix}STORE_ID`]);
  const secret = process.env[`${prefix}WEBHOOK_SECRET`]?.trim();
  if (!apiKey || !storeId || !secret) return null;
  try {
    const site = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "");
    if (site.username || site.password || (site.protocol !== "https:" && !(testMode && site.protocol === "http:" && ["localhost", "127.0.0.1"].includes(site.hostname)))) return null;
    const raw: unknown = JSON.parse(process.env[`${prefix}PRODUCT_MAP_JSON`] ?? "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const products: Record<string, LemonMapping> = Object.create(null);
    const variants = new Set<string>();
    for (const [slug, entry] of Object.entries(raw)) {
      if (!getDigitalProduct(slug) || !entry || typeof entry !== "object" || Array.isArray(entry)) return null;
      const productId = positiveId(entry.productId);
      const variantId = positiveId(entry.variantId);
      if (!productId || !variantId || variants.has(variantId)) return null;
      products[slug] = { productId, variantId };
      variants.add(variantId);
    }
    if (!variants.size) return null;
    return { testMode, storeId, apiKey, siteUrl: site.origin, products };
  } catch { return null; }
}
