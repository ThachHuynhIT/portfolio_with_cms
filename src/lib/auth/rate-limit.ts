// In-memory brute-force guard for the admin login form. Keyed by normalized
// email, not IP, since the whole app has exactly one admin account.
//
// Known limitation: state lives in process memory. On a single long-running
// process (local dev, self-host) this works as intended; on Vercel serverless
// each lambda instance has its own memory, so attempts spread across cold
// starts / instances are not counted together. Acceptable for Phase 4 (single
// admin, low traffic) — revisit with a shared store (e.g. Upstash Redis) if
// this ever needs to hold under real distributed traffic.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type AttemptRecord = { count: number; resetAt: number };

const attempts = new Map<string, AttemptRecord>();

// The login form is public, so `key` is attacker-controlled — sweep expired
// entries on write instead of letting the map grow unbounded with junk emails.
function sweepExpired(): void {
  const now = Date.now();
  for (const [key, record] of attempts) {
    if (now > record.resetAt) attempts.delete(key);
  }
}

export function isRateLimited(key: string): boolean {
  const record = attempts.get(key);
  if (!record || Date.now() > record.resetAt) return false;
  return record.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
  sweepExpired();
  const record = attempts.get(key);
  if (!record || Date.now() > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  record.count += 1;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
