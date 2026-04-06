import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(_request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const adminClient = getSupabaseServerClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data: sub } = await adminClient
    .from("user_subscriptions")
    .select("tier")
    .eq("user_id", authResult.user.id)
    .maybeSingle();
  const tier = (sub?.tier ?? "core") as "core" | "pro" | "apex";
  if (tier !== "core") {
    return NextResponse.json({ ok: true, messagesUsed: 0, messageLimit: 10, unlimited: true });
  }

  const { data: usage } = await adminClient
    .from("tjai_trial_usage")
    .select("messages_used")
    .eq("user_id", authResult.user.id)
    .maybeSingle();
  const used = Number(usage?.messages_used ?? 0);
  if (used >= 10) {
    return NextResponse.json({ ok: false, code: "LIMIT_REACHED", messagesUsed: used, messageLimit: 10 }, { status: 402 });
  }

  const nextUsed = used + 1;
  await adminClient
    .from("tjai_trial_usage")
    .update({ messages_used: nextUsed })
    .eq("user_id", authResult.user.id);

  return NextResponse.json({ ok: true, messagesUsed: nextUsed, messageLimit: 10 });
}

