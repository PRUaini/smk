import { describe, it, expect, beforeEach, vi } from "vitest";
import { isRateLimited, resetRateLimitMap } from "./rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    resetRateLimitMap();
    vi.useFakeTimers();
  });

  it("allows requests below the limit", () => {
    const ip = "192.168.1.1";
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(ip)).toBe(false);
    }
  });

  it("blocks requests exceeding the limit", () => {
    const ip = "192.168.1.1";
    for (let i = 0; i < 5; i++) {
      isRateLimited(ip);
    }
    expect(isRateLimited(ip)).toBe(true);
  });

  it("refills tokens over time", () => {
    const ip = "192.168.1.1";
    for (let i = 0; i < 5; i++) {
      isRateLimited(ip);
    }
    expect(isRateLimited(ip)).toBe(true);

    // Advance time by 30 seconds (refills 2.5 tokens)
    vi.advanceTimersByTime(30000);
    expect(isRateLimited(ip)).toBe(false);
    expect(isRateLimited(ip)).toBe(false);
    expect(isRateLimited(ip)).toBe(true); // Spent all refilled tokens
  });
});
