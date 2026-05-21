export type ActivityType =
  | "Pendekatan"
  | "Pertemuan"
  | "Fact Finding"
  | "Mendapatkan 3 Referensi"
  | "Wawancara Penutupan"
  | "Penjualan / Closing"
  | "Penyerahan Polis / Servicing";

export type ActivityStatus = "Selesai" | "Proses" | "Belum";

export interface Activity {
  id: string;
  tanggal: string;
  waktu: string;
  kegiatan: ActivityType;
  poin: number;
  status: ActivityStatus;
  catatan: string;
  nasabah: string;
  produk: string;
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
}
