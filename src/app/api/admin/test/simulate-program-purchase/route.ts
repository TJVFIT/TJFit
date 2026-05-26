import { NextRequest, NextResponse } from "next/server";

import { handleSale } from "@/app/api/webhooks/gumroad/handlers/sale";
import { requireAdmin } from "@/lib/require-admin";

// v5 round 2 Task 4 — simulate a Gumroad program/diet sale.
//
// POST body: { productType: 'program' | 'diet', productId: string,
//              gumroadProductId?: string, email?: string,
//              fullName?: string, priceCents?: number }
//
// Verifies post-conditions:
//  - sale_commissions row created for the synthetic sale_id
//  - net_amount + commission split look right (1 cent rounding tolerated)

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Defense in depth: admin role alone is not enough on a production
  // deployment. Require an explicit env opt-in to fire simulated webhooks.
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_TEST_CHECKOUT !== "true") {
    return NextResponse.json({ error: "Test routes disabled in production." }, { status: 403 });
  }
  const adminResult = await requireAdmin();
  if (!adminResult.ok) return adminResult.response;
  const admin = adminResult.supabase;
  const callerUserId = adminResult.userId;

  const body = (await request.json().catch(() => null)) as
    | {
        productType?: "program" | "diet";
        productId?: string;
        gumroadProductId?: string;
        email?: string;
        fullName?: string;
        priceCents?: number;
      }
    | null;

  if (!body?.productType || !body?.productId) {
    return NextResponse.json(
      { error: "productType and productId are required" },
      { status: 400 }
    );
  }

  const email = body.email?.trim() ?? "test@tjfit.org";
  void callerUserId; // reserved — exposed by requireAdmin for future audit logging
  const fullName = body.fullName?.trim() ?? "Test Buyer";
  const priceCents = body.priceCents ?? 599;
  const gumroadProductId = body.gumroadProductId ?? `test_${body.productType}_${body.productId}`;

  // Ensure sync row exists so handleSale can find the product.
  await admin.from("product_gumroad_sync").upsert(
    {
      product_type: body.productType,
      product_id: body.productId,
      gumroad_product_id: gumroadProductId,
      is_published: true,
      last_synced_at: new Date().toISOString(),
      last_sync_direction: "manual"
    },
    { onConflict: "product_type,product_id" }
  );

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

  const { data: commission } = await admin
    .from("sale_commissions")
    .select(
      "id, gumroad_sale_id, product_type, product_id, coach_id, gross_amount_usd, gumroad_fee_usd, net_amount_usd, coach_share_pct, tjfit_share_pct, coach_amount_usd, tjfit_amount_usd, applied_rule, status"
    )
    .eq("gumroad_sale_id", fakePayload.sale_id)
    .maybeSingle();

  return NextResponse.json({
    handlerResult: result,
    verification: {
      saleCommissionRow: commission ?? null,
      pass:
        result.ok &&
        commission != null &&
        Number(commission.gross_amount_usd) === priceCents / 100
    }
  });
}
