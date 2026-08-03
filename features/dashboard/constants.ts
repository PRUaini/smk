import type { ActivityType, DashboardTargets } from "./types";

function buildHourlyTimeSlots(startHour: number, endHour: number): string[] {
  return Array.from(
    { length: endHour - startHour + 1 },
    (_, index) => `${String(startHour + index).padStart(2, "0")}:00`
  );
}

const DASHBOARD_TIME_RANGE_SLOTS = buildHourlyTimeSlots(0, 24);

export const DEFAULT_DASHBOARD_START_TIME = "08:00";
export const DASHBOARD_TIME_SLOTS = DASHBOARD_TIME_RANGE_SLOTS.slice(0, -1);
export const DASHBOARD_END_TIME_SLOTS = DASHBOARD_TIME_RANGE_SLOTS.slice(1);

export function getNextDashboardTimeSlot(startTime: string): string {
  const startIndex = DASHBOARD_TIME_RANGE_SLOTS.indexOf(startTime);
  return startIndex >= 0 ? DASHBOARD_TIME_RANGE_SLOTS[startIndex + 1] ?? "" : "";
}

export function isValidDashboardTimeRange(startTime: string, endTime: string): boolean {
  const startIndex = DASHBOARD_TIME_RANGE_SLOTS.indexOf(startTime);
  const endIndex = DASHBOARD_TIME_RANGE_SLOTS.indexOf(endTime);
  return startIndex >= 0 && endIndex > startIndex;
}

export const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const;
export const OTHER_ACTIVITY_TYPE = "Others" as const;

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
  [OTHER_ACTIVITY_TYPE]: 0,
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
  [OTHER_ACTIVITY_TYPE]: "Aktivitas lain di luar kegiatan inti",
};

export const CLOSING_TYPES: ReadonlySet<ActivityType> = new Set([
  "Closing Prospek",
  "NPA",
]);

export const NO_EXTRA_INFO_ACTIVITY_TYPES: ReadonlySet<ActivityType> = new Set([
  "Training",
  "S3 / Motivasi",
  "Coaching / Meeting Leader",
  "Bawa teman ke BOP",
  OTHER_ACTIVITY_TYPE,
]);

export const MEETING_TYPES: ReadonlySet<ActivityType> = new Set([
  "Approach / Fact Finding",
]);

/** Calculate total points for a multi-select kegiatan array */
export function calculateActivityPoints(kegiatan: ActivityType[]): number {
  return kegiatan.reduce((sum, k) => sum + (ACTIVITY_POINTS[k] ?? 0), 0);
}

export function shouldHideActivityExtraInfo(kegiatan: ActivityType[]): boolean {
  return kegiatan.length > 0 && kegiatan.every((k) => NO_EXTRA_INFO_ACTIVITY_TYPES.has(k));
}

export const DEFAULT_TARGETS: Pick<
  DashboardTargets,
  | "targetPoints"
  | "targetMeetings"
  | "targetWeeklyPoints"
  | "targetWeeklyMeetings"
  | "targetApi"
  | "periodeKerjaAwal"
  | "periodeKerjaAkhir"
> = {
  targetPoints: 500,
  targetMeetings: 40,
  targetWeeklyPoints: 125,
  targetWeeklyMeetings: 10,
  targetApi: 0,
  periodeKerjaAwal: 1,
  periodeKerjaAkhir: 12,
};
