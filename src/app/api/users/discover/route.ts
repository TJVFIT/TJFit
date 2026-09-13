import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Discovery is an opt-in public surface. A private plan or intake never
  // authorizes disclosing its owner's fitness goal to another member.
  const publicProfiles = () => admin.from("profiles")
    .select("id,username,display_name,avatar_url,current_streak,privacy_settings")
    .eq("is_searchable", true).eq("is_private", false).neq("id", auth.user.id);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [top, coaches, newMembers] = await Promise.all([
    publicProfiles().eq("privacy_settings->>show_streak", "true")
      .order("current_streak", { ascending: false }).limit(5),
    publicProfiles().eq("role", "coach").order("updated_at", { ascending: false }).limit(6),
    publicProfiles().gte("created_at", weekAgo).order("created_at", { ascending: false }).limit(8)
  ]);
  if ([top, coaches, newMembers].some(result => result.error)) {
    return NextResponse.json({ error: "Discovery is unavailable." }, { status: 503 });
  }
  type Row = { id: string; username: string | null; display_name: string | null; avatar_url: string | null;
    current_streak: number | null; privacy_settings: { show_streak?: boolean } | null };
  const cards = (rows: Row[] | null) => (rows ?? []).map(row => ({
    id: row.id, username: row.username, display_name: row.display_name, avatar_url: row.avatar_url,
    current_streak: row.privacy_settings?.show_streak === true ? row.current_streak : null
  }));
  return NextResponse.json({
    top_earners: cards(top.data), coaches: cards(coaches.data), new_members: cards(newMembers.data),
    similar_goal: []
  }, { headers: { "Cache-Control": "private, no-store" } });
}
