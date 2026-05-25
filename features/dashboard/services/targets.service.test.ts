import { describe, expect, it } from "vitest";
import { calculateDashboardTargets } from "./targets.service";
import type { Activity } from "../types";

const activities: Activity[] = [
  {
    id: "a1",
    tanggal: "2026-01-05",
    waktu: "08:00",
    kegiatan: "Pendekatan",
    poin: 1,
    status: "Selesai",
    catatan: "",
    nasabah: "",
    produk: "",
  },
  {
    id: "a2",
    tanggal: "2026-01-06",
    waktu: "09:00",
    kegiatan: "Pertemuan",
    poin: 2,
    status: "Selesai",
    catatan: "",
    nasabah: "",
    produk: "",
  },
  {
    id: "a3",
    tanggal: "2026-01-07",
    waktu: "10:00",
    kegiatan: "Penjualan / Closing",
    poin: 1,
    status: "Belum",
    catatan: "",
    nasabah: "",
    produk: "",
    api: 15000000,
  },
  {
    id: "a4",
    tanggal: "2026-02-05",
    waktu: "08:00",
    kegiatan: "Wawancara Penutupan",
    poin: 4,
    status: "Selesai",
    catatan: "",
    nasabah: "",
    produk: "",
  },
  {
    id: "a6",
    tanggal: "2026-02-06",
    waktu: "09:00",
    kegiatan: "Penjualan / Closing",
    poin: 1,
    status: "Selesai",
    catatan: "",
    nasabah: "",
    produk: "",
    api: 9000000,
  },
  {
    id: "a5",
    tanggal: "2026-01-08",
    waktu: "11:00",
    kegiatan: "Penjualan / Closing",
    poin: 1,
    status: "Selesai",
    catatan: "",
    nasabah: "",
    produk: "",
    api: 10000000,
  },
  {
    id: "a7",
    tanggal: "2026-05-08",
    waktu: "11:00",
    kegiatan: "Penjualan / Closing",
    poin: 1,
    status: "Selesai",
    catatan: "",
    nasabah: "",
    produk: "",
    api: 70000000,
  }
];

describe("calculateDashboardTargets", () => {
  it("counts completed monthly activity totals only", () => {
    const targets = calculateDashboardTargets(activities, 0);

    expect(targets.totalPoints).toBe(4);
    expect(targets.totalMeetings).toBe(1);
    expect(targets.totalSales).toBe(1);
    expect(targets.activeDays).toBe(3);
    expect(targets.totalDays).toBe(31);
    expect(targets.totalApi).toBe(25000000);
  });

  it("calculates weekly totals from completed activities in the first displayed week", () => {
    const targets = calculateDashboardTargets(activities, 0);

    expect(targets.totalWeeklyPoints).toBe(4);
    expect(targets.totalWeeklyMeetings).toBe(1);
    expect(targets.totalWeeklySales).toBe(1);
  });

  it("returns zero totals when no activity exists for the month", () => {
    const targets = calculateDashboardTargets(activities, 2);

    expect(targets.totalPoints).toBe(0);
    expect(targets.totalMeetings).toBe(0);
    expect(targets.totalSales).toBe(0);
    expect(targets.activeDays).toBe(0);
  });

  it("counts total api from the selected month only", () => {
    const targets = calculateDashboardTargets(activities, 1);

    expect(targets.totalApi).toBe(9000000);
    expect(targets.totalAccumulatedApi).toBe(34000000);
  });

  it("separates monthly api from accumulated api through the selected month", () => {
    const targets = calculateDashboardTargets(
      [
        {
          id: "feb-api",
          tanggal: "2026-02-06",
          waktu: "09:00",
          kegiatan: "Penjualan / Closing",
          poin: 1,
          status: "Selesai",
          catatan: "",
          nasabah: "",
          produk: "",
          api: 9000000,
        },
        {
          id: "may-api",
          tanggal: "2026-05-08",
          waktu: "11:00",
          kegiatan: "Penjualan / Closing",
          poin: 1,
          status: "Selesai",
          catatan: "",
          nasabah: "",
          produk: "",
          api: 70000000,
        },
      ],
      4
    );

    expect(targets.totalApi).toBe(70000000);
    expect(targets.totalAccumulatedApi).toBe(79000000);
  });

  it("uses the selected year for monthly and accumulated totals", () => {
    const targets = calculateDashboardTargets(
      [
        {
          id: "jan-2026",
          tanggal: "2026-01-06",
          waktu: "09:00",
          kegiatan: "Penjualan / Closing",
          poin: 1,
          status: "Selesai",
          catatan: "",
          nasabah: "",
          produk: "",
          api: 9000000,
        },
        {
          id: "jan-2027",
          tanggal: "2027-01-06",
          waktu: "09:00",
          kegiatan: "Penjualan / Closing",
          poin: 1,
          status: "Selesai",
          catatan: "",
          nasabah: "",
          produk: "",
          api: 11000000,
        },
      ],
      0,
      undefined,
      2027
    );

    expect(targets.totalPoints).toBe(1);
    expect(targets.totalApi).toBe(11000000);
    expect(targets.totalAccumulatedApi).toBe(11000000);
  });
});
