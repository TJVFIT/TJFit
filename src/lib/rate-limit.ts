/**
 * Rate limiter — Upstash Redis when configured, in-memory fallback otherwise.
 *
 * The in-memory `Map` does NOT survive across Vercel Lambda instances, so it
 * is effectively a no-op in production. Set UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN on the Vercel project to enable Redis-backed
 * limiting that actually works under serverless.
 *
 * Algorithm: fixed-window counter via Redis INCR + PEXPIRE. Keys are
 * windowed (`rl:<key>:<window-bucket>`) so each bucket auto-expires.
 *
 * Failure mode: if Redis is configured but the request fails (network,
 * 5xx), we fail-OPEN (allow the request) so a Redis outage does not
 * take down the API. Trade-off: brief unmetered traffic during outages
 * vs. user-visible 429 storms.
 */

interface RateLimitArgs {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit({ key, limit, windowMs }: RateLimitArgs): RateLimitResult {
  const now = Date.now();
  const current = inMemoryStore.get(key);

  if (!current || current.resetAt < now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { success: false, remaining: 0 };
  }

  current.count += 1;
  inMemoryStore.set(key, current);
  return { success: true, remaining: limit - current.count };
}

async function redisRateLimit({ key, limit, windowMs }: RateLimitArgs): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // Should not reach here — caller checks env. Defensive.
    return inMemoryRateLimit({ key, limit, windowMs });
  }

  // Window bucket: floor(now / windowMs). Each bucket lives for windowMs.
  const bucket = Math.floor(Date.now() / windowMs);
  const redisKey = `rl:${key}:${bucket}`;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["PEXPIRE", redisKey, String(windowMs)]
      ]),
      cache: "no-store"
    });

    if (!res.ok) {
      console.warn("[rate-limit] Upstash pipeline non-2xx — failing open", res.status);
      return { success: true, remaining: limit - 1 };
    }

    const data = (await res.json()) as Array<{ result?: number; error?: string }>;
    const count = Number(data[0]?.result ?? 0);

    if (count > limit) {
      return { success: false, remaining: 0 };
    }
    return { success: true, remaining: Math.max(0, limit - count) };
  } catch (err) {
    console.warn("[rate-limit] Upstash fetch failed — failing open", err);
    return { success: true, remaining: limit - 1 };
  }
}

export async function rateLimit(args: RateLimitArgs): Promise<RateLimitResult> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return redisRateLimit(args);
  }
  return inMemoryRateLimit(args);
}
