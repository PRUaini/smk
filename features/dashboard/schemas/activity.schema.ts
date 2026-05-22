import { z } from "zod";
import { ACTIVITY_DESCRIPTIONS, ACTIVITY_POINTS, DASHBOARD_TIME_SLOTS } from "../constants";
import type { Activity, ActivityStatus, ActivityType } from "../types";

const activityTypes = Object.keys(ACTIVITY_POINTS) as [ActivityType, ...ActivityType[]];
const activityStatuses: [ActivityStatus, ...ActivityStatus[]] = ["Selesai", "Proses", "Belum"];

export const activityFormSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  waktu: z
    .string()
    .min(1, "Waktu wajib dipilih")
    .refine((value) => DASHBOARD_TIME_SLOTS.includes(value as (typeof DASHBOARD_TIME_SLOTS)[number]), {
      message: "Waktu tidak valid",
    }),
  kegiatan: z.enum(activityTypes),
  status: z.enum(activityStatuses),
  catatan: z.string().max(200, "Catatan maksimal 200 karakter"),
  nasabah: z.string(),
  produk: z.string()
});

export type ActivityFormData = z.infer<typeof activityFormSchema>;

export function buildActivityPayload(
  formData: ActivityFormData,
  id?: string
): Omit<Activity, "id"> & { id?: string } {
  return {
    id,
    tanggal: formData.tanggal,
    waktu: formData.waktu,
    kegiatan: formData.kegiatan,
    poin: ACTIVITY_POINTS[formData.kegiatan],
    status: formData.status,
    catatan: formData.catatan,
    nasabah: formData.nasabah,
    produk: formData.produk
  };
}
