import { timingSafeEqual } from 'node:crypto';

const WORKER_PATH = '/.netlify/functions/tjai-worker-background';

export function isTjaiWorkerConfigured(): boolean {
  const secret = process.env.TJAI_WORKER_SECRET?.trim();
  const origin = process.env.TJAI_WORKER_ORIGIN?.trim();
  if (process.env.TJAI_WORKER_ENABLED !== 'true' || !secret || secret.length < 32 || secret.length > 512 || !origin) return false;
  try {
    const configured = new URL(origin);
    return configured.protocol === 'https:' && !configured.username && !configured.password && configured.pathname === '/' && !configured.search && !configured.hash;
  } catch { return false; }
}

export function isWorkerRequestAuthorized(request: Request): boolean {
  const expected = process.env.TJAI_WORKER_SECRET?.trim();
  const received = request.headers.get('authorization')?.replace(/^Bearer /, '');
  if (!expected || expected.length < 32 || expected.length > 512 || !received || received.length > 512) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** A failed dispatch leaves the durable job queued for the recovery scheduler. */
export async function dispatchTjaiWorker(): Promise<boolean> {
  if (!isTjaiWorkerConfigured()) return false;
  const secret = process.env.TJAI_WORKER_SECRET?.trim();
  const endpoint = new URL(WORKER_PATH, process.env.TJAI_WORKER_ORIGIN!.trim());
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}` },
      redirect: 'error',
      signal: AbortSignal.timeout(3000),
    });
    return response.status === 202;
  } catch { return false; }
}
