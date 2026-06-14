import { z } from "zod";
import {
  ACTIVITY_POINTS,
  CLOSING_TYPES,
  DASHBOARD_END_TIME_SLOTS,
  DASHBOARD_TIME_SLOTS,
  OTHER_ACTIVITY_TYPE,
  calculateActivityPoints,
  isValidDashboardTimeRange,
} from "../constants";
import type { Activity, ActivityStatus, ActivityType } from "../types";

const activityTypes = Object.keys(ACTIVITY_POINTS) as [ActivityType, ...ActivityType[]];
const activityStatuses: [ActivityStatus, ...ActivityStatus[]] = ["Selesai", "Belum"];

const startTimeField = z
  .string()
  .min(1, "Waktu mulai wajib dipilih")
  .refine((value) => DASHBOARD_TIME_SLOTS.includes(value as (typeof DASHBOARD_TIME_SLOTS)[number]), {
    message: "Waktu mulai tidak valid",
  });

const endTimeField = z
  .string()
  .min(1, "Waktu selesai wajib dipilih")
  .refine((value) => DASHBOARD_END_TIME_SLOTS.includes(value as (typeof DASHBOARD_END_TIME_SLOTS)[number]), {
    message: "Waktu selesai tidak valid",
  });

function addTimeRangeIssue(
  data: { waktu: string; waktuSelesai: string },
  ctx: z.RefinementCtx
) {
  if (!isValidDashboardTimeRange(data.waktu, data.waktuSelesai)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Waktu selesai harus setelah waktu mulai",
      path: ["waktuSelesai"],
    });
  }
}

function isOthersOnly(kegiatan: ActivityType[]): boolean {
  return kegiatan.length === 1 && kegiatan[0] === OTHER_ACTIVITY_TYPE;
}

function addActivityDetailsIssues(
  data: { kegiatan: ActivityType[]; nasabah: string },
  ctx: z.RefinementCtx
) {
  const hasOthers = data.kegiatan.includes(OTHER_ACTIVITY_TYPE);
  if (hasOthers && data.kegiatan.length > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Others tidak dapat digabung dengan kegiatan inti",
      path: ["kegiatan"],
    });
  }

  if (!isOthersOnly(data.kegiatan) && data.nasabah.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nama Nasabah wajib diisi",
      path: ["nasabah"],
    });
  }
}

export const activityFormSchema = z.object({
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  waktu: startTimeField,
  waktuSelesai: endTimeField,
  kegiatan: z.array(z.enum(activityTypes)).min(1, "Pilih minimal satu kegiatan"),
  catatan: z.string().max(200, "Catatan maksimal 200 karakter"),
  nasabah: z.string().trim(),
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
  addTimeRangeIssue(data, ctx);
  addActivityDetailsIssues(data, ctx);

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
  currentStatus?: ActivityStatus,
  id?: string
): Omit<Activity, "id"> & { id?: string } {
  const isOthersActivity = isOthersOnly(formData.kegiatan as ActivityType[]);

  return {
    id,
    tanggal: formData.tanggal,
    waktu: formData.waktu,
    waktuSelesai: formData.waktuSelesai,
    kegiatan: formData.kegiatan as ActivityType[],
    poin: calculateActivityPoints(formData.kegiatan as ActivityType[]),
    status: currentStatus ?? "Belum",
    catatan: formData.catatan,
    nasabah: isOthersActivity ? "" : formData.nasabah,
    kontakNasabah: isOthersActivity ? "" : formData.kontakNasabah,
    produk: isOthersActivity ? "" : formData.produk,
    api: isOthersActivity ? undefined : formData.api ? Number(formData.api) : undefined,
  };
}

export const activityActionSchema = z.object({
  id: z.string().optional(),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  waktu: startTimeField,
  waktuSelesai: endTimeField,
  kegiatan: z.array(z.enum(activityTypes)).min(1, "Pilih minimal satu kegiatan"),
  status: z.enum(activityStatuses),
  catatan: z.string().max(200, "Catatan maksimal 200 karakter"),
  nasabah: z.string().trim(),
  kontakNasabah: z.string(),
  produk: z.string(),
  api: z.number().nonnegative("API tidak boleh negatif").optional(),
}).superRefine((data, ctx) => {
  addTimeRangeIssue(data, ctx);
  addActivityDetailsIssues(data, ctx);

  const hasClosing = data.kegiatan.some((k) => CLOSING_TYPES.has(k as ActivityType));
  if (hasClosing && !data.api && data.api !== 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "API wajib diisi untuk kegiatan Closing",
      path: ["api"],
    });
  }
});
