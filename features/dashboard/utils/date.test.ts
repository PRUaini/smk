import { describe, expect, it } from "vitest";
import { getDaysInPeriod, getWeeksInMonth, getWeekDates } from "./date";

describe("date utils", () => {
  describe("getWeeksInMonth", () => {
    it("returns correct weeks for March 2026", () => {
      const weeks = getWeeksInMonth(2); // March is index 2
      // The first displayed week starts on Monday, February 23, and contains March 1.
      expect(weeks).toHaveLength(6);
      expect(weeks[0]?.getDate()).toBe(23);
      expect(weeks[0]?.getMonth()).toBe(1);
      expect(weeks[5]?.getDate()).toBe(30);
      expect(weeks[5]?.getMonth()).toBe(2);
    });

    it("returns correct weeks for February 2026", () => {
      const weeks = getWeeksInMonth(1); // February is index 1
      // The first displayed week starts on Monday, January 26, and contains February 1.
      expect(weeks).toHaveLength(5);
      expect(weeks[0]?.getDate()).toBe(26);
      expect(weeks[0]?.getMonth()).toBe(0);
      expect(weeks[4]?.getDate()).toBe(23);
    });

    it("includes the partial week containing the first days of January 2026", () => {
      const weeks = getWeeksInMonth(0, 2026);

      expect(weeks[0]?.getFullYear()).toBe(2025);
      expect(weeks[0]?.getMonth()).toBe(11);
      expect(weeks[0]?.getDate()).toBe(29);
      expect(getWeekDates(weeks[0]!)).toContain("2026-01-01");
      expect(getWeekDates(weeks[0]!)).toContain("2026-01-04");
    });

    it("returns weeks for the selected year", () => {
      const weeks = getWeeksInMonth(0, 2027);

      expect(weeks[0]?.getFullYear()).toBe(2026);
      expect(weeks[0]?.getMonth()).toBe(11);
      expect(weeks[0]?.getDate()).toBe(28);
    });
  });

  describe("getWeekDates", () => {
    it("returns 7 days starting from the given Monday through Sunday", () => {
      const monday = new Date(2026, 2, 2); // March 2, 2026
      const dates = getWeekDates(monday);
      expect(dates).toEqual([
        "2026-03-02",
        "2026-03-03",
        "2026-03-04",
        "2026-03-05",
        "2026-03-06",
        "2026-03-07",
        "2026-03-08",
      ]);
    });
  });

  describe("getDaysInPeriod", () => {
    it("sums the calendar days across the working period", () => {
      expect(getDaysInPeriod(2026, 1, 12)).toBe(365);
      expect(getDaysInPeriod(2026, 1, 11)).toBe(334);
    });

    it("accounts for leap years", () => {
      expect(getDaysInPeriod(2028, 1, 12)).toBe(366);
    });
  });
});
