interface RateLimitInfo {
  tokens: number;
  lastRefill: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

const LIMIT = 5; // Max 5 login attempts
const WINDOW_MS = 60 * 1000; // per 1 minute
const REFILL_RATE = LIMIT / WINDOW_MS;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let info = rateLimitMap.get(ip);

  if (!info) {
    info = { tokens: LIMIT, lastRefill: now };
  } else {
    const elapsed = now - info.lastRefill;
    info.tokens = Math.min(LIMIT, info.tokens + elapsed * REFILL_RATE);
    info.lastRefill = now;
  }

  if (info.tokens >= 1) {
    info.tokens -= 1;
    rateLimitMap.set(ip, info);
    return false;
  }

  rateLimitMap.set(ip, info);
  return true;
}

// Clean utility helper for tests to reset state
export function resetRateLimitMap(): void {
  rateLimitMap.clear();
}
