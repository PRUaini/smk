import { vi, describe, it, expect } from "vitest";

const mockQuery = vi.hoisted(() => {
  const queryObj = {
    select: () => queryObj,
    eq: () => queryObj,
    maybeSingle: () =>
      Promise.resolve({
        data: null,
        error: { message: "Detailed PG error: permission denied" },
      }),
  };
  return queryObj;
});

const mockSupabase = vi.hoisted(() => ({
  from: () => mockQuery,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { getAgentTargets } from "./targets.repository";

describe("targets.repository error handling", () => {
  it("hides raw database error message and logs it", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(getAgentTargets("agent-123")).rejects.toThrow(
      "Failed to fetch agent targets. Please try again later."
    );
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
