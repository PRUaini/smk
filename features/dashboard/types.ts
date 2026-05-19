export type ActivityType =
  | 'Pendekatan'
  | 'Pertemuan'
  | 'Pencarian Fakta'
  | 'Mendapatkan 3 Referensi'
  | 'Wawancara Penutupan'
  | 'Penjualan'
  | 'Penyerahan Polis/Layanan';

export type ActivityStatus = 'Selesai' | 'Proses' | 'Belum';

export interface Activity {
  id: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:MM
  kegiatan: ActivityType;
  poin: number;
  status: ActivityStatus;
  catatan: string;
  nasabah: string;
  lampiran?: string;
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
  // Weekly Targets
  targetWeeklyPoints: number;
  totalWeeklyPoints: number;
  targetWeeklyMeetings: number;
  totalWeeklyMeetings: number;
  targetWeeklySales: number;
  totalWeeklySales: number;
}
