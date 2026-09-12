import { randomUUID } from 'node:crypto';
import { getSupabaseServerClient } from '../../src/lib/supabase-server';
import { processNextTjaiJob } from '../../src/lib/tjai/jobs';
import { isFreeGroqConfigured } from '../../src/lib/tjai/free-provider';
import { isWorkerRequestAuthorized } from '../../src/lib/tjai/worker-dispatch';

/** Netlify returns 202 immediately. The SQL job is the authoritative result. */
export default async function worker(request: Request): Promise<void> {
  if (request.method !== 'POST' || !isWorkerRequestAuthorized(request)) return;
  if (process.env.TJAI_WORKER_ENABLED !== 'true' || !isFreeGroqConfigured()) return;
  const admin = getSupabaseServerClient();
  if (!admin) return;
  try {
    await processNextTjaiJob(admin, randomUUID());
  } catch {
    // Do not log intake, prompts, provider payloads or credentials. SQL leases recover.
    console.error('tjai_worker_recovery_pending');
  }
}
