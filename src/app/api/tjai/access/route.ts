import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getTJAIAccess } from "@/lib/tjai-access";
import { TJAI_TRIAL_MESSAGE_LIMIT } from "@/lib/tjai/trial-config";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const isAdminByEmail = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  const [{ data: sub }, { data: usage }, { data: purchase }] = await Promise.all([
    admin.from("user_subscriptions").select("tier").eq("user_id", auth.user.id).maybeSingle(),
    admin
      .from("tjai_trial_usage")
      .select("messages_used,trial_ends_at")
      .eq("user_id", auth.user.id)
      .maybeSingle(),
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
  // Trial-expiry guard: prior code subtracted from a hardcoded 10 (drift from
  // the canonical constant) and ignored trial_ends_at entirely, so expired
  // trials still reported credits while the chat endpoint refused them.
  const trialEndsAt = usage?.trial_ends_at ? new Date(usage.trial_ends_at).getTime() : 0;
  const trialActive = trialEndsAt === 0 ? true : trialEndsAt > Date.now();
  const remaining = trialActive ? Math.max(0, TJAI_TRIAL_MESSAGE_LIMIT - used) : 0;
  let isAdminByRole = false;
  if (!isAdminByEmail) {
    const { data: profile } = await admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
    isAdminByRole = profile?.role === "admin";
  }
  const isAdmin = isAdminByEmail || isAdminByRole;
  const access = getTJAIAccess(tier, {
    hasOneTimePlanPurchase: Boolean(purchase?.id),
    coreTrialMessagesRemaining: remaining,
    isAdmin
  });
  return NextResponse.json({ ...access, coreTrialMessagesRemaining: isAdmin ? 999 : remaining, isAdmin });
}
