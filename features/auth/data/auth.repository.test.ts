import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCurrentUser,
  getRequiredCurrentUser,
  signUpAgent,
} from "./auth.repository";

const getUser = vi.fn();
const signUp = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { signUp },
  })),
}));

describe("auth repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "key";
  });

  it("returns current Supabase user", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "agent001@smk.internal" } },
      error: null,
    });

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      email: "agent001@smk.internal",
    });
  });

  it("throws when required user is missing", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(getRequiredCurrentUser()).rejects.toThrow("Unauthorized access");
  });

  it("signs up an agent through Supabase auth", async () => {
    signUp.mockResolvedValue({ data: { user: { id: "new-user" } }, error: null });

    await expect(signUpAgent("agent001", "password123")).resolves.toEqual({
      user: { id: "new-user" },
    });
  });
});
