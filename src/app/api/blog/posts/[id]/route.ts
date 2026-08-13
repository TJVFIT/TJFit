import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/require-auth";
import { isAdminEmail } from "@/lib/auth-utils";
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

// Ported from the retired System B route (community/blogs DELETE): admin or
// the post's own author may delete. System A had no delete path before this;
// without it, community-hub's existing delete button would silently break
// once System B's route was removed.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const id = params.id;
  const { data: post } = await admin
    .from("community_blog_posts")
    .select("id,author_id,cover_image_url")
    .eq("id", id)
    .maybeSingle();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  let isAdmin = Boolean(auth.user.email && isAdminEmail(auth.user.email));
  if (!isAdmin) {
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }
  if (!isAdmin && post.author_id !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await admin.from("community_blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Storage cleanup ported from System B's delete (review catch: the first
  // port dropped it, orphaning a cover image on every delete). A stores the
  // full public URL, so derive the object path; best-effort like B — a
  // failed removal never fails the delete.
  if (typeof post.cover_image_url === "string" && post.cover_image_url) {
    const marker = "/storage/v1/object/public/community-blog-images/";
    const idx = post.cover_image_url.indexOf(marker);
    if (idx !== -1) {
      const objectPath = post.cover_image_url.slice(idx + marker.length);
      if (objectPath) {
        await admin.storage
          .from("community-blog-images")
          .remove([objectPath])
          .catch(() => undefined);
      }
    }
  }

  return NextResponse.json({ success: true });
}
