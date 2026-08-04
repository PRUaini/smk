import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DashboardTargets } from "../types";
import FooterSummary from "./FooterSummary";

const targets: DashboardTargets = {
  targetPoints: 500,
  totalPoints: 250,
  targetMeetings: 40,
  totalMeetings: 20,
  activeDays: 12,
  totalDays: 31,
  targetWeeklyPoints: 125,
  totalWeeklyPoints: 50,
  targetWeeklyMeetings: 10,
  totalWeeklyMeetings: 4,
  targetApi: 120000000,
  targetApiBulanan: 10000000,
  targetApiMingguan: 2500000,
  periodeKerjaAwal: 1,
  periodeKerjaAkhir: 12,
  totalApi: 10000000,
  totalAccumulatedApi: 25000000,
  totalWeeklyApi: 5000000,
};

describe("FooterSummary", () => {
  it("uses the adaptive working-period day target in the Hari Aktif metric", () => {
    const { container } = render(<FooterSummary targets={targets} selectedYear={2026} />);

    expect(container.querySelector(".metrics-summary-item:nth-child(2)")).toHaveTextContent("12 / 365 hari");
  });

  it("adapts the day target to a partial working period", () => {
    const { container } = render(
      <FooterSummary targets={{ ...targets, periodeKerjaAkhir: 11 }} selectedYear={2026} />
    );

    expect(container.querySelector(".metrics-summary-item:nth-child(2)")).toHaveTextContent("12 / 334 hari");
  });
});
