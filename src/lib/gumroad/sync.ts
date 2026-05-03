// v5 — Bidirectional Supabase ↔ Gumroad product sync.
//
// Two flows:
//   * `syncProductToGumroad()`  — admin clicks "Publish" in /admin
//                                  → calls Gumroad create/update.
//   * `syncProductFromGumroad()` — webhook delivers `product_updated`
//                                   → mirror Gumroad change into our DB.
//
// Both directions log to `sync_log` (audit + debugging). Errors
// append to the per-row `sync_errors` JSONB array.

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createProduct,
  updateProduct,
  getProduct,
  type GumroadProduct
} from "./client";

export type ProductType = "program" | "diet" | "tjai_credits" | "subscription";
export type SyncDirection = "to_gumroad" | "from_gumroad" | "manual";

export type SyncProductInput = {
  productType: ProductType;
  /** Supabase UUID for the local product row. */
  productId: string;
  name: string;
  description: string;
  /** US dollars; we convert to Gumroad's expected cents on the call. */
  priceUsd: number;
  isPublished: boolean;
};

export type SyncResult =
  | {
      ok: true;
      action: "created" | "updated";
      gumroadProductId: string;
      gumroadProductUrl: string;
      gumroadPermalink: string;
    }
  | { ok: false; error: string; action: "create" | "update" | "skip" };

async function logSync(
  supabase: SupabaseClient,
  row: {
    direction: SyncDirection;
    action: string;
    productType: ProductType | null;
    localId: string | null;
    gumroadId: string | null;
    status: "success" | "failed" | "partial";
    requestPayload?: unknown;
    responsePayload?: unknown;
    errorMessage?: string;
    triggeredBy?: string;
  }
): Promise<void> {
  await supabase.from("sync_log").insert({
    direction: row.direction,
    action: row.action,
    product_type: row.productType,
    local_id: row.localId,
    gumroad_id: row.gumroadId,
    status: row.status,
    request_payload: row.requestPayload ?? null,
    response_payload: row.responsePayload ?? null,
    error_message: row.errorMessage ?? null,
    triggered_by: row.triggeredBy ?? null
  });
}

/**
 * Push a Supabase product into Gumroad. Idempotent: re-running on a
 * product that already has a `gumroad_product_id` issues an update
 * rather than a duplicate create.
 */
export async function syncProductToGumroad(
  supabase: SupabaseClient,
  input: SyncProductInput,
  triggeredBy?: string
): Promise<SyncResult> {
  const { data: existing } = await supabase
    .from("product_gumroad_sync")
    .select("*")
    .eq("product_type", input.productType)
    .eq("product_id", input.productId)
    .maybeSingle();

  const priceCents = Math.round(input.priceUsd * 100);
  let action: "create" | "update" = existing?.gumroad_product_id ? "update" : "create";

  try {
    let gumroadProduct: GumroadProduct;
    if (action === "create") {
      gumroadProduct = await createProduct({
        name: input.name,
        priceCents,
        description: input.description,
        published: input.isPublished
      });
    } else {
      gumroadProduct = await updateProduct(existing!.gumroad_product_id as string, {
        name: input.name,
        priceCents,
        description: input.description,
        published: input.isPublished
      });
    }

    await supabase
      .from("product_gumroad_sync")
      .upsert(
        {
          product_type: input.productType,
          product_id: input.productId,
          gumroad_product_id: gumroadProduct.id,
          gumroad_permalink: gumroadProduct.short_url,
          gumroad_product_url: gumroadProduct.url,
          is_published: gumroadProduct.published,
          last_synced_at: new Date().toISOString(),
          last_sync_direction: "to_gumroad",
          updated_at: new Date().toISOString()
        },
        { onConflict: "product_type,product_id" }
      );

    await logSync(supabase, {
      direction: "to_gumroad",
      action: action === "create" ? "create" : "update",
      productType: input.productType,
      localId: input.productId,
      gumroadId: gumroadProduct.id,
      status: "success",
      requestPayload: input,
      responsePayload: gumroadProduct,
      triggeredBy
    });

    return {
      ok: true,
      action: action === "create" ? "created" : "updated",
      gumroadProductId: gumroadProduct.id,
      gumroadProductUrl: gumroadProduct.url,
      gumroadPermalink: gumroadProduct.short_url
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    if (existing?.id) {
      const errs = Array.isArray(existing.sync_errors) ? existing.sync_errors : [];
      await supabase
        .from("product_gumroad_sync")
        .update({
          sync_errors: [
            ...errs,
            { at: new Date().toISOString(), action, msg: errorMessage }
          ],
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id);
    }

    await logSync(supabase, {
      direction: "to_gumroad",
      action,
      productType: input.productType,
      localId: input.productId,
      gumroadId: existing?.gumroad_product_id ?? null,
      status: "failed",
      requestPayload: input,
      errorMessage,
      triggeredBy
    });

    return { ok: false, error: errorMessage, action };
  }
}

/**
 * Pull a Gumroad change back into our DB. Called by the webhook
 * handler on `product_updated` events. Lookup is by Gumroad ID.
 */
export async function syncProductFromGumroad(
  supabase: SupabaseClient,
  gumroadProductId: string
): Promise<{ ok: boolean; localId?: string; error?: string }> {
  try {
    const product = await getProduct(gumroadProductId);
    if (!product) {
      await logSync(supabase, {
        direction: "from_gumroad",
        action: "fetch",
        productType: null,
        localId: null,
        gumroadId: gumroadProductId,
        status: "failed",
        errorMessage: "Product not found in Gumroad"
      });
      return { ok: false, error: "not_found" };
    }

    const { data: syncRow } = await supabase
      .from("product_gumroad_sync")
      .select("*")
      .eq("gumroad_product_id", gumroadProductId)
      .maybeSingle();

    if (!syncRow) {
      // Orphan — Gumroad has it, we don't. Admin should reconcile.
      await logSync(supabase, {
        direction: "from_gumroad",
        action: "orphan_detected",
        productType: null,
        localId: null,
        gumroadId: gumroadProductId,
        status: "partial",
        responsePayload: product,
        errorMessage: "No matching Supabase row — orphan Gumroad product"
      });
      return { ok: false, error: "orphan" };
    }

    await supabase
      .from("product_gumroad_sync")
      .update({
        is_published: product.published,
        last_synced_at: new Date().toISOString(),
        last_sync_direction: "from_gumroad",
        updated_at: new Date().toISOString()
      })
      .eq("id", syncRow.id);

    // Mirror price + published flag into the source-of-truth table
    // for the product's type. Programs/diets store TRY in this app
    // — a future round may add a USD column or a per-tier price
    // table. For now we only mirror the published flag (price stays
    // authored in the local product file).
    if (syncRow.product_type === "program") {
      await supabase
        .from("programs")
        .update({ is_published: product.published })
        .eq("id", syncRow.product_id);
    } else if (syncRow.product_type === "diet") {
      // Diets aren't in DB yet — they live in src/lib/diets/index.ts.
      // No-op the local mirror until they migrate to a table.
    }

    await logSync(supabase, {
      direction: "from_gumroad",
      action: "update",
      productType: syncRow.product_type as ProductType,
      localId: syncRow.product_id,
      gumroadId: gumroadProductId,
      status: "success",
      responsePayload: product
    });

    return { ok: true, localId: syncRow.product_id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await logSync(supabase, {
      direction: "from_gumroad",
      action: "fetch",
      productType: null,
      localId: null,
      gumroadId: gumroadProductId,
      status: "failed",
      errorMessage
    });
    return { ok: false, error: errorMessage };
  }
}
