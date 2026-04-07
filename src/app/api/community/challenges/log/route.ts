import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { awardTJCoin } from "@/lib/tjcoin-server";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as { challengeId?: string; value?: number } | null;
  const challengeId = String(body?.challengeId ?? "");
  const value = Number(body?.value ?? 0);
  if (!challengeId || value <= 0) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { data: participation } = await admin
    .from("challenge_participants")
    .select("challenge_id,user_id,total_logged")
    .eq("challenge_id", challengeId)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!participation) return NextResponse.json({ error: "Join challenge first" }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);
  const { data: existingToday } = await admin
    .from("challenge_logs")
    .select("id")
    .eq("challenge_id", challengeId)
    .eq("user_id", auth.user.id)
    .gte("logged_at", `${today}T00:00:00.000Z`)
    .limit(1)
    .maybeSingle();
  if (existingToday) return NextResponse.json({ error: "Already logged today" }, { status: 409 });

  await admin.from("challenge_logs").insert({ challenge_id: challengeId, user_id: auth.user.id, value });
  await admin
    .from("challenge_participants")
    .update({ total_logged: Number(participation.total_logged ?? 0) + value })
    .eq("challenge_id", challengeId)
    .eq("user_id", auth.user.id);
  await awardTJCoin(auth.user.id, "workout_logged", 5, {
    metadata: { challengeId, value, source: "challenge_log" }
  });
  await enqueuePendingNotification(auth.user.id, "coins", "+5 TJCOIN for logging today");
  return NextResponse.json({ ok: true });
}

