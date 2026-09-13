import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const PAGE_SIZE = 20;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function readFollowList(request: NextRequest, direction: "followers" | "following") {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 503 });
  const userId = request.nextUrl.searchParams.get("user_id")?.trim() ?? "";
  const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
  if (!UUID_RE.test(userId) || !Number.isSafeInteger(page) || page < 1 || page > 10000) {
    return NextResponse.json({ error: "Invalid user or page." }, { status: 400 });
  }
  const target = await admin.from("profiles").select("id,is_private").eq("id", userId).maybeSingle();
  if (target.error) return NextResponse.json({ error: "Profile unavailable." }, { status: 503 });
  // Existing profile-card policy gives other viewers only a private identity
  // card. Following someone does not grant access to their relationship graph.
  if (!target.data || (target.data.is_private !== false && userId !== auth.user.id)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const subject = direction === "followers" ? "following_id" : "follower_id";
  const related = direction === "followers" ? "follower_id" : "following_id";
  const from = (page - 1) * PAGE_SIZE;
  const result = await admin.from("user_follows").select(`${related},created_at`)
    .eq(subject, userId).order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1);
  if (result.error) return NextResponse.json({ error: "Relationships unavailable." }, { status: 503 });
  const rows = (result.data ?? []) as unknown as Array<Record<string, string>>;
  const ids = rows.map(row => row[related]);
  const profiles = ids.length
    ? await admin.from("profiles").select("id,username,display_name,avatar_url").in("id", ids)
    : { data: [], error: null };
  if (profiles.error) return NextResponse.json({ error: "Relationships unavailable." }, { status: 503 });
  const map = new Map((profiles.data ?? []).map(profile => [profile.id, profile]));
  const items = rows.map(row => ({ id: row[related], created_at: row.created_at, ...(map.get(row[related]) ?? {}) }));
  return NextResponse.json({ items, page, page_size: PAGE_SIZE }, { headers: { "Cache-Control": "private, no-store" } });
}
