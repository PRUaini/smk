import { describe, expect, it } from "vitest";
import { getWeeksInMonth, getWeekDates } from "./date";

describe("date utils", () => {
  describe("getWeeksInMonth", () => {
    it("returns correct weeks for March 2026", () => {
      const weeks = getWeeksInMonth(2); // March is index 2
      // March 2026 Mondays: March 2, 9, 16, 23, 30
      expect(weeks).toHaveLength(5);
      expect(weeks[0]?.getDate()).toBe(2);
      expect(weeks[0]?.getMonth()).toBe(2);
      expect(weeks[4]?.getDate()).toBe(30);
      expect(weeks[4]?.getMonth()).toBe(2);
    });

    it("returns correct weeks for February 2026", () => {
      const weeks = getWeeksInMonth(1); // February is index 1
      // February 2026 Mondays: Feb 2, 9, 16, 23
      expect(weeks).toHaveLength(4);
      expect(weeks[0]?.getDate()).toBe(2);
      expect(weeks[3]?.getDate()).toBe(23);
    });

    it("returns weeks for the selected year", () => {
      const weeks = getWeeksInMonth(0, 2027);

      expect(weeks[0]?.getFullYear()).toBe(2027);
      expect(weeks[0]?.getMonth()).toBe(0);
      expect(weeks[0]?.getDate()).toBe(4);
    });
  });

  describe("getWeekDates", () => {
    it("returns 6 days starting from the given Monday", () => {
      const monday = new Date(2026, 2, 2); // March 2, 2026
      const dates = getWeekDates(monday);
      expect(dates).toEqual([
        "2026-03-02",
        "2026-03-03",
        "2026-03-04",
        "2026-03-05",
        "2026-03-06",
        "2026-03-07",
      ]);
    });
  });
});
