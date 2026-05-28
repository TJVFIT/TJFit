import { NextRequest, NextResponse } from "next/server";

import { resolveBundleGumroadUrl } from "@/lib/gumroad/resolve";
import {
  isGumroadCheckoutStored,
  isLegacyCheckoutStored
} from "@/lib/payments/stored-provider";
import { readRequestJson } from "@/lib/read-request-json";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Resolves the hosted Gumroad checkout URL for a pending order.
 * Browser then redirects via window.location.href = url. Fulfillment is
 * handled by the Gumroad webhook (`src/app/api/webhooks/gumroad/route.ts`).
 */
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await readRequestJson(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as Record<string, unknown>;
  const orderId = String(body.orderId ?? "").trim();
  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data: order } = await adminClient
    .from("program_orders")
    .select("id,user_id,status,provider,program_slug,locale")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "pending") {
    return NextResponse.json({ error: "Order is not awaiting payment." }, { status: 409 });
  }

  if (order.provider === "test") {
    return NextResponse.json(
      { error: "This order uses test checkout. Complete it with the simulated flow." },
      { status: 400 }
    );
  }

  if (!isGumroadCheckoutStored(order.provider) && !isLegacyCheckoutStored(order.provider)) {
    return NextResponse.json(
      { error: "This order cannot be paid (unrecognized provider)." },
      { status: 400 }
    );
  }

  const url = await resolveBundleGumroadUrl(adminClient, {
    programSlug: order.program_slug,
    orderId: order.id,
    email: user.email ?? undefined,
    userId: user.id,
    locale: order.locale ?? undefined
  });

  if (!url) {
    return NextResponse.json(
      {
        code: "GUMROAD_NOT_CONFIGURED",
        error: `No Gumroad product URL configured for slug "${order.program_slug}". Set GUMROAD_PRODUCT_${order.program_slug.toUpperCase().replace(/-/g, "_")} or GUMROAD_DEFAULT_PRODUCT_URL.`
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ url, customerEmail: user.email ?? undefined });
}
