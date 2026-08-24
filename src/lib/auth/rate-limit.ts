import { createRateLimiter } from "@lib/rate-limit";

// In-memory brute-force guard for the admin login form. Keyed by normalized
// email, not IP, since the whole app has exactly one admin account. See
// createRateLimiter's docstring for the shared-primitive's known limitations.
const limiter = createRateLimiter({ max: 5, windowMs: 15 * 60 * 1000 });

export function isRateLimited(key: string): boolean {
  return limiter.isRateLimited(key);
}

export function recordFailedAttempt(key: string): void {
  limiter.recordAttempt(key);
}

export function clearAttempts(key: string): void {
  limiter.clearAttempts(key);
}
