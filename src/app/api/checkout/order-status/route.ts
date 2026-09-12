import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// Reads request.nextUrl.searchParams + auth cookies — must not be
// statically exported. Without this, `next build` fails the export
// phase ("Export encountered errors on /api/checkout/order-status").
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = request.nextUrl.searchParams.get("orderId")?.trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const admin = getSupabaseServerClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data: digital } = await admin.from("digital_checkout_intents").select("status,test_mode,program_slug")
    .eq("id", orderId).eq("user_id", user.id).maybeSingle();
  if (digital) return NextResponse.json({ status: digital.status, testMode: digital.test_mode, programSlug: digital.program_slug });

  const { data: row } = await admin
    .from("program_orders")
    .select("status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ status: row.status });
}
