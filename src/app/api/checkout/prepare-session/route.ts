import { NextRequest, NextResponse } from "next/server";
import { resolvePaymentBackend } from "@/lib/payments";
import { getDigitalProduct, getLemonCheckoutConfig, UUID_RE } from "@/lib/payments/lemon/config";
import { createLemonCheckout, isLemonCheckoutUrl, type DigitalIntent } from "@/lib/payments/lemon/client";
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
  if (!isJsonObject(parsed.value) || typeof parsed.value.orderId !== "string" || !UUID_RE.test(parsed.value.orderId)) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Purchase storage is unavailable." }, { status: 503 });
  const { data, error } = await admin.from("digital_checkout_intents").select("*").eq("id", parsed.value.orderId).eq("user_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Purchase storage is unavailable." }, { status: 503 });
  if (!data) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const intent = data as DigitalIntent;
  if (intent.product_kind === "tjai_pass" && !isTjaiPassCheckoutReady(config.testMode)) return NextResponse.json({ error: "TJAI purchases are not available yet." }, { status: 503 });
  const product = getDigitalProduct(intent.program_slug), mapping = config.products[intent.program_slug];
  if (intent.status !== "pending" || Date.parse(intent.expires_at) <= Date.now()) return NextResponse.json({ error: "This checkout has ended. Start a new purchase." }, { status: 409 });
  if (!product || !mapping || intent.amount_minor !== product.amountMinor || intent.test_mode !== config.testMode || intent.store_id !== config.storeId || intent.product_id !== mapping.productId || intent.variant_id !== mapping.variantId || intent.email !== user.email?.trim().toLowerCase()) return NextResponse.json({ error: "Checkout configuration changed. Start again." }, { status: 409 });
  if (intent.product_kind === "tjai_pass") {
    if (!intent.intake_id || !UUID_RE.test(intent.intake_id)) return NextResponse.json({ error: "intake_needs_review" }, { status: 409 });
    const { data: intake, error: intakeError } = await admin.from("tjai_intake_drafts").select("id,age,answers_json,locale")
      .eq("id", intent.intake_id).eq("user_id", user.id).gte("age", 18).maybeSingle();
    if (intakeError) return NextResponse.json({ error: "Intake verification is unavailable." }, { status: 503 });
    if (!intake || !validateAdultIntake(intake.answers_json, intake.locale).ok) return NextResponse.json({ error: "intake_needs_review" }, { status: 409 });
  }
  if (intent.checkout_url && isLemonCheckoutUrl(intent.checkout_url)) return NextResponse.json({ url: intent.checkout_url, testMode: intent.test_mode });
  try {
    const checkout = await createLemonCheckout(config, intent);
    // Concurrent preparations expose only the first persisted session URL.
    const { data: saved, error: saveError } = await admin.from("digital_checkout_intents").update({ checkout_id: checkout.id, checkout_url: checkout.url })
      .eq("id", intent.id).eq("status", "pending").is("checkout_url", null).select("checkout_url").maybeSingle();
    if (saveError) throw new Error("Checkout storage failed");
    if (saved?.checkout_url) return NextResponse.json({ url: saved.checkout_url, testMode: intent.test_mode });
    const { data: current } = await admin.from("digital_checkout_intents").select("checkout_url,status").eq("id", intent.id).eq("user_id", user.id).maybeSingle();
    if (current?.status !== "pending" || !isLemonCheckoutUrl(current?.checkout_url)) throw new Error("Checkout changed");
    return NextResponse.json({ url: current.checkout_url, testMode: intent.test_mode });
  } catch {
    return NextResponse.json({ error: "Secure checkout is unavailable. No payment was completed here." }, { status: 503 });
  }
}
