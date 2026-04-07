import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const body = (await request.json().catch(() => null)) as { challengeId?: string } | null;
  const challengeId = String(body?.challengeId ?? "");
  if (!challengeId) return NextResponse.json({ error: "challengeId required" }, { status: 400 });

  const { error } = await admin
    .from("challenge_participants")
    .upsert({ challenge_id: challengeId, user_id: auth.user.id }, { onConflict: "challenge_id,user_id" });
  if (error) return NextResponse.json({ error: "Failed to join challenge" }, { status: 500 });
  await enqueuePendingNotification(auth.user.id, "success", "Challenge joined! Good luck 💪");
  return NextResponse.json({ ok: true });
}

