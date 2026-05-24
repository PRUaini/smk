import { describe, expect, it } from "vitest";
import { buildLineChartSvg, getMonthsAbbr } from "./report";

describe("report utilities", () => {
  it("returns stable month abbreviations", () => {
    expect(getMonthsAbbr()[0]).toBe("Jan");
    expect(getMonthsAbbr()[11]).toBe("Des");
  });

  it("builds line chart svg data from points", () => {
    const chart = buildLineChartSvg(
      [
        { label: "A", points: 0 },
        { label: "B", points: 50 },
      ],
      { width: 100, height: 100, padding: { top: 10, right: 10, bottom: 10, left: 10 } },
      100,
      1
    );

    expect(chart.width).toBe(100);
    expect(chart.points).toHaveLength(2);
    expect(chart.linePath).toContain("M");
    expect(chart.xLabels).toEqual([
      { x: 10, label: "A" },
      { x: 90, label: "B" },
    ]);
  });
});
