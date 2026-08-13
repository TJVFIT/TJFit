import { NextResponse } from "next/server";

// Must execute on every hit (never statically optimized) so the serverless
// function actually boots — that is the whole point of a warmup ping.
export const dynamic = "force-dynamic";

/**
 * Cold-start warmup ping.
 *
 * Landing and checkout are server-rendered on the Node serverless runtime; when
 * the function scales to zero, the next real visitor eats a ~22-30s cold start
 * (Next.js server boot + first-request bundle load).
 *
 * The Vercel cron in `vercel.json` hits this route only once daily (03:00) —
 * the account is on the Hobby plan, which rejects sub-daily crons (a 5-minute
 * schedule made every deploy fail pre-build, 2026-08-13). One daily ping does
 * NOT keep the lambda warm; real warm-keeping needs an external uptime monitor
 * pinging this route every few minutes, or a Vercel Pro upgrade to restore the
 * 5-minute cron. Both are owner decisions — until one lands, treat cold starts
 * on first hits as expected.
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
