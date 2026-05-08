import { NextRequest, NextResponse } from "next/server";

import { settleEndedChallenges } from "@/lib/community-challenge-settle";
import { isAuthorizedCron } from "@/lib/timing-safe-secret";

export async function POST(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await settleEndedChallenges();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    settled: result.settled,
    total_rewarded: result.totalRewarded
  });
}
