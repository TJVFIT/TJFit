import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";
import { buildTJAIPlanPdf } from "@/lib/tjai-pdf";
import { getLatestTjaiPlan } from "@/lib/tjai-plan-store";
import type { TJAIPlan } from "@/lib/tjai-types";

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const [subscription, purchase, profile, savedPlan] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    admin.from("tjai_plan_purchases").select("id").eq("user_id", auth.user.id).order("purchased_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("profiles").select("display_name,username").eq("id", auth.user.id).maybeSingle(),
    getLatestTjaiPlan(admin, auth.user.id)
  ]);

  if (!savedPlan?.plan_json) {
    return NextResponse.json({ error: "No saved TJAI plan found" }, { status: 404 });
  }

  const tier = (subscription.data?.tier ?? "core") as "core" | "pro" | "apex";
  const access = getTJAIAccess(tier, { hasOneTimePlanPurchase: Boolean(purchase.data?.id) });
  if (!access.canDownloadPdf) {
    return NextResponse.json({ error: "Upgrade required to download PDF" }, { status: 402 });
  }

  const plan = savedPlan.plan_json as TJAIPlan;
  const answers = (savedPlan.answers_json as Record<string, unknown> | null) ?? {};
  const userName = String(profile.data?.display_name || profile.data?.username || "TJFit Member");
  const goal = titleCase(String(answers?.s2_goal ?? "Transformation"));

  const buffer = buildTJAIPlanPdf({
    userName,
    goal,
    generatedAt: String(savedPlan.created_at ?? new Date().toISOString()),
    plan
  });

  if (purchase.data?.id) {
    await admin.from("tjai_plan_purchases").update({ pdf_downloaded: true }).eq("id", purchase.data.id);
  }

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="tjai-plan-${auth.user.id.slice(0, 8)}.pdf"`
    }
  });
}
