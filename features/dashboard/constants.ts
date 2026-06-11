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

export const DASHBOARD_END_TIME_SLOTS = [
  ...DASHBOARD_TIME_SLOTS,
  "18:00",
] as const;

export function getNextDashboardTimeSlot(startTime: string): string {
  const startIndex = DASHBOARD_END_TIME_SLOTS.indexOf(
    startTime as (typeof DASHBOARD_END_TIME_SLOTS)[number]
  );
  return startIndex >= 0 ? DASHBOARD_END_TIME_SLOTS[startIndex + 1] ?? "" : "";
}

export function isValidDashboardTimeRange(startTime: string, endTime: string): boolean {
  const startIndex = DASHBOARD_END_TIME_SLOTS.indexOf(
    startTime as (typeof DASHBOARD_END_TIME_SLOTS)[number]
  );
  const endIndex = DASHBOARD_END_TIME_SLOTS.indexOf(
    endTime as (typeof DASHBOARD_END_TIME_SLOTS)[number]
  );
  return startIndex >= 0 && endIndex > startIndex;
}

export const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const;

export const ACTIVITY_POINTS: Record<ActivityType, number> = {
  "Chat Calon Nasabah": 1,
  "Approach / Fact Finding": 4,
  "Follow Up": 2,
  Presentasi: 8,
  "Closing Prospek": 10,
  NPA: 10,
  "Agen FLC": 10,
  "Dapat referensi": 3,
  Servicing: 3,
  Training: 3,
  "S3 / Motivasi": 3,
  "Coaching / Meeting Leader": 3,
  "Bawa teman ke BOP": 3,
};

export const ACTIVITY_DESCRIPTIONS: Record<ActivityType, string> = {
  "Chat Calon Nasabah": "Chat atau kontak awal dengan calon nasabah baru",
  "Approach / Fact Finding": "Pendekatan, fact finding, dan mendapatkan janji temu",
  "Follow Up": "Follow up nasabah yang sudah dihubungi sebelumnya",
  Presentasi: "Presentasi prospek/NPA dan pengiriman proposal",
  "Closing Prospek": "Closing penjualan kepada prospek baru",
  NPA: "Closing penjualan kepada Nasabah Prudential Aktif",
  "Agen FLC": "Aktivitas sebagai Agen Financial Life Consultant",
  "Dapat referensi": "Mendapatkan referensi dari nasabah atau kontak",
  Servicing: "Memberikan layanan kepada nasabah yang sudah ada",
  Training: "Mengikuti atau menyelenggarakan pelatihan",
  "S3 / Motivasi": "Sesi S3 atau kegiatan motivasi tim",
  "Coaching / Meeting Leader": "Coaching atau meeting dengan leader",
  "Bawa teman ke BOP": "Membawa teman atau prospek ke Business Opportunity Presentation",
};

export const CLOSING_TYPES: ReadonlySet<ActivityType> = new Set([
  "Closing Prospek",
  "NPA",
]);

export const MEETING_TYPES: ReadonlySet<ActivityType> = new Set([
  "Approach / Fact Finding",
]);

/** Calculate total points for a multi-select kegiatan array */
export function calculateActivityPoints(kegiatan: ActivityType[]): number {
  return kegiatan.reduce((sum, k) => sum + (ACTIVITY_POINTS[k] ?? 0), 0);
}

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
