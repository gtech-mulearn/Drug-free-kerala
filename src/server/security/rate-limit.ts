import "server-only";

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

/**
 * Per-IP budgets. Deliberately generous: pledges are often taken together in
 * classrooms and events where hundreds of people share one school/venue IP.
 */
export const RATE_LIMIT_POLICIES = {
  pledge: { limit: 60, windowSeconds: 600 },
  lookup: { limit: 20, windowSeconds: 600 },
} as const;

export type RateLimitPolicy = keyof typeof RATE_LIMIT_POLICIES;

/**
 * Fixed-window limiter in process memory. Counts are per server instance,
 * which needs no infrastructure and is enough to stop a single client
 * hammering the form.
 */
export function createMemoryRateLimiter({
  limit,
  windowSeconds,
  now = Date.now,
}: {
  limit: number;
  windowSeconds: number;
  now?: () => number;
}): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();

  return {
    async check(key) {
      const time = now();
      const current = windows.get(key);

      if (!current || current.resetAt <= time) {
        if (windows.size > 10_000) {
          for (const [k, w] of windows) if (w.resetAt <= time) windows.delete(k);
        }
        windows.set(key, { count: 1, resetAt: time + windowSeconds * 1000 });
        return { allowed: true, retryAfterSeconds: 0 };
      }

      if (current.count >= limit) {
        return { allowed: false, retryAfterSeconds: Math.ceil((current.resetAt - time) / 1000) };
      }
      current.count += 1;
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

const limiters = new Map<RateLimitPolicy, RateLimiter>();

export function getRateLimiter(policy: RateLimitPolicy): RateLimiter {
  let limiter = limiters.get(policy);
  if (!limiter) {
    limiter = createMemoryRateLimiter(RATE_LIMIT_POLICIES[policy]);
    limiters.set(policy, limiter);
  }
  return limiter;
}
