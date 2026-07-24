import { NextResponse } from "next/server";

// Must execute on every hit (never statically optimized) so the serverless
// function actually boots — that is the whole point of a warmup ping.
export const dynamic = "force-dynamic";

/**
 * Cold-start warmup ping.
 *
 * Landing and checkout are server-rendered on the Node serverless runtime; when
 * the function scales to zero, the next real visitor eats a ~22-30s cold start
 * (Next.js server boot + first-request bundle load). A Vercel cron hits this
 * route every 5 minutes (see `vercel.json`) so the runtime stays warm and those
 * pages respond fast.
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
