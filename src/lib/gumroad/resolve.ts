import type { SupabaseClient } from "@supabase/supabase-js";

import { buildGumroadTrackedUrl, getGumroadCheckoutUrl } from "@/lib/gumroad/client";

type CheckoutUrlOpts = {
  programSlug: string;
  orderId: string;
  email?: string;
  userId?: string;
  locale?: string;
};

/**
 * Resolve a Gumroad checkout URL for a slug, preferring the admin-managed
 * DB mapping (bundle_gumroad_products.short_url) and falling back to the
 * env-var mapping. `admin` must be a service-role client (the table is
 * RLS-locked to service role).
 */
export async function resolveBundleGumroadUrl(
  admin: SupabaseClient,
  opts: CheckoutUrlOpts
): Promise<string | null> {
  const { data } = await admin
    .from("bundle_gumroad_products")
    .select("short_url")
    .eq("slug", opts.programSlug)
    .maybeSingle();

  const dbBase = (data?.short_url ?? "").trim();
  if (dbBase) {
    const url = buildGumroadTrackedUrl(dbBase, opts);
    if (url) return url;
  }
  // Fall back to env mapping for back-compat.
  return getGumroadCheckoutUrl(opts);
}
