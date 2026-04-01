import { NextRequest, NextResponse } from "next/server";
import { getCheckoutAdapterForStoredProvider } from "@/lib/payments";
import { readRequestJson } from "@/lib/read-request-json";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Future: return iframe/token/redirect payload for the active gateway adapter.
 * Wire your PSP here without changing checkout UI — call when `clientFlow.action === "await_gateway"`.
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
    .select("id,user_id,status,provider")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "pending") {
    return NextResponse.json({ error: "Order is not awaiting payment." }, { status: 409 });
  }

  const adapter = getCheckoutAdapterForStoredProvider(order.provider);
  if (!adapter || adapter.allowsSimulatedPaidCompletion) {
    return NextResponse.json(
      { error: "No external payment session is required for this order." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      code: "PAYMENT_ADAPTER_PENDING",
      message:
        "Gateway session creation is not implemented in this build. Implement the adapter hook for your provider."
    },
    { status: 501 }
  );
}
