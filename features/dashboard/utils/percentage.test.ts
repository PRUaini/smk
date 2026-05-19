import { describe, expect, it } from "vitest";
import { calculatePercentage } from "./percentage";

describe("calculatePercentage", () => {
  it("rounds normal percentages", () => {
    expect(calculatePercentage(1, 3)).toBe(33);
  });

  it("clamps values above the target", () => {
    expect(calculatePercentage(150, 100)).toBe(100);
  });

  it("returns zero for empty or invalid targets", () => {
    expect(calculatePercentage(10, 0)).toBe(0);
    expect(calculatePercentage(10, Number.NaN)).toBe(0);
  });
});
