import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  const id = params.id;
  const { data } = await admin
    .from("community_blog_posts")
    .select("id,title,content,author_id,author_name,author_type,created_at,category,views,read_time_minutes")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await admin.from("community_blog_posts").update({ views: Number(data.views ?? 0) + 1 }).eq("id", id);
  return NextResponse.json({ post: { ...data, views: Number(data.views ?? 0) + 1 } });
}

