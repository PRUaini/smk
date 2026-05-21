import type { ActivityType, DashboardTargets } from "./types";

export const DASHBOARD_TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
] as const;

export const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;

export const ACTIVITY_POINTS: Record<ActivityType, number> = {
  Pendekatan: 1,
  Pertemuan: 2,
  "Fact Finding": 2,
  "Mendapatkan 3 Referensi": 4,
  "Wawancara Penutupan": 4,
  "Penjualan / Closing": 1,
  "Penyerahan Polis / Servicing": 1,
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityType, string> = {
  Pendekatan: "Melakukan pendekatan awal dengan calon nasabah",
  Pertemuan: "Melakukan pertemuan atau janji temu dengan nasabah",
  "Fact Finding": "Menggali kebutuhan dan potensi nasabah",
  "Mendapatkan 3 Referensi": "Meminta referensi dari nasabah atau kontak terkait",
  "Wawancara Penutupan": "Melakukan wawancara untuk penutupan polis",
  "Penjualan / Closing": "Melakukan penjualan atau presentasi produk",
  "Penyerahan Polis / Servicing": "Menyerahkan polis atau memberikan layanan kepada nasabah",
};

export const DEFAULT_TARGETS: Pick<
  DashboardTargets,
  | "targetPoints"
  | "targetMeetings"
  | "targetSales"
  | "targetWeeklyPoints"
  | "targetWeeklyMeetings"
  | "targetWeeklySales"
> = {
  targetPoints: 500,
  targetMeetings: 40,
  targetSales: 25,
  targetWeeklyPoints: 125,
  targetWeeklyMeetings: 10,
  targetWeeklySales: 6,
};
