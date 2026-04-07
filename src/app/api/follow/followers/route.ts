import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const userId = String(request.nextUrl.searchParams.get("user_id") ?? "").trim();
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1));
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: rows } = await admin
    .from("user_follows")
    .select("follower_id,created_at")
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  const ids = (rows ?? []).map((row) => row.follower_id);
  const { data: profiles } = await admin.from("profiles").select("id,username,display_name,avatar_url").in("id", ids);
  const map = new Map((profiles ?? []).map((p) => [p.id, p]));

  const items = (rows ?? []).map((row) => ({
    id: row.follower_id,
    created_at: row.created_at,
    ...(map.get(row.follower_id) ?? {})
  }));

  return NextResponse.json({ items, page, page_size: PAGE_SIZE });
}
