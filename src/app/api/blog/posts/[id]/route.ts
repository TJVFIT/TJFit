import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

  // Rate limit view increments per (IP, post) to prevent counter inflation
  // by a script hammering this endpoint. Reads still succeed; only the
  // increment is suppressed when out of budget. 30/min/IP/post is roughly
  // the rate of a real user refreshing aggressively.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const viewLimiter = await rateLimit({
    key: `blog-view:${ip}:${id}`,
    limit: 30,
    windowMs: 60_000
  });

  let views = Number(data.views ?? 0);
  if (viewLimiter.success) {
    // Atomic increment via RPC — prior code read→inc→write JS-side which
    // lost increments under concurrent loads. The RPC's single UPDATE
    // returns the new counter, so the response reflects it accurately.
    const { data: rpcRows, error: rpcError } = await admin.rpc("increment_blog_view_count", {
      p_id: id
    });
    if (rpcError) {
      console.error("[blog/posts/:id] view increment rpc failed", rpcError.message);
    } else {
      const next = typeof rpcRows === "number" ? rpcRows : Number(rpcRows ?? 0);
      if (Number.isFinite(next) && next > 0) views = next;
    }
  }

  return NextResponse.json({ post: { ...data, views } });
}
