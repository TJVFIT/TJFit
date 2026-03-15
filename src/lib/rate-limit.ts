const requestStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit({
  key,
  limit,
  windowMs
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const current = requestStore.get(key);

  if (!current || current.resetAt < now) {
    requestStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { success: false, remaining: 0 };
  }

  current.count += 1;
  requestStore.set(key, current);

  return { success: true, remaining: limit - current.count };
}
