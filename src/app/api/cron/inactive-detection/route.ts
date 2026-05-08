import { NextRequest, NextResponse } from "next/server";

import { enrollUserInSequence } from "@/lib/email/sequences";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

function getBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || getBearerToken(request) !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseServerClient();
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id,last_seen_at,last_activity_date")
    .or(`last_seen_at.lt.${cutoff},and(last_seen_at.is.null,last_activity_date.lt.${cutoff.slice(0, 10)})`)
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let enrolled = 0;
  let failed = 0;
  for (const profile of profiles ?? []) {
    const result = await enrollUserInSequence(String(profile.id), "inactive_7_days", admin);
    if (result.ok) {
      if (result.enrollmentId) enrolled += 1;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({ checked: profiles?.length ?? 0, enrolled, failed });
}

export async function POST(request: NextRequest) {
  return GET(request);
}

