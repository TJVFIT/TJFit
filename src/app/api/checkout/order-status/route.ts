import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { UUID_RE } from "@/lib/payments/lemon/config";

// Reads request.nextUrl.searchParams + auth cookies — must not be
// statically exported. Without this, `next build` fails the export
// phase ("Export encountered errors on /api/checkout/order-status").
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const orderId = request.nextUrl.searchParams.get("orderId")?.trim();
  if (!orderId || !UUID_RE.test(orderId)) {
    return NextResponse.json({ error: "A valid orderId is required" }, { status: 400 });
  }

  const admin = getSupabaseServerClient();
  if (!admin) {
    return NextResponse.json({ error: "Order status is unavailable." }, { status: 503 });
  }

  const { data: digital, error: digitalError } = await admin.from("digital_checkout_intents").select("status,test_mode,program_slug,product_kind,intake_id,expires_at")
    .eq("id", orderId).eq("user_id", user.id).maybeSingle();
  if (digitalError) return NextResponse.json({ error: "Order status is unavailable." }, { status: 503 });
  if (digital) return NextResponse.json({
    status: digital.status, testMode: digital.test_mode, programSlug: digital.program_slug,
    productKind: digital.product_kind, intakeId: digital.intake_id, expiresAt: digital.expires_at
  }, { headers: { "Cache-Control": "private, no-store" } });

  const { data: row, error: legacyError } = await admin
    .from("program_orders")
    .select("status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (legacyError) return NextResponse.json({ error: "Order status is unavailable." }, { status: 503 });

  if (!row) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ status: row.status }, { headers: { "Cache-Control": "private, no-store" } });
}
