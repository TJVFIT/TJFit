import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const [{ data: sub }, { data: usage }, { data: purchase }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    admin.from("tjai_trial_usage").select("messages_used").eq("user_id", auth.user.id).maybeSingle(),
    admin
      .from("tjai_plan_purchases")
      .select("id")
      .eq("user_id", auth.user.id)
      .order("purchased_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";
  const used = Number(usage?.messages_used ?? 0);
  const remaining = Math.max(0, 10 - used);
  const access = getTJAIAccess(tier, {
    hasOneTimePlanPurchase: Boolean(purchase?.id),
    coreTrialMessagesRemaining: remaining
  });
  return NextResponse.json({ ...access, coreTrialMessagesRemaining: remaining });
}
