import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const id = request.nextUrl.searchParams.get("id")?.trim();
  const category = request.nextUrl.searchParams.get("category")?.trim();
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data: sameCategory } = await admin
    .from("community_blog_posts")
    .select("id,title,content,author_name,category,views,created_at,read_time_minutes,cover_image_url")
    .eq("status", "published")
    .neq("id", id)
    .eq("category", category ?? "")
    .order("views", { ascending: false })
    .limit(3);

  const related = [...(sameCategory ?? [])];
  if (related.length < 3) {
    const exclude = [id, ...related.map((p) => String(p.id))];
    const { data: fallback } = await admin
      .from("community_blog_posts")
      .select("id,title,content,author_name,category,views,created_at,read_time_minutes,cover_image_url")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(8);
    for (const row of fallback ?? []) {
      if (exclude.includes(String(row.id))) continue;
      related.push(row);
      if (related.length >= 3) break;
    }
  }

  return NextResponse.json({ posts: related.slice(0, 3) });
}
