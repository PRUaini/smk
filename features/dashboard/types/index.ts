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
  | "Bawa teman ke BOP"
  | "Others";

export type ActivityStatus = "Selesai" | "Belum";

export interface Activity {
  id: string;
  tanggal: string;
  waktu: string;
  waktuSelesai: string;
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
  activeDays: number;
  totalDays: number;
  targetWeeklyPoints: number;
  totalWeeklyPoints: number;
  targetWeeklyMeetings: number;
  totalWeeklyMeetings: number;
  targetApi: number;
  targetApiBulanan: number;
  targetApiMingguan: number;
  periodeKerjaAwal: number;
  periodeKerjaAkhir: number;
  totalApi: number;
  totalAccumulatedApi: number;
  totalWeeklyApi: number;
}
