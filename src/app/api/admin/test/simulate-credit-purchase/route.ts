import { NextRequest, NextResponse } from "next/server";

import { handleSale } from "@/app/api/webhooks/gumroad/handlers/sale";
import { requireAdmin } from "@/lib/require-admin";

// v5 round 2 Task 4 — simulate a Gumroad credit-pack sale.
//
// POST body: { gumroadProductId: string, packId?: string,
//              email?: string, fullName?: string, priceCents?: number }
//
// If `gumroadProductId` is missing but `packId` is provided, the
// handler upserts a temporary product_gumroad_sync row first so the
// pack is reachable.
//
// Verifies post-conditions:
//  - profile.tjai_credit_balance increased by pack.credits
//  - tjai_credit_transactions row created
//  - sale_commissions row NOT created (credit packs have no coach)
//
// Admin-gated. Documented in docs/TESTING_v5.md.

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin();
  if (!adminResult.ok) return adminResult.response;
  const admin = adminResult.supabase;

  const body = (await request.json().catch(() => null)) as
    | { gumroadProductId?: string; packId?: string; email?: string; fullName?: string; priceCents?: number }
    | null;

  let gumroadProductId = body?.gumroadProductId?.trim();
  const email = body?.email?.trim() ?? "test@tjfit.org";
  const fullName = body?.fullName?.trim() ?? "Test Buyer";
  const priceCents = body?.priceCents ?? 800;

  // If only packId provided, ensure a sync row exists.
  if (!gumroadProductId && body?.packId) {
    const tempGumroadId = `test_credit_pack_${body.packId}`;
    await admin.from("product_gumroad_sync").upsert(
      {
        product_type: "tjai_credits",
        product_id: body.packId,
        gumroad_product_id: tempGumroadId,
        is_published: true,
        last_synced_at: new Date().toISOString(),
        last_sync_direction: "manual"
      },
      { onConflict: "product_type,product_id" }
    );
    gumroadProductId = tempGumroadId;
  }

  if (!gumroadProductId) {
    return NextResponse.json(
      { error: "gumroadProductId or packId required" },
      { status: 400 }
    );
  }

  // Snapshot balance before
  const { data: beforeProfile } = await admin
    .from("profiles")
    .select("id, tjai_credit_balance")
    .eq("email", email)
    .maybeSingle();
  const balanceBefore = beforeProfile?.tjai_credit_balance ?? 0;

  // Synthesize Gumroad payload.
  const fakePayload = {
    resource_name: "sale",
    sale_id: `test_sale_${Date.now()}`,
    product_id: gumroadProductId,
    email,
    full_name: fullName,
    price: priceCents,
    gumroad_fee: Math.round(priceCents * 0.1),
    currency: "USD",
    test: true
  };

  const result = await handleSale(fakePayload, admin);

  // Verify after.
  const { data: afterProfile } = await admin
    .from("profiles")
    .select("id, tjai_credit_balance")
    .eq("email", email)
    .maybeSingle();
  const balanceAfter = afterProfile?.tjai_credit_balance ?? 0;

  const { data: txns } = await admin
    .from("tjai_credit_transactions")
    .select("id, amount, reason, metadata")
    .eq("user_id", afterProfile?.id ?? "00000000-0000-0000-0000-000000000000")
    .order("created_at", { ascending: false })
    .limit(1);

  const { count: commissionCount } = await admin
    .from("sale_commissions")
    .select("id", { count: "exact", head: true })
    .eq("gumroad_sale_id", fakePayload.sale_id);

  return NextResponse.json({
    handlerResult: result,
    verification: {
      balanceBefore,
      balanceAfter,
      balanceDelta: balanceAfter - balanceBefore,
      latestTransaction: txns?.[0] ?? null,
      saleCommissionsForThisSale: commissionCount ?? 0,
      pass:
        result.ok &&
        balanceAfter > balanceBefore &&
        (txns?.[0]?.reason === "purchase") &&
        (commissionCount ?? 0) === 0
    }
  });
}
