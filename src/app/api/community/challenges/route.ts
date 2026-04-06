import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/require-auth";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const admin = getSupabaseServerClient();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const today = new Date().toISOString().slice(0, 10);
  const { data: challenges } = await admin
    .from("community_challenges")
    .select("id,title,description,metric_type,start_date,end_date,coin_prize_1st,coin_prize_2nd,coin_prize_3rd,coin_completion_reward")
    .lte("start_date", today)
    .order("end_date", { ascending: true });

  const items = await Promise.all(
    (challenges ?? []).map(async (challenge) => {
      const [{ count: participants }, { data: joined }, { data: todayLog }, { data: logs }] = await Promise.all([
        admin.from("challenge_participants").select("*", { head: true, count: "exact" }).eq("challenge_id", challenge.id),
        admin
          .from("challenge_participants")
          .select("user_id")
          .eq("challenge_id", challenge.id)
          .eq("user_id", auth.user.id)
          .maybeSingle(),
        admin
          .from("challenge_logs")
          .select("value,logged_at")
          .eq("challenge_id", challenge.id)
          .eq("user_id", auth.user.id)
          .gte("logged_at", `${today}T00:00:00.000Z`)
          .order("logged_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        admin.from("challenge_logs").select("user_id,value").eq("challenge_id", challenge.id)
      ]);

      const scoreMap = new Map<string, number>();
      for (const row of logs ?? []) {
        const prev = scoreMap.get(row.user_id) ?? 0;
        scoreMap.set(row.user_id, prev + Number(row.value ?? 0));
      }
      const topUsers = [...scoreMap.entries()]
        .map(([userId, total]) => ({ userId, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      const myRank = [...scoreMap.entries()]
        .map(([userId, total]) => ({ userId, total }))
        .sort((a, b) => b.total - a.total)
        .findIndex((entry) => entry.userId === auth.user.id);
      return {
        ...challenge,
        participants: participants ?? 0,
        joined: Boolean(joined),
        todayLogged: Boolean(todayLog),
        todayValue: todayLog?.value ?? null,
        leaderboard: topUsers,
        myRank: myRank >= 0 ? myRank + 1 : null
      };
    })
  );

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

