import { vi, describe, it, expect } from "vitest";

const mockQuery = vi.hoisted(() => {
  const queryObj = {
    select: () => queryObj,
    eq: () => queryObj,
    order: () => queryObj,
    then: (onfulfilled: (value: { data: null; error: { message: string } }) => void) => {
      if (onfulfilled) {
        onfulfilled({
          data: null,
          error: { message: "Detailed PG error: violates foreign key" },
        });
      }
    },
  };
  return queryObj;
});

const mockSupabase = vi.hoisted(() => ({
  from: () => mockQuery,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { getActivitiesByAgent } from "./activities.repository";

describe("activities.repository error handling", () => {
  it("hides raw database error message and logs it", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(getActivitiesByAgent("agent-123")).rejects.toThrow(
      "Failed to fetch activities. Please try again later."
    );
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
