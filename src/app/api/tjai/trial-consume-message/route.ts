import { NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth-utils";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { TJAI_TRIAL_MESSAGE_LIMIT } from "@/lib/tjai/trial-config";

export async function POST(_request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const isAdminByEmail = Boolean(authResult.user.email && isAdminEmail(authResult.user.email));
  if (isAdminByEmail) {
    return NextResponse.json({ ok: true, messagesUsed: 0, messageLimit: 999, unlimited: true });
  }

  const { data: adminProfile } = await adminClient.from("profiles").select("role").eq("id", authResult.user.id).maybeSingle();
  if (adminProfile?.role === "admin") {
    return NextResponse.json({ ok: true, messagesUsed: 0, messageLimit: 999, unlimited: true });
  }

  const { data: sub } = await adminClient
    .from("user_subscriptions")
    .select("tier")
    .eq("user_id", authResult.user.id)
    .maybeSingle();
  const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";
  if (tier !== "core") {
    return NextResponse.json({ ok: true, messagesUsed: 0, messageLimit: TJAI_TRIAL_MESSAGE_LIMIT, unlimited: true });
  }

  const { data: usage } = await adminClient
    .from("tjai_trial_usage")
    .select("messages_used")
    .eq("user_id", authResult.user.id)
    .maybeSingle();
  const used = Number(usage?.messages_used ?? 0);
  if (used >= TJAI_TRIAL_MESSAGE_LIMIT) {
    return NextResponse.json({ ok: false, code: "LIMIT_REACHED", messagesUsed: used, messageLimit: TJAI_TRIAL_MESSAGE_LIMIT }, { status: 402 });
  }

  const nextUsed = used + 1;
  const { error: updateError } = await adminClient
    .from("tjai_trial_usage")
    .update({ messages_used: nextUsed })
    .eq("user_id", authResult.user.id);
  if (updateError) {
    console.error("trial-consume-message: update failed", updateError);
    return NextResponse.json({ error: "Failed to record trial usage. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, messagesUsed: nextUsed, messageLimit: TJAI_TRIAL_MESSAGE_LIMIT });
}

