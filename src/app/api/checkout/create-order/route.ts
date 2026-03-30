import { NextRequest, NextResponse } from "next/server";
import { programs } from "@/lib/content";
import { getProgramBasePriceTry } from "@/lib/program-localization";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TJFIT_COINS_PER_PROGRAM_PURCHASE } from "@/lib/tjfit-coin";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const programSlug = String(body?.programSlug ?? "").trim();
  const discountCode = String(body?.discountCode ?? "").trim().toUpperCase();
  const provider = String(body?.provider ?? "paddle").trim().toLowerCase();

  const staticProgram = programs.find((item) => item.slug === programSlug);
  let discountPercent = 0;
  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  let baseTry = 0;
  if (staticProgram) {
    baseTry = getProgramBasePriceTry(staticProgram);
  } else {
    const { data: customProgram } = await adminClient
      .from("custom_programs")
      .select("slug,price_try,active")
      .eq("slug", programSlug)
      .eq("active", true)
      .maybeSingle();
    if (!customProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }
    baseTry = Number(customProgram.price_try ?? 400);
  }

  if (discountCode) {
    const { data: code } = await adminClient
      .from("tjfit_discount_codes")
      .select("code,discount_percent,status,user_id")
      .eq("code", discountCode)
      .eq("user_id", user.id)
      .eq("status", "available")
      .maybeSingle();

    if (!code) {
      return NextResponse.json({ error: "Invalid or unavailable discount code." }, { status: 400 });
    }
    discountPercent = code.discount_percent;
  }

  const finalTry = Math.max(0, Math.round(baseTry * (1 - discountPercent / 100)));
  const providerOrderId = `TJFIT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const { data: order, error: orderError } = await adminClient
    .from("program_orders")
    .insert({
      user_id: user.id,
      program_slug: programSlug,
      amount_try: baseTry,
      final_amount_try: finalTry,
      currency: "TRY",
      provider,
      provider_order_id: providerOrderId,
      status: "pending",
      discount_code: discountCode || null,
      discount_percent: discountPercent,
      tjfit_coins_earned: TJFIT_COINS_PER_PROGRAM_PURCHASE
    })
    .select("id,program_slug,amount_try,final_amount_try,discount_code,discount_percent,provider,status")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  }

  return NextResponse.json({
    order,
    coinsToEarn: TJFIT_COINS_PER_PROGRAM_PURCHASE,
    provider: provider === "paddle" ? "paddle" : "test",
    message:
      provider === "paddle"
        ? "Paddle order prepared. Connect Paddle checkout + webhook to auto-complete."
        : "Test order prepared."
  });
}
