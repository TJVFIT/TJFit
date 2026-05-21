import { NextRequest, NextResponse } from "next/server";

import { settleEndedChallenges } from "@/lib/community-challenge-settle";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("x-cron-secret")?.trim();
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return header === secret || bearer === secret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await settleEndedChallenges();
  if (!result.ok) {
    console.error("[cron] settleEndedChallenges failed", result.error);
    // Don't leak internal error text to the public endpoint even though it's
    // CRON_SECRET-gated — the log catches it for ops, the response stays opaque.
    return NextResponse.json({ error: "Cron task failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    settled: result.settled,
    total_rewarded: result.totalRewarded
  });
}
