import { NextRequest, NextResponse } from "next/server";

import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as { challengeId?: string } | null;
  const challengeId = String(body?.challengeId ?? "");
  if (!challengeId) return NextResponse.json({ error: "challengeId required" }, { status: 400 });

  // Detect whether this is a new join or a repeat click so we only enqueue
  // the "challenge joined" notification once. Prior version upserted and
  // notified on every call, spamming the user's notification inbox.
  const { data: existing } = await admin
    .from("challenge_participants")
    .select("user_id")
    .eq("challenge_id", challengeId)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await admin
      .from("challenge_participants")
      .insert({ challenge_id: challengeId, user_id: auth.user.id });
    // 23505 = concurrent join beat us to it. Treat as already-joined.
    if (error && error.code !== "23505") {
      console.error("[challenges/join] insert failed", error.message, error.code);
      return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 });
    }
    if (!error) {
      await enqueuePendingNotification(auth.user.id, "success", "Challenge joined! Good luck");
    }
  }

  return NextResponse.json({ ok: true });
}
