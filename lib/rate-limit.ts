import { redis } from "@/lib/redis";
import { checkPgRateLimit } from "@/lib/pg-rate-limit";

const USE_PG = process.env.PG_RATE_LIMIT === "true";

type RateLimitOptions = {
  key: string;
  windowMs: number;
  limit: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export async function rateLimit({
  key,
  windowMs,
  limit,
}: RateLimitOptions): Promise<RateLimitResult> {
  if (USE_PG) {
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    return checkPgRateLimit(key, limit, windowSeconds);
  }

  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const resetAt = (bucket + 1) * windowMs;
  const bucketKey = `rl:${key}:${bucket}`;

  const count = await redis.incr(bucketKey);
  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000) + 5);
  await redis.set(bucketKey, count, { ex: ttlSeconds });

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt,
  };
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip") || "unknown";
}
