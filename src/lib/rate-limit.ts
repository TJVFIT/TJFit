type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

const MAX_BUCKETS = 10_000;
const globalStore = globalThis as typeof globalThis & {
  __tjfitRateLimitStore__?: Map<string, RateLimitEntry>;
};
const buckets = globalStore.__tjfitRateLimitStore__ ?? new Map<string, RateLimitEntry>();
globalStore.__tjfitRateLimitStore__ = buckets;

function pruneExpired(now: number) {
  buckets.forEach((entry, key) => {
    if (entry.resetAt <= now) buckets.delete(key);
  });

  while (buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value as string | undefined;
    if (!oldestKey) break;
    buckets.delete(oldestKey);
  }
}

/**
 * A bounded, best-effort limiter for a single application instance.
 * Production deployments with multiple instances should replace this with a
 * shared Redis/database limiter without changing the route-level interface.
 */
export function rateLimit({ key, limit, windowMs }: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeWindow = Math.max(1_000, Math.floor(windowMs));
  const normalizedKey = key.trim().slice(0, 256) || "unknown";

  let entry = buckets.get(normalizedKey);
  if (!entry || entry.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) pruneExpired(now);
    entry = { count: 0, resetAt: now + safeWindow };
  }

  entry.count += 1;
  // Refresh insertion order so pruning removes the least-recently-used key.
  buckets.delete(normalizedKey);
  buckets.set(normalizedKey, entry);

  return {
    success: entry.count <= safeLimit,
    limit: safeLimit,
    remaining: Math.max(0, safeLimit - entry.count),
    resetAt: entry.resetAt
  };
}
