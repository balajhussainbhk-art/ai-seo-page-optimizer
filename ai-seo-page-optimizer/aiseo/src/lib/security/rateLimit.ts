/**
 * Simple in-memory rate limiter.
 *
 * NOTE: This works per serverless-function instance. On Vercel, instances
 * are ephemeral and can scale horizontally, so this is a best-effort
 * demo-grade limiter, not a hard guarantee. For production, replace the
 * store below with a shared store such as Upstash Redis (see README).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Also track a coarser daily bucket per IP for the free-plan limit.
const dailyBuckets = new Map<string, Bucket>();

function nextMidnightUtc(): number {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return next.getTime();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/** Short-window burst limiter (e.g. 5 requests / 10s) to blunt scripted abuse. */
export function checkBurstLimit(key: string, limit = 5, windowMs = 10_000): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** Daily free-plan analysis limit per IP. */
export function checkDailyLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const bucket = dailyBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    const resetAt = nextMidnightUtc();
    dailyBuckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

export function clientKeyFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}
