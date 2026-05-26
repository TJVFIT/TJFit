import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const DAILY_REACTION_CAP = 10;

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  // Anti-spam: bound the rate at which a single reactor can fire this
  // endpoint. Even legitimate users don't react faster than this.
  const limiter = await rateLimit({
    key: `community-react:${auth.user.id}`,
    limit: 30,
    windowMs: 60_000
  });
  if (!limiter.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as { postId?: string } | null;
  const postId = String(body?.postId ?? "").trim();
  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }

  const { data: post } = await admin
    .from("community_blog_posts")
    .select("id,author_id")
    .eq("id", postId)
    .maybeSingle();

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Atomic award: locks the author's daily cap row, checks reactor
  // idempotency via ledger, increments counter + ledger + wallet together,
  // so concurrent reactions cannot exceed the cap and duplicate reactions
  // from the same reactor are rejected. Previously the flow was 4 separate
  // round-trips with TOCTOU and no reactor-side dedup.
  const { data: rpcRows, error: rpcError } = await admin.rpc("tjfit_award_reaction", {
    p_reactor_id: auth.user.id,
    p_author_id: post.author_id,
    p_post_id: postId,
    p_daily_cap: DAILY_REACTION_CAP
  });

  if (rpcError) {
    console.error("[community/reactions] rpc failed", rpcError.message, rpcError.code);
    return NextResponse.json({ error: "Could not record reaction." }, { status: 500 });
  }

  const result = (Array.isArray(rpcRows) ? rpcRows[0] : rpcRows) as
    | { awarded?: boolean; reason?: string }
    | null;

  // TJCoin retired — no longer enqueue a coin-earned notification on react.

  return NextResponse.json({
    ok: true,
    awarded: Boolean(result?.awarded),
    daily_cap_reached: result?.reason === "daily_cap_reached",
    already_reacted: result?.reason === "already_reacted"
  });
}
