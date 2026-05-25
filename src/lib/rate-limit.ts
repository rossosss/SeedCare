type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function getRateLimitKey(request: Request, scope: string, identifier?: string | null) {
  return `${scope}:${identifier || getClientIp(request)}`;
}

// MVP in-memory limiter. In production with multiple instances, replace this with Redis or another shared store.
export function rateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { ok: false as const, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true as const, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}
