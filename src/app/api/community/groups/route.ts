import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { enqueuePendingNotification } from "@/lib/pending-notifications";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const PRESET_GROUPS = [
  { slug: "fat-loss-gang", name: "Fat Loss Gang", description: "Goal-focused fat loss group." },
  { slug: "bulk-season", name: "Bulk Season", description: "Muscle gain accountability group." },
  { slug: "home-warriors", name: "Home Warriors", description: "Home training members." },
  { slug: "gym-rats", name: "Gym Rats", description: "Gym-focused athletes." },
  { slug: "beginners", name: "Beginners", description: "Starter-friendly progress group." },
  { slug: "advanced-athletes", name: "Advanced Athletes", description: "Experienced training group." },
  { slug: "en-community", name: "EN Community", description: "English community feed." },
  { slug: "tr-community", name: "TR Community", description: "Turkish community feed." },
  { slug: "ar-community", name: "AR Community", description: "Arabic community feed." },
  { slug: "es-community", name: "ES Community", description: "Spanish community feed." },
  { slug: "fr-community", name: "FR Community", description: "French community feed." }
];

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  await admin.from("community_groups").upsert(PRESET_GROUPS, { onConflict: "slug" });
  const [{ data: groups }, { data: memberships }] = await Promise.all([
    admin.from("community_groups").select("id,slug,name,description").order("name", { ascending: true }),
    admin.from("group_members").select("group_id").eq("user_id", auth.user.id)
  ]);
  const mySet = new Set((memberships ?? []).map((m) => m.group_id));

  const items = await Promise.all(
    (groups ?? []).map(async (g) => {
      const { count } = await admin.from("group_members").select("*", { head: true, count: "exact" }).eq("group_id", g.id);
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
  if (!groupId || !action) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  if (action === "join") {
    const { error } = await admin
      .from("group_members")
      .upsert({ group_id: groupId, user_id: auth.user.id }, { onConflict: "group_id,user_id" });
    if (error) return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
    await enqueuePendingNotification(auth.user.id, "success", "Welcome to the group!");
    return NextResponse.json({ ok: true });
  }
  const { error } = await admin.from("group_members").delete().eq("group_id", groupId).eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

