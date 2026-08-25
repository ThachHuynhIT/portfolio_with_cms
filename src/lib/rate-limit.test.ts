import { describe, expect, it, afterEach, beforeEach, vi } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is not rate limited before any attempts", () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 });
    expect(limiter.isRateLimited("key")).toBe(false);
  });

  it("stays unblocked under the max threshold", () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 });
    limiter.recordAttempt("key");
    limiter.recordAttempt("key");
    expect(limiter.isRateLimited("key")).toBe(false);
  });

  it("blocks once the max threshold is reached", () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 });
    limiter.recordAttempt("key");
    limiter.recordAttempt("key");
    limiter.recordAttempt("key");
    expect(limiter.isRateLimited("key")).toBe(true);
  });

  it("unblocks after the window expires", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });
    limiter.recordAttempt("key");
    expect(limiter.isRateLimited("key")).toBe(true);

    vi.advanceTimersByTime(60_001);
    expect(limiter.isRateLimited("key")).toBe(false);
  });

  it("clearAttempts resets the count", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60_000 });
    limiter.recordAttempt("key");
    expect(limiter.isRateLimited("key")).toBe(true);

    limiter.clearAttempts("key");
    expect(limiter.isRateLimited("key")).toBe(false);
  });

  it("keeps separate instances' counters independent", () => {
    const a = createRateLimiter({ max: 1, windowMs: 60_000 });
    const b = createRateLimiter({ max: 1, windowMs: 60_000 });
    a.recordAttempt("key");
    expect(a.isRateLimited("key")).toBe(true);
    expect(b.isRateLimited("key")).toBe(false);
  });
});
