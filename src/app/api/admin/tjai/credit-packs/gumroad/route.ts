import { NextRequest, NextResponse } from "next/server";

import { syncProductToGumroad } from "@/lib/gumroad/sync";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

type PackRow = {
  id: string;
  slug: string;
  name_i18n: Record<string, string> | null;
  credits: number;
  price_usd: string | number;
  is_published: boolean;
};

type SyncRow = {
  product_id: string;
  gumroad_product_id: string | null;
  gumroad_permalink: string | null;
  is_published: boolean | null;
};

function packName(pack: PackRow): string {
  return pack.name_i18n?.en ?? pack.slug;
}

/** GET — Gumroad link status of every published TJAI credit pack. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { data: packs } = await admin.supabase
    .from("tjai_credit_packs")
    .select("id,slug,name_i18n,credits,price_usd,is_published")
    .eq("is_published", true)
    .order("display_order");

  const { data: syncRows } = await admin.supabase
    .from("product_gumroad_sync")
    .select("product_id,gumroad_product_id,gumroad_permalink,is_published")
    .eq("product_type", "tjai_credits");

  const byPackId = new Map(((syncRows ?? []) as SyncRow[]).map((r) => [r.product_id, r]));

  const items = ((packs ?? []) as PackRow[]).map((p) => {
    const link = byPackId.get(p.id);
    // The simulate-credit-purchase test fixture writes a fake gumroad id;
    // treat it as unlinked so the real product still gets created.
    const isTestFixture = Boolean(link?.gumroad_product_id?.startsWith("test_"));
    return {
      id: p.id,
      slug: p.slug,
      name: packName(p),
      credits: p.credits,
      priceUsd: Number(p.price_usd),
      linked: Boolean(link && !isTestFixture),
      shortUrl: isTestFixture ? null : (link?.gumroad_permalink ?? null),
      productId: isTestFixture ? null : (link?.gumroad_product_id ?? null)
    };
  });

  return NextResponse.json({ items, hasApiKey: Boolean(process.env.GUMROAD_API_KEY) });
}

/**
 * POST — auto-create a Gumroad product for every published credit pack that
 * isn't linked yet. Idempotent: linked packs are skipped. Fulfillment depends
 * on `product_gumroad_sync.gumroad_product_id` (the sale webhook resolves the
 * pack by Gumroad product id), which syncProductToGumroad upserts.
 */
export async function POST() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  if (!process.env.GUMROAD_API_KEY) {
    return NextResponse.json(
      { error: "GUMROAD_API_KEY is not set. Add it in Vercel env (and redeploy).", code: "NO_API_KEY" },
      { status: 503 }
    );
  }

  const { data: packs } = await admin.supabase
    .from("tjai_credit_packs")
    .select("id,slug,name_i18n,credits,price_usd,is_published")
    .eq("is_published", true)
    .order("display_order");

  const { data: syncRows } = await admin.supabase
    .from("product_gumroad_sync")
    .select("product_id,gumroad_product_id")
    .eq("product_type", "tjai_credits");

  const linked = new Set(
    ((syncRows ?? []) as SyncRow[])
      .filter((r) => r.gumroad_product_id && !r.gumroad_product_id.startsWith("test_"))
      .map((r) => r.product_id)
  );

  const created: string[] = [];
  const failed: Array<{ slug: string; error: string }> = [];

  for (const p of (packs ?? []) as PackRow[]) {
    if (linked.has(p.id)) continue;
    const name = packName(p);
    const result = await syncProductToGumroad(
      admin.supabase,
      {
        productType: "tjai_credits",
        productId: p.id,
        name: `TJAI — ${name} (${p.credits} plan credit${p.credits === 1 ? "" : "s"})`,
        description: `Unlocks ${p.credits} full TJAI plan generation${p.credits === 1 ? "" : "s"} on tjfit.org. Credits are added to the TJFit account matching your checkout email.`,
        priceUsd: Number(p.price_usd),
        isPublished: true
      },
      admin.userId
    );
    if (result.ok) created.push(p.slug);
    else failed.push({ slug: p.slug, error: result.error });
  }

  return NextResponse.json({ ok: failed.length === 0, created, failed, skipped: [...linked] });
}

/**
 * PATCH — manually link a pack to a product created in the Gumroad UI.
 * Body: { slug, shortUrl, productId }. productId is REQUIRED because the
 * sale webhook resolves credit packs by Gumroad product id — a URL alone
 * cannot fulfill.
 */
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const body = (await request.json().catch(() => null)) as
    | { slug?: unknown; shortUrl?: unknown; productId?: unknown }
    | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const shortUrl = typeof body?.shortUrl === "string" ? body.shortUrl.trim() : "";
  const productId = typeof body?.productId === "string" ? body.productId.trim() : "";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const { data: pack } = await admin.supabase
    .from("tjai_credit_packs")
    .select("id,slug")
    .eq("slug", slug)
    .maybeSingle();
  if (!pack) return NextResponse.json({ error: "Unknown credit pack" }, { status: 404 });

  if (!shortUrl && !productId) {
    await admin.supabase
      .from("product_gumroad_sync")
      .delete()
      .eq("product_type", "tjai_credits")
      .eq("product_id", pack.id);
    return NextResponse.json({ ok: true, cleared: true });
  }

  if (!productId) {
    return NextResponse.json(
      { error: "productId is required — the webhook fulfills credit packs by Gumroad product id." },
      { status: 400 }
    );
  }
  try {
    new URL(shortUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const { error } = await admin.supabase.from("product_gumroad_sync").upsert(
    {
      product_type: "tjai_credits",
      product_id: pack.id,
      gumroad_product_id: productId,
      gumroad_permalink: shortUrl,
      gumroad_product_url: shortUrl,
      is_published: true,
      last_synced_at: new Date().toISOString(),
      last_sync_direction: "manual",
      updated_at: new Date().toISOString()
    },
    { onConflict: "product_type,product_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
