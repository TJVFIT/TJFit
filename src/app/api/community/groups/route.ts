import { NextRequest, NextResponse } from "next/server";

import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { requireAuth } from "@/lib/require-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// PRESET_GROUPS are seeded via supabase/migrations/20260520180000 so the GET
// endpoint doesn't have to upsert them on every request. If you need to
// edit the preset list, update both the migration and any subsequent
// migration so all environments stay in sync.

export async function GET() {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  let viewerId: string | null = null;
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    viewerId = user?.id ?? null;
  } catch {
    viewerId = null;
  }

  const groupsResult = await admin
    .from("community_groups")
    .select("id,slug,name,description")
    .order("name", { ascending: true });
  const membershipsResult = viewerId
    ? await admin.from("group_members").select("group_id").eq("user_id", viewerId)
    : { data: [] as Array<{ group_id: string }> };
  const groups = groupsResult.data ?? [];
  const memberships = membershipsResult.data ?? [];
  const mySet = new Set((memberships ?? []).map((m) => m.group_id));

  // Per-group member counts. Could collapse to a single aggregate via SQL
  // but N=11 today and the queries hit the (group_id) index — leave the
  // optimization until a real perf issue surfaces.
  const items = await Promise.all(
    (groups ?? []).map(async (g) => {
      const { count } = await admin
        .from("group_members")
        .select("*", { head: true, count: "exact" })
        .eq("group_id", g.id);
      return { ...g, joined: mySet.has(g.id), memberCount: count ?? 0 };
    })
  );

  return NextResponse.json({ groups: items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const body = (await request.json().catch(() => null)) as { groupId?: string; action?: "join" | "leave" } | null;
  const groupId = String(body?.groupId ?? "");
  const action = body?.action;
  if (!groupId) {
    return NextResponse.json({ error: "groupId required" }, { status: 400 });
  }
  // Strict allowlist — previously anything not "join" fell through to the
  // unconditional delete branch, so action: "ban" / "delete" would leave the
  // group silently.
  if (action !== "join" && action !== "leave") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "join") {
    // Detect new-vs-repeat join so we only notify on actual new membership.
    // Prior version upserted and notified every call, spamming the inbox.
    const { data: existing } = await admin
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (!existing) {
      const { error } = await admin
        .from("group_members")
        .insert({ group_id: groupId, user_id: auth.user.id });
      if (error && error.code !== "23505") {
        console.error("[community/groups] join failed", error.message, error.code);
        return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
      }
      if (!error) {
        await enqueuePendingNotification(auth.user.id, "success", "Welcome to the group!");
      }
    }
    return NextResponse.json({ ok: true });
  }

  // action === "leave"
  const { error } = await admin
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", auth.user.id);
  if (error) {
    console.error("[community/groups] leave failed", error.message, error.code);
    return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
