import { z } from "zod";

export const targetsFormSchema = z.object({
  targetPoints: z.preprocess((val) => Number(val), z.number().int().min(0, "Target poin minimal 0")),
  targetMeetings: z.preprocess((val) => Number(val), z.number().int().min(0, "Target pertemuan minimal 0")),
  targetSales: z.preprocess((val) => Number(val), z.number().int().min(0, "Target penjualan minimal 0")),
  targetWeeklyPoints: z.preprocess((val) => Number(val), z.number().int().min(0, "Target mingguan poin minimal 0")),
  targetWeeklyMeetings: z.preprocess((val) => Number(val), z.number().int().min(0, "Target mingguan pertemuan minimal 0")),
  targetWeeklySales: z.preprocess((val) => Number(val), z.number().int().min(0, "Target mingguan penjualan minimal 0")),
});

export type TargetsFormData = z.infer<typeof targetsFormSchema>;
