import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * View-count beacon for blog posts (WP-INFRA-07). The increment used to run
 * inside blog/[slug]'s server render, which forced the page dynamic via
 * headers(); moving it here lets the page serve from ISR cache while views
 * keep counting per real visit. Same rate-limit key shape as before, so a
 * refresh loop still can't inflate counts.
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const limiter = await rateLimit({
    key: `blog-view:${ip}:${params.id}`,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.success) return NextResponse.json({ ok: true, limited: true });

  // Only count published posts — the RPC's own guard is the last word, but
  // skipping the call for unknown ids keeps error noise out of the logs.
  const { data: post } = await admin
    .from("community_blog_posts")
    .select("id")
    .eq("id", params.id)
    .eq("status", "published")
    .maybeSingle();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const { error } = await admin.rpc("increment_blog_view_count", { p_id: params.id });
  if (error) {
    console.error("[blog/posts/[id]/view] increment failed", error.message);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
