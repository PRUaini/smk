import { fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import type { DashboardTargets } from "../types";
import LaporanAktivitas from "./LaporanAktivitas";

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

describe("LaporanAktivitas", () => {
  it("renders report period tabs in yearly, monthly, weekly order with yearly selected by default", () => {
    render(
      <LaporanAktivitas
        targets={targets}
        activities={[]}
        selectedMonth={0}
        selectedYear={2026}
      />
    );

    const tabs = screen.getAllByRole("button", { name: /Tahunan|Bulanan|Mingguan/ });

    expect(tabs.map((tab) => tab.textContent)).toEqual(["Tahunan", "Bulanan", "Mingguan"]);
    expect(screen.getByRole("button", { name: "Tahunan" })).toHaveClass("active");
    expect(screen.getByText("Ringkasan Progres Tahunan")).toBeInTheDocument();
  });

  it("does not render a separate dropdown for pencapaian vs target", () => {
    render(
      <LaporanAktivitas
        targets={targets}
        activities={[]}
        selectedMonth={0}
        selectedYear={2026}
      />
    );

    const chart = screen.getByRole("heading", { name: "Pencapaian vs Target" }).closest(".report-chart-card");
    expect(chart).toBeInTheDocument();

    expect((chart as HTMLElement).querySelector(".chart-filter-select")).not.toBeInTheDocument();
  });

  it("keeps pencapaian vs target driven by the report period tabs", () => {
    render(
      <LaporanAktivitas
        targets={targets}
        activities={[]}
        selectedMonth={0}
        selectedYear={2026}
      />
    );

    const chart = screen.getByRole("heading", { name: "Pencapaian vs Target" }).closest(".report-chart-card") as HTMLElement;

    expect(screen.getByRole("button", { name: "Tahunan" })).toHaveClass("active");
    expect(screen.getByText("Ringkasan Progres Tahunan")).toBeInTheDocument();
    expect(within(chart).getAllByText("50%").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Bulanan" }));
    expect(screen.getByRole("button", { name: "Bulanan" })).toHaveClass("active");
    expect(screen.getByText("Ringkasan Progres Bulanan")).toBeInTheDocument();
    expect(within(chart).getAllByText("50%").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Mingguan" }));
    expect(screen.getByRole("button", { name: "Mingguan" })).toHaveClass("active");
    expect(screen.getByText("Ringkasan Progres Mingguan")).toBeInTheDocument();
    expect(within(chart).getAllByText("40%").length).toBeGreaterThan(0);
  });

  it("defines progress bar fill colors for every report KPI accent", () => {
    const css = readFileSync("app/globals.css", "utf8");

    expect(css).toContain(".kpi-progress-bar.bg-red");
    expect(css).toContain("background-color: var(--color-primary)");
    expect(css).toContain(".kpi-progress-bar.bg-purple");
    expect(css).toContain("background-color: var(--color-dashboard-purple)");
    expect(css).toContain(".kpi-progress-bar.bg-green");
    expect(css).toContain("background-color: var(--color-dashboard-green)");
    expect(css).toContain(".kpi-progress-bar.bg-orange");
    expect(css).toContain("background-color: var(--color-dashboard-orange)");
  });
});
