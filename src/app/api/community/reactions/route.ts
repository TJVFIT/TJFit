import { NextRequest, NextResponse } from "next/server";

import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { awardTJCoin } from "@/lib/tjcoin-server";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

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

  if (post.author_id === auth.user.id) {
    return NextResponse.json({ ok: true, awarded: false });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: log } = await admin
    .from("reaction_coin_log")
    .select("coins_earned_today")
    .eq("user_id", post.author_id)
    .eq("date", today)
    .maybeSingle();

  const current = Number(log?.coins_earned_today ?? 0);
  if (current >= 10) {
    return NextResponse.json({ ok: true, awarded: false, daily_cap_reached: true });
  }

  await awardTJCoin(post.author_id, "post_received_reaction", 1, {
    metadata: { postId, reactorId: auth.user.id }
  });

  await admin.from("reaction_coin_log").upsert(
    {
      user_id: post.author_id,
      date: today,
      coins_earned_today: current + 1
    },
    { onConflict: "user_id,date" }
  );

  await enqueuePendingNotification(post.author_id, "coins", "Someone reacted to your post ⚡");

  return NextResponse.json({ ok: true, awarded: true, coins_earned_today: current + 1 });
}
