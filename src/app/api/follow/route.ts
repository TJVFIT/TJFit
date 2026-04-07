import { NextRequest, NextResponse } from "next/server";

import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type AdminClient = NonNullable<ReturnType<typeof getSupabaseServerClient>>;

async function followerCount(admin: AdminClient, userId: string) {
  const { count } = await admin
    .from("user_follows")
    .select("*", { head: true, count: "exact" })
    .eq("following_id", userId);
  return Number(count ?? 0);
}

async function followingCount(admin: AdminClient, userId: string) {
  const { count } = await admin
    .from("user_follows")
    .select("*", { head: true, count: "exact" })
    .eq("follower_id", userId);
  return Number(count ?? 0);
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const userId = String(request.nextUrl.searchParams.get("user_id") ?? "").trim();
  if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 });

  const { data: row } = await admin
    .from("user_follows")
    .select("follower_id")
    .eq("follower_id", auth.user.id)
    .eq("following_id", userId)
    .maybeSingle();

  const [followers, following] = await Promise.all([followerCount(admin, userId), followingCount(admin, userId)]);
  return NextResponse.json({
    following: Boolean(row),
    follower_count: followers,
    following_count: following
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as { target_user_id?: string } | null;
  const targetUserId = String(body?.target_user_id ?? "").trim();
  if (!targetUserId) return NextResponse.json({ error: "target_user_id required" }, { status: 400 });
  if (targetUserId === auth.user.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  const { error } = await admin
    .from("user_follows")
    .upsert({ follower_id: auth.user.id, following_id: targetUserId }, { onConflict: "follower_id,following_id" });
  if (error) return NextResponse.json({ error: "Failed to follow user" }, { status: 500 });

  const [{ data: me }, count] = await Promise.all([
    admin.from("profiles").select("username,display_name").eq("id", auth.user.id).maybeSingle(),
    followerCount(admin, targetUserId)
  ]);

  const actorName = String(me?.display_name || me?.username || "Someone");
  await enqueuePendingNotification(targetUserId, "success", `${actorName} started following you`);

  return NextResponse.json({ following: true, follower_count: count });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as { target_user_id?: string } | null;
  const targetUserId = String(body?.target_user_id ?? "").trim();
  if (!targetUserId) return NextResponse.json({ error: "target_user_id required" }, { status: 400 });

  await admin.from("user_follows").delete().eq("follower_id", auth.user.id).eq("following_id", targetUserId);
  const count = await followerCount(admin, targetUserId);
  return NextResponse.json({ following: false, follower_count: count });
}
