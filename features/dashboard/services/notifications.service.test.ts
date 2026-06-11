import { describe, expect, it } from "vitest";
import type { Activity } from "../types";
import { buildActivityNotifications } from "./notifications.service";

const baseActivity: Activity = {
  id: "activity-1",
  tanggal: "2026-05-21",
  waktu: "08:00",
  waktuSelesai: "09:00",
  kegiatan: ["Chat Calon Nasabah"],
  poin: 1,
  status: "Belum",
  catatan: "",
  nasabah: "Budi",
  kontakNasabah: "",
  produk: "Produk A",
};

describe("buildActivityNotifications", () => {
  it("orders incomplete overdue, today, and upcoming activities", () => {
    const notifications = buildActivityNotifications(
      [
        { ...baseActivity, id: "upcoming", tanggal: "2026-05-26", waktu: "09:00", waktuSelesai: "10:00" },
        { ...baseActivity, id: "done", tanggal: "2026-05-25", waktu: "09:00", waktuSelesai: "10:00", status: "Selesai" },
        { ...baseActivity, id: "today", tanggal: "2026-05-25", waktu: "10:00", waktuSelesai: "11:00" },
        { ...baseActivity, id: "overdue", tanggal: "2026-05-20", waktu: "08:00", waktuSelesai: "09:00" },
      ],
      new Date(2026, 4, 25, 9, 0, 0)
    );

    expect(notifications.map((notification) => notification.activityId)).toEqual([
      "overdue",
      "today",
      "upcoming",
    ]);
    expect(notifications.map((notification) => notification.kind)).toEqual([
      "overdue",
      "today",
      "upcoming",
    ]);
    expect(notifications[1].description).toContain("10:00 - 11:00");
  });

  it("skips invalid dates and caps results to ten notifications", () => {
    const activities = Array.from({ length: 12 }, (_, index) => ({
      ...baseActivity,
      id: `activity-${index}`,
      tanggal: `2026-05-${String(index + 1).padStart(2, "0")}`,
      waktu: "08:00",
      waktuSelesai: "09:00",
    }));

    const notifications = buildActivityNotifications(
      [
        { ...baseActivity, id: "invalid-date", tanggal: "bad-date", waktu: "08:00" },
        { ...baseActivity, id: "invalid-time", tanggal: "2026-05-25", waktu: "bad-time" },
        ...activities,
      ],
      new Date(2026, 4, 25, 9, 0, 0)
    );

    expect(notifications).toHaveLength(10);
    expect(notifications.map((notification) => notification.activityId)).not.toContain("invalid-date");
    expect(notifications.map((notification) => notification.activityId)).not.toContain("invalid-time");
  });
});
