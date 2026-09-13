import { NextResponse } from "next/server";

// Must execute on every hit (never statically optimized) so the serverless
// function actually boots — that is the whole point of a warmup ping.
export const dynamic = "force-dynamic";

/**
 * Cold-start warmup ping.
 *
 * Optional manual runtime probe. It is not scheduled in vercel.json: frequent
 * warming requires hosting-plan support and does not guarantee that a later
 * visitor reaches the same function instance.
 *
 * Deliberately does no I/O — no DB, no auth, no external calls — so it always
 * returns 200 in a couple of milliseconds and never fills the cron log with
 * errors. Unlike `/api/health` (which probes Postgres for liveness) this only
 * keeps the lambda hot.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, warm: true, ts: new Date().toISOString() },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
