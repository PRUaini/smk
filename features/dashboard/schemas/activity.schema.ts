import { z } from "zod";
import { ACTIVITY_POINTS, CLOSING_TYPES, DASHBOARD_TIME_SLOTS, calculateActivityPoints } from "../constants";
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
  kegiatan: z.array(z.enum(activityTypes)).min(1, "Pilih minimal satu kegiatan"),
  status: z.enum(activityStatuses),
  catatan: z.string().max(200, "Catatan maksimal 200 karakter"),
  nasabah: z.string().trim().min(1, "Nama Nasabah wajib diisi"),
  kontakNasabah: z.string(),
  produk: z.string(),
  api: z
    .string()
    .refine((val) => {
      if (!val) return true;
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, "API tidak boleh negatif")
    .optional(),
}).superRefine((data, ctx) => {
  const hasClosing = data.kegiatan.some((k) => CLOSING_TYPES.has(k as ActivityType));
  if (hasClosing && !data.api) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "API wajib diisi untuk kegiatan Closing",
      path: ["api"],
    });
  }
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
    kegiatan: formData.kegiatan as ActivityType[],
    poin: calculateActivityPoints(formData.kegiatan as ActivityType[]),
    status: formData.status,
    catatan: formData.catatan,
    nasabah: formData.nasabah,
    kontakNasabah: formData.kontakNasabah,
    produk: formData.produk,
    api: formData.api ? Number(formData.api) : undefined,
  };
}

export const activityActionSchema = z.object({
  id: z.string().optional(),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  waktu: z
    .string()
    .min(1, "Waktu wajib dipilih")
    .refine((value) => DASHBOARD_TIME_SLOTS.includes(value as (typeof DASHBOARD_TIME_SLOTS)[number]), {
      message: "Waktu tidak valid",
    }),
  kegiatan: z.array(z.enum(activityTypes)).min(1, "Pilih minimal satu kegiatan"),
  status: z.enum(activityStatuses),
  catatan: z.string().max(200, "Catatan maksimal 200 karakter"),
  nasabah: z.string().trim().min(1, "Nama Nasabah wajib diisi"),
  kontakNasabah: z.string(),
  produk: z.string(),
  api: z.number().nonnegative("API tidak boleh negatif").optional(),
}).superRefine((data, ctx) => {
  const hasClosing = data.kegiatan.some((k) => CLOSING_TYPES.has(k as ActivityType));
  if (hasClosing && !data.api && data.api !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "API wajib diisi untuk kegiatan Closing",
      path: ["api"],
    });
  }
});
