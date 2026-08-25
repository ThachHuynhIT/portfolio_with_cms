import { describe, expect, it, afterEach, beforeEach, vi } from "vitest";
import {
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
} from "@lib/auth/rate-limit";

// `attempts` in rate-limit.ts is a module-level Map shared across every test
// in this file, so each test uses its own key and cleans up after itself to
// avoid bleeding state into unrelated cases.
describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is not rate limited before any failed attempts", () => {
    const key = "fresh@example.com";
    expect(isRateLimited(key)).toBe(false);
    clearAttempts(key);
  });

  it("stays unblocked under the max attempt threshold", () => {
    const key = "under-threshold@example.com";
    for (let i = 0; i < 4; i++) recordFailedAttempt(key);
    expect(isRateLimited(key)).toBe(false);
    clearAttempts(key);
  });

  it("blocks once the max attempt threshold is reached", () => {
    const key = "over-threshold@example.com";
    for (let i = 0; i < 5; i++) recordFailedAttempt(key);
    expect(isRateLimited(key)).toBe(true);
    clearAttempts(key);
  });

  it("unblocks after the window expires", () => {
    const key = "expiring@example.com";
    for (let i = 0; i < 5; i++) recordFailedAttempt(key);
    expect(isRateLimited(key)).toBe(true);

    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    expect(isRateLimited(key)).toBe(false);
    clearAttempts(key);
  });

  it("clearAttempts resets the count", () => {
    const key = "cleared@example.com";
    for (let i = 0; i < 5; i++) recordFailedAttempt(key);
    expect(isRateLimited(key)).toBe(true);

    clearAttempts(key);
    expect(isRateLimited(key)).toBe(false);
  });
});
