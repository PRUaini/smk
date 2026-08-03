import { fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import type { Activity, DashboardTargets } from "../types";
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
    // No activities provided, so the weekly totals come from the selected week's metrics (0).
    expect(within(chart).getAllByText("0%").length).toBeGreaterThan(0);
  });

  it("uses the selected week's activities for weekly pencapaian vs target instead of the auto-detected current week", () => {
    const weekActivities: Activity[] = [
      {
        id: "w1a",
        tanggal: "2026-01-05",
        waktu: "08:00",
        waktuSelesai: "09:00",
        kegiatan: ["Closing Prospek"],
        poin: 10,
        status: "Selesai",
        catatan: "",
        nasabah: "",
        kontakNasabah: "",
        produk: "",
        api: 1500000,
      },
      {
        id: "w1b",
        tanggal: "2026-01-06",
        waktu: "09:00",
        waktuSelesai: "10:00",
        kegiatan: ["Approach / Fact Finding"],
        poin: 4,
        status: "Selesai",
        catatan: "",
        nasabah: "",
        kontakNasabah: "",
        produk: "",
      },
      {
        id: "w2a",
        tanggal: "2026-01-12",
        waktu: "08:00",
        waktuSelesai: "09:00",
        kegiatan: ["Closing Prospek"],
        poin: 10,
        status: "Selesai",
        catatan: "",
        nasabah: "",
        kontakNasabah: "",
        produk: "",
        api: 1000000,
      },
    ];

    // totalWeekly* simulates the auto-detected "current" week (e.g. Minggu 3),
    // which must NOT drive the chart when the user selects a different week.
    render(
      <LaporanAktivitas
        targets={{ ...targets, totalWeeklyPoints: 50, totalWeeklyMeetings: 4 }}
        activities={weekActivities}
        selectedMonth={0}
        selectedYear={2026}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Mingguan" }));

    const chart = screen.getByRole("heading", { name: "Pencapaian vs Target" }).closest(".report-chart-card") as HTMLElement;
    const pointColumn = within(chart).getByText("Total Poin").closest(".bar-group-column") as HTMLElement;
    const meetingColumn = within(chart).getByText("Janji Pertemuan").closest(".bar-group-column") as HTMLElement;
    const apiColumn = within(chart).getByText("Target API").closest(".bar-group-column") as HTMLElement;

    // Minggu 1 is selected by default: 14 pts of 125 -> 11%, 1 meeting of 10 -> 10%, API 1.5M of 2.5M -> 60%.
    // The buggy behavior would show 40% (50 of 125) from the auto-detected week.
    expect(within(pointColumn).getByText("11%")).toBeInTheDocument();
    expect(within(pointColumn).queryByText("40%")).not.toBeInTheDocument();
    expect(within(meetingColumn).getByText("10%")).toBeInTheDocument();
    expect(within(apiColumn).getByText("60%")).toBeInTheDocument();

    // Switching to Minggu 2 shows that week's data: 10 pts of 125 -> 8%, API 1M of 2.5M -> 40%.
    fireEvent.click(screen.getByRole("button", { name: "Minggu 2" }));
    expect(within(pointColumn).getByText("8%")).toBeInTheDocument();
    expect(within(pointColumn).queryByText("11%")).not.toBeInTheDocument();
    expect(within(apiColumn).getByText("40%")).toBeInTheDocument();
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
