import { getSupabaseServerClient } from "@/lib/supabase-server";
import { awardTJCoin } from "@/lib/tjcoin-server";

type ChallengeRow = {
  id: string;
  title: string;
  end_date: string;
  settled: boolean;
};

type ParticipantRow = {
  user_id: string;
  total_logged: number;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function settleEndedChallenges() {
  const admin = getSupabaseServerClient();
  if (!admin) {
    return { ok: false as const, error: "Server not configured" };
  }

  const { data: challenges, error } = await admin
    .from("community_challenges")
    .select("id,title,end_date,settled")
    .lt("end_date", todayIsoDate())
    .eq("settled", false);

  if (error) {
    return { ok: false as const, error: error.message };
  }

  let settled = 0;
  let totalRewarded = 0;

  for (const challenge of (challenges ?? []) as ChallengeRow[]) {
    const { data: participants } = await admin
      .from("challenge_participants")
      .select("user_id,total_logged")
      .eq("challenge_id", challenge.id)
      .order("total_logged", { ascending: false });

    const ranked = ((participants ?? []) as ParticipantRow[]).filter((p) => Number(p.total_logged ?? 0) > 0);

    const top = ranked.slice(0, 3);
    const rankRewards = [500, 250, 100];
    const rankReasons = ["challenge_first_place", "challenge_second_place", "challenge_third_place"];

    for (let i = 0; i < top.length; i += 1) {
      const userId = top[i]?.user_id;
      if (!userId) continue;
      const amount = rankRewards[i];
      const reason = rankReasons[i];
      await awardTJCoin(userId, reason, amount, {
        metadata: { challengeId: challenge.id, challengeTitle: challenge.title, rank: i + 1 }
      });
      totalRewarded += amount;
    }

    for (const participant of ranked) {
      await awardTJCoin(participant.user_id, "challenge_completed", 50, {
        metadata: { challengeId: challenge.id, challengeTitle: challenge.title }
      });
      totalRewarded += 50;
    }

    const championId = top[0]?.user_id;
    if (championId) {
      await admin.from("user_badges").upsert(
        { user_id: championId, badge_key: "challenge_champion", earned_at: new Date().toISOString() },
        { onConflict: "user_id,badge_key" }
      );
    }

    await admin.from("community_challenges").update({ settled: true }).eq("id", challenge.id);
    settled += 1;
  }

  return { ok: true as const, settled, totalRewarded };
}
