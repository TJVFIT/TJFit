import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";
import { buildTJAIPlanPdf } from "@/lib/tjai-pdf";
import type { TJAIPlan } from "@/lib/tjai-types";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const [{ data: subscription }, { data: purchase }, { data: profile }, { data: savedPlan }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    admin.from("tjai_plan_purchases").select("id").eq("user_id", auth.user.id).order("purchased_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("profiles").select("display_name,username").eq("id", auth.user.id).maybeSingle(),
    admin
      .from("saved_tjai_plans")
      .select("id,plan_json,answers_json,created_at")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  if (!savedPlan?.plan_json) {
    return NextResponse.json({ error: "No saved TJAI plan found" }, { status: 404 });
  }

  const tier = (subscription?.tier ?? "core") as "core" | "pro" | "apex";
  const access = getTJAIAccess(tier, { hasOneTimePlanPurchase: Boolean(purchase?.id) });
  if (!access.canDownloadPdf) {
    return NextResponse.json({ error: "Upgrade required to download PDF" }, { status: 402 });
  }

  const plan = savedPlan.plan_json as TJAIPlan;
  const answers = (savedPlan.answers_json as Record<string, unknown> | null) ?? {};
  const userName = String(profile?.display_name || profile?.username || "TJFit Member");
  const goal = String(answers?.s2_goal ?? "Transformation");

  const buffer = buildTJAIPlanPdf({
    userName,
    goal,
    generatedAt: String(savedPlan.created_at ?? new Date().toISOString()),
    plan
  });

  if (purchase?.id) {
    await admin.from("tjai_plan_purchases").update({ pdf_downloaded: true }).eq("id", purchase.id);
  }

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tjai-plan-${auth.user.id.slice(0, 8)}.pdf"`
    }
  });
}
