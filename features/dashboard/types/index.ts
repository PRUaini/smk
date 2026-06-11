export type ActivityType =
  | "Chat Calon Nasabah"
  | "Approach / Fact Finding"
  | "Follow Up"
  | "Presentasi"
  | "Closing Prospek"
  | "NPA"
  | "Agen FLC"
  | "Dapat referensi"
  | "Servicing"
  | "Training"
  | "S3 / Motivasi"
  | "Coaching / Meeting Leader"
  | "Bawa teman ke BOP";

export type ActivityStatus = "Selesai" | "Belum";

export interface Activity {
  id: string;
  tanggal: string;
  waktu: string;
  kegiatan: ActivityType[];
  poin: number;
  status: ActivityStatus;
  catatan: string;
  nasabah: string;
  kontakNasabah: string;
  produk: string;
  api?: number;
}

export interface DashboardTargets {
  targetPoints: number;
  totalPoints: number;
  targetMeetings: number;
  totalMeetings: number;
  targetSales: number;
  totalSales: number;
  activeDays: number;
  totalDays: number;
  targetWeeklyPoints: number;
  totalWeeklyPoints: number;
  targetWeeklyMeetings: number;
  totalWeeklyMeetings: number;
  targetWeeklySales: number;
  totalWeeklySales: number;
  totalApi: number;
  totalAccumulatedApi: number;
  totalWeeklyApi: number;
}
