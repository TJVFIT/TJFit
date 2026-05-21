import { NextRequest, NextResponse } from "next/server";

import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { awardTJCoin } from "@/lib/tjcoin-server";

// Refuse implausibly large values (a "reps" / "minutes" / "km" field). The
// route previously accepted any positive number, letting a user inflate
// total_logged arbitrarily.
const VALUE_MAX = 10_000;

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const limiter = await rateLimit({
    key: `challenge-log:${auth.user.id}`,
    limit: 20,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as { challengeId?: string; value?: number } | null;
  const challengeId = String(body?.challengeId ?? "");
  const value = Number(body?.value ?? 0);
  if (!challengeId || !Number.isFinite(value) || value <= 0 || value > VALUE_MAX) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { data: participation } = await admin
    .from("challenge_participants")
    .select("challenge_id,user_id,total_logged")
    .eq("challenge_id", challengeId)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!participation) {
    return NextResponse.json({ error: "Join challenge first" }, { status: 400 });
  }

  // Atomic "one log per day" via the new unique partial index on
  // (user_id, challenge_id, logged_at::date). Previously a SELECT-then-INSERT
  // race could double-insert under concurrent requests, double-awarding
  // TJCOIN and double-incrementing total_logged.
  const { error: insertError } = await admin
    .from("challenge_logs")
    .insert({ challenge_id: challengeId, user_id: auth.user.id, value });
  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Already logged today" }, { status: 409 });
    }
    console.error("[challenges/log] insert failed", insertError.message, insertError.code);
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }

  // total_logged still uses read-then-write; same-user double-day-log is
  // impossible due to the unique index above, so the only way to race is at
  // midnight day-boundaries (acceptable). Two DIFFERENT users target
  // different rows and don't conflict.
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
