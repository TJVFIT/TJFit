import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const adminClient = getSupabaseServerClient();
  if (!adminClient) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data } = await adminClient
    .from("user_email_preferences")
    .select("*")
    .eq("user_id", authResult.user.id)
    .maybeSingle();

  return NextResponse.json({
    preferences: data ?? {
      weekly_program: true,
      achievements: true,
      blog_updates: true,
      streak_milestones: true,
      referrals: true,
      platform_news: true
    }
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.response;
  const adminClient = getSupabaseServerClient();
  if (!adminClient) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const payload = {
    user_id: authResult.user.id,
    weekly_program: body.weekly_program !== false,
    achievements: body.achievements !== false,
    blog_updates: body.blog_updates !== false,
    streak_milestones: body.streak_milestones !== false,
    referrals: body.referrals !== false,
    platform_news: body.platform_news !== false,
    updated_at: new Date().toISOString()
  };

  await adminClient.from("user_email_preferences").upsert(payload, { onConflict: "user_id" });
  return NextResponse.json({ ok: true });
}

