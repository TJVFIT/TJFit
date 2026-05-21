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

  // Bug fix: prior version used `body.field !== false` which defaulted ANY
  // missing or non-false value (undefined, null, strings) to `true`. That
  // silently re-subscribed users to channels they'd previously opted out
  // of whenever the client sent a partial update (e.g. toggling just one
  // preference). Only fields explicitly provided as booleans are written;
  // the existing row supplies the baseline for everything else.
  const { data: existing } = await adminClient
    .from("user_email_preferences")
    .select("weekly_program,achievements,blog_updates,streak_milestones,referrals,platform_news")
    .eq("user_id", authResult.user.id)
    .maybeSingle();

  const pickBool = (key: string, fallback: boolean): boolean => {
    const v = body[key];
    if (typeof v === "boolean") return v;
    return fallback;
  };

  const payload = {
    user_id: authResult.user.id,
    weekly_program: pickBool("weekly_program", existing?.weekly_program ?? true),
    achievements: pickBool("achievements", existing?.achievements ?? true),
    blog_updates: pickBool("blog_updates", existing?.blog_updates ?? true),
    streak_milestones: pickBool("streak_milestones", existing?.streak_milestones ?? true),
    referrals: pickBool("referrals", existing?.referrals ?? true),
    platform_news: pickBool("platform_news", existing?.platform_news ?? true),
    updated_at: new Date().toISOString()
  };

  await adminClient.from("user_email_preferences").upsert(payload, { onConflict: "user_id" });
  return NextResponse.json({ ok: true });
}

