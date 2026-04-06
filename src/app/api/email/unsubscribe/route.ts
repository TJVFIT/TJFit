import { NextRequest, NextResponse } from "next/server";

import { verifyUnsubscribeToken } from "@/lib/email-preferences";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";
  const verified = verifyUnsubscribeToken(token);
  if (!verified) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const adminClient = getSupabaseServerClient();
  if (!adminClient) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  await adminClient.from("user_email_preferences").upsert(
    {
      user_id: verified.userId,
      weekly_program: false,
      achievements: false,
      blog_updates: false,
      streak_milestones: false,
      referrals: false,
      platform_news: false,
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id" }
  );

  return NextResponse.json({ ok: true, message: "You have been unsubscribed." });
}

