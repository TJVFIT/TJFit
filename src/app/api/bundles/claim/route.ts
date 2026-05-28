import { NextRequest, NextResponse } from "next/server";

import { getBundle } from "@/lib/bundles";
import { hasPurchasedProgram } from "@/lib/purchases";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * POST /api/bundles/claim  { slug }
 * Free bundles (priceUsd === 0) still need a paid `program_orders` entitlement
 * row for the download gate. This grants that $0 entitlement once per user.
 * Idempotent: returns ok if already owned. Paid bundles must go through
 * /api/checkout/create-order instead.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as { slug?: unknown } | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const bundle = getBundle(slug);
  if (!bundle) return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
  if (bundle.priceUsd > 0) {
    return NextResponse.json({ error: "This bundle is paid. Use checkout." }, { status: 400 });
  }

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Already owned → no-op success.
  if (await hasPurchasedProgram(admin, auth.user.id, slug)) {
    return NextResponse.json({ ok: true, alreadyOwned: true });
  }

  const { error } = await admin.from("program_orders").insert({
    user_id: auth.user.id,
    program_slug: slug,
    amount_try: 0,
    final_amount_try: 0,
    currency: "TRY",
    provider: "free_claim",
    provider_order_id: `FREE-${slug}-${auth.user.id}`,
    status: "paid",
    paid_at: new Date().toISOString(),
    tjfit_coins_earned: 0
  });

  if (error) {
    // Unique-violation = a concurrent claim already granted it; treat as success.
    if (String(error.code) === "23505") {
      return NextResponse.json({ ok: true, alreadyOwned: true });
    }
    console.error("[bundles/claim] insert failed", error.message, error.code);
    return NextResponse.json({ error: "Could not claim bundle." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
