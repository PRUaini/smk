import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn((name) => (name === "x-forwarded-for" ? "1.2.3.4" : null)),
  }),
}));

// Mock supabase server client
const mockSignInWithPassword = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    })
  ),
}));

// Mock redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { login } from "./login";
import { resetRateLimitMap } from "../utils/rate-limit";

describe("login action rate limiting", () => {
  beforeEach(() => {
    resetRateLimitMap();
    mockSignInWithPassword.mockReset();
  });

  it("blocks login after 5 attempts from same IP", async () => {
    const formData = new FormData();
    formData.append("kode_agent", "AG123");
    formData.append("password", "wrong-password");

    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid credentials" },
    });

    for (let i = 0; i < 5; i++) {
      const res = await login(undefined, formData);
      expect(res.error).toBe("Kode Agent atau Password salah.");
    }

    const res = await login(undefined, formData);
    expect(res.error).toBe("Terlalu banyak percobaan login. Silakan coba lagi nanti.");
  });

  it("handles Supabase native 429 rate limit error", async () => {
    const formData = new FormData();
    formData.append("kode_agent", "AG123");
    formData.append("password", "password");

    mockSignInWithPassword.mockResolvedValue({
      error: { status: 429, message: "Too many requests" },
    });

    const res = await login(undefined, formData);
    expect(res.error).toBe("Terlalu banyak percobaan login. Silakan coba lagi nanti.");
  });
});
