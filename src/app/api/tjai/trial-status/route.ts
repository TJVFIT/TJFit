import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TJAI_TRIAL_MESSAGE_LIMIT } from "@/lib/tjai/trial-config";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const isAdminByEmail = Boolean(authResult.user.email && isAdminEmail(authResult.user.email));
  const [{ data: sub }, { data: usage }] = await Promise.all([
    adminClient.from("user_subscriptions").select("tier,status").eq("user_id", authResult.user.id).maybeSingle(),
    adminClient.from("tjai_trial_usage").select("messages_used,trial_started_at,trial_ends_at").eq("user_id", authResult.user.id).maybeSingle()
  ]);

  const now = Date.now();
  const current = usage ?? null;
  const shouldReset = !current?.trial_ends_at || new Date(current.trial_ends_at).getTime() < now;
  let finalUsage = current;
  let isAdminByRole = false;
  if (!isAdminByEmail) {
    const { data: profile } = await adminClient.from("profiles").select("role").eq("id", authResult.user.id).maybeSingle();
    isAdminByRole = profile?.role === "admin";
  }
  const isAdmin = isAdminByEmail || isAdminByRole;

  if (!current || shouldReset) {
    const start = new Date();
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const payload = {
      user_id: authResult.user.id,
      messages_used: 0,
      trial_started_at: start.toISOString(),
      trial_ends_at: end.toISOString(),
      last_reset_at: start.toISOString()
    };
    const { data: resetData } = await adminClient
      .from("tjai_trial_usage")
      .upsert(payload, { onConflict: "user_id" })
      .select("messages_used,trial_started_at,trial_ends_at")
      .single();
    finalUsage = resetData ?? payload;
  }

  return NextResponse.json({
    tier: isAdmin ? "apex" : ((sub?.tier ?? "core") as "core" | "pro" | "apex"),
    status: sub?.status ?? "active",
    trial: {
      messagesUsed: isAdmin ? 0 : (finalUsage?.messages_used ?? 0),
      trialStartedAt: finalUsage?.trial_started_at ?? null,
      trialEndsAt: finalUsage?.trial_ends_at ?? null,
      messageLimit: isAdmin ? 999 : TJAI_TRIAL_MESSAGE_LIMIT
    },
    isAdmin
  });
}

