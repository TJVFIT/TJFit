import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: me } = await admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (me?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: draft } = await admin
    .from("community_blog_posts")
    .select("id,title,content,category,tags,status,author_type")
    .eq("id", params.id)
    .eq("status", "admin_draft")
    .maybeSingle();

  if (!draft) return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  return NextResponse.json({ draft });
}
