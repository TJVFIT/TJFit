import { NextRequest, NextResponse } from "next/server";

import { BUNDLES } from "@/lib/bundles";
import { createProduct } from "@/lib/gumroad/client";
import { requireAdmin } from "@/lib/require-admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type LinkRow = { slug: string; product_id: string | null; short_url: string; price_cents: number | null; published: boolean };

/** GET — status of every paid bundle: price + whether it's linked to Gumroad. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured." }, { status: 503 });

  const { data } = await supabase.from("bundle_gumroad_products").select("slug,product_id,short_url,price_cents,published");
  const byslug = new Map((data ?? []).map((r) => [r.slug, r as LinkRow]));

  const items = BUNDLES.filter((b) => b.priceUsd > 0).map((b) => {
    const link = byslug.get(b.slug);
    return {
      slug: b.slug,
      name: b.name,
      priceUsd: b.priceUsd,
      linked: Boolean(link?.short_url),
      shortUrl: link?.short_url ?? null,
      productId: link?.product_id ?? null,
      published: link?.published ?? false
    };
  });

  return NextResponse.json({
    items,
    hasApiKey: Boolean(process.env.GUMROAD_API_KEY),
    freeBundles: BUNDLES.filter((b) => b.priceUsd <= 0).map((b) => ({ slug: b.slug, name: b.name }))
  });
}

/**
 * POST — auto-create a Gumroad product for every paid bundle that isn't
 * linked yet, using GUMROAD_API_KEY. Idempotent: already-linked bundles are
 * skipped. Stores the returned short_url in bundle_gumroad_products.
 */
export async function POST() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured." }, { status: 503 });

  if (!process.env.GUMROAD_API_KEY) {
    return NextResponse.json(
      { error: "GUMROAD_API_KEY is not set. Add it in Vercel env (and redeploy), or paste product URLs manually.", code: "NO_API_KEY" },
      { status: 503 }
    );
  }

  const { data: existing } = await supabase.from("bundle_gumroad_products").select("slug,short_url");
  const linked = new Set((existing ?? []).filter((r) => r.short_url).map((r) => r.slug));

  const paid = BUNDLES.filter((b) => b.priceUsd > 0 && !linked.has(b.slug));
  const created: string[] = [];
  const failed: Array<{ slug: string; error: string }> = [];

  for (const b of paid) {
    try {
      const product = await createProduct({
        name: `TJFit — ${b.name}`,
        priceCents: Math.round(b.priceUsd * 100),
        description: b.hook,
        published: true
      });
      const { error } = await supabase.from("bundle_gumroad_products").upsert(
        {
          slug: b.slug,
          product_id: product.id,
          short_url: product.short_url,
          price_cents: Math.round(b.priceUsd * 100),
          published: product.published,
          updated_at: new Date().toISOString()
        },
        { onConflict: "slug" }
      );
      if (error) {
        failed.push({ slug: b.slug, error: error.message });
      } else {
        created.push(b.slug);
      }
    } catch (err) {
      failed.push({ slug: b.slug, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ ok: failed.length === 0, created, failed, skipped: [...linked] });
}

/**
 * PATCH — manually set/override a bundle's Gumroad URL (for products created
 * in the Gumroad UI). Body: { slug, shortUrl }.
 */
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Database not configured." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as { slug?: unknown; shortUrl?: unknown } | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const shortUrl = typeof body?.shortUrl === "string" ? body.shortUrl.trim() : "";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const bundle = BUNDLES.find((b) => b.slug === slug);
  if (!bundle) return NextResponse.json({ error: "Unknown bundle" }, { status: 404 });

  // Empty shortUrl clears the link.
  if (!shortUrl) {
    await supabase.from("bundle_gumroad_products").delete().eq("slug", slug);
    return NextResponse.json({ ok: true, cleared: true });
  }

  try {
    // Validate it's a real URL before storing.
    // eslint-disable-next-line no-new
    new URL(shortUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const { error } = await supabase.from("bundle_gumroad_products").upsert(
    {
      slug,
      short_url: shortUrl,
      price_cents: Math.round(bundle.priceUsd * 100),
      updated_at: new Date().toISOString()
    },
    { onConflict: "slug" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
