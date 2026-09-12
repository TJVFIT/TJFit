import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { resolvePaymentBackend } from "@/lib/payments";
import { getDigitalProduct, getLemonCheckoutConfig, UUID_RE } from "@/lib/payments/lemon/config";
import { isJsonObject, readRequestJson } from "@/lib/read-request-json";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { isTjaiPassCheckoutReady } from "@/lib/payments/lemon/readiness";
import { validateAdultIntake } from "@/lib/tjai/intake-validation";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = getLemonCheckoutConfig();
  if (resolvePaymentBackend().providerId !== "lemonsqueezy" || !config) return NextResponse.json({ error: "Purchases are not available yet." }, { status: 503 });
  const parsed = await readRequestJson(request, 4096);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value;
  if (!isJsonObject(body) || typeof body.programSlug !== "string" || typeof body.locale !== "string" || !isLocale(body.locale)) return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  const product = getDigitalProduct(body.programSlug);
  const mapping = product && config.products[product.slug];
  if (!product || !mapping || (body.discountCode !== undefined && body.discountCode !== "")) return NextResponse.json({ error: "This purchase is not available." }, { status: 400 });
  if (!user.email || !user.email_confirmed_at) return NextResponse.json({ error: "Verify your account email before purchasing." }, { status: 403 });
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Purchase storage is unavailable." }, { status: 503 });
  let intakeId: string | null = null;
  if (product.kind === "tjai_pass") {
    if (!isTjaiPassCheckoutReady(config.testMode)) return NextResponse.json({ error: "TJAI purchases are not available yet." }, { status: 503 });
    if (typeof body.intakeId !== "string" || !UUID_RE.test(body.intakeId)) return NextResponse.json({ error: "Complete your adult intake before purchasing." }, { status: 400 });
    const { data: intake, error } = await admin.from("tjai_intake_drafts").select("id,age,answers_json,locale").eq("id", body.intakeId).eq("user_id", user.id).gte("age", 18).maybeSingle();
    if (error) return NextResponse.json({ error: "Intake verification is unavailable." }, { status: 503 });
    if (!intake) return NextResponse.json({ error: "Complete your adult intake before purchasing." }, { status: 403 });
    if (!validateAdultIntake(intake.answers_json, intake.locale).ok) return NextResponse.json({ error: "intake_needs_review" }, { status: 409 });
    intakeId = intake.id;
  }
  // The client never supplies user, amount, provider IDs, test mode, or a redirect URL.
  const { data: order, error } = await admin.from("digital_checkout_intents").insert({
    user_id: user.id, email: user.email.trim().toLowerCase(), program_slug: product.slug, product_kind: product.kind,
    amount_minor: product.amountMinor, currency: "USD", store_id: config.storeId, product_id: mapping.productId,
    variant_id: mapping.variantId, test_mode: config.testMode, intake_id: intakeId, locale: body.locale
  }).select("id,program_slug,currency,amount_minor,test_mode,status").single();
  if (error || !order) return NextResponse.json({ error: "Purchase storage is unavailable." }, { status: 503 });
  return NextResponse.json({ order, coinsToEarn: 0, clientFlow: { action: "redirect_lemon", orderId: order.id, url: "" } });
}
