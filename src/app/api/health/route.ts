import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/**
 * Public health + keep-alive endpoint.
 *
 * Runs one trivial head-count query so Postgres registers activity — point a
 * free uptime monitor (UptimeRobot / cron-job.org, ~10-min interval) at
 * `https://tjfit.org/api/health` and the Supabase free tier never idles into
 * its 7-day auto-pause. Returns no data, only liveness.
 */
export async function GET() {
  const startedAt = Date.now();
  const admin = getSupabaseServerClient();

  let db: "up" | "down" | "unconfigured" = "unconfigured";
  if (admin) {
    try {
      const { error } = await admin
        .from("bundle_gumroad_products")
        .select("slug", { count: "exact", head: true });
      db = error ? "down" : "up";
    } catch {
      db = "down";
    }
  }

  const ok = db === "up";
  return NextResponse.json(
    { ok, db, ms: Date.now() - startedAt, ts: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
