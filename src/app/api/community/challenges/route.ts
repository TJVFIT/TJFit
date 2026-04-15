import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  let viewerId: string | null = null;
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    viewerId = user?.id ?? null;
  } catch {
    viewerId = null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: challenges } = await admin
    .from("community_challenges")
    .select("id,title,description,metric_type,start_date,end_date,coin_prize_1st,coin_prize_2nd,coin_prize_3rd,coin_completion_reward")
    .lte("start_date", today)
    .order("end_date", { ascending: true });

  const challengeList = challenges ?? [];
  if (challengeList.length === 0) {
    return NextResponse.json({ challenges: [] });
  }

  const challengeIds = challengeList.map((c) => c.id);

  // Batch all queries across challenges — replaces N×4 queries with 4 total
  const [
    { data: allParticipants },
    { data: viewerJoined },
    { data: viewerTodayLogs },
    { data: allLogs }
  ] = await Promise.all([
    admin
      .from("challenge_participants")
      .select("challenge_id,user_id")
      .in("challenge_id", challengeIds),
    viewerId
      ? admin
          .from("challenge_participants")
          .select("challenge_id,user_id")
          .in("challenge_id", challengeIds)
          .eq("user_id", viewerId)
      : Promise.resolve({ data: [] as Array<{ challenge_id: string; user_id: string }> }),
    viewerId
      ? admin
          .from("challenge_logs")
          .select("challenge_id,value,logged_at")
          .in("challenge_id", challengeIds)
          .eq("user_id", viewerId)
          .gte("logged_at", `${today}T00:00:00.000Z`)
      : Promise.resolve({ data: [] as Array<{ challenge_id: string; value: number; logged_at: string }> }),
    admin
      .from("challenge_logs")
      .select("challenge_id,user_id,value")
      .in("challenge_id", challengeIds)
  ]);

  // Index all fetched data by challenge_id
  const participantCountMap = new Map<string, number>();
  for (const row of allParticipants ?? []) {
    participantCountMap.set(row.challenge_id, (participantCountMap.get(row.challenge_id) ?? 0) + 1);
  }
  const viewerJoinedSet = new Set((viewerJoined ?? []).map((r) => r.challenge_id));
  const viewerTodayMap = new Map<string, { value: number; logged_at: string }>();
  for (const row of viewerTodayLogs ?? []) {
    if (!viewerTodayMap.has(row.challenge_id)) viewerTodayMap.set(row.challenge_id, row);
  }
  const logsByChallengeId = new Map<string, Array<{ user_id: string; value: number }>>();
  for (const row of allLogs ?? []) {
    const arr = logsByChallengeId.get(row.challenge_id) ?? [];
    arr.push(row);
    logsByChallengeId.set(row.challenge_id, arr);
  }

  const items = challengeList.map((challenge) => {
    const logs = logsByChallengeId.get(challenge.id) ?? [];
    const scoreMap = new Map<string, number>();
    for (const row of logs) {
      scoreMap.set(row.user_id, (scoreMap.get(row.user_id) ?? 0) + Number(row.value ?? 0));
    }
    const sorted = [...scoreMap.entries()]
      .map(([userId, total]) => ({ userId, total }))
      .sort((a, b) => b.total - a.total);
    const topUsers = sorted.slice(0, 10);
    const myRank = viewerId ? sorted.findIndex((entry) => entry.userId === viewerId) : -1;
    const todayLog = viewerTodayMap.get(challenge.id) ?? null;

    return {
      ...challenge,
      participants: participantCountMap.get(challenge.id) ?? 0,
      joined: viewerJoinedSet.has(challenge.id),
      todayLogged: Boolean(todayLog),
      todayValue: todayLog?.value ?? null,
      leaderboard: topUsers,
      myRank: viewerId && myRank >= 0 ? myRank + 1 : null
    };
  });

  return NextResponse.json({ challenges: items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: profile } = await admin.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const payload = {
    title: String(body.title ?? "").trim(),
    description: String(body.description ?? "").trim(),
    metric_type: String(body.metric_type ?? "reps").trim(),
    start_date: String(body.start_date ?? ""),
    end_date: String(body.end_date ?? ""),
    coin_prize_1st: Number(body.coin_prize_1st ?? 500),
    coin_prize_2nd: Number(body.coin_prize_2nd ?? 250),
    coin_prize_3rd: Number(body.coin_prize_3rd ?? 100),
    coin_completion_reward: Number(body.coin_completion_reward ?? 50),
    created_by: auth.user.id
  };
  if (!payload.title || !payload.description || !payload.start_date || !payload.end_date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error } = await admin.from("community_challenges").insert(payload);
  if (error) return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
