import { z } from "zod";
import { DEFAULT_TARGETS } from "../constants";

const emptyToDefault = (val: unknown, fallback: number) => {
  if (val === "" || val === undefined || val === null) {
    return fallback;
  }
  return Number(val);
};

export const targetsFormSchema = z.object({
  targetPoints: z.preprocess((val) => emptyToDefault(val, DEFAULT_TARGETS.targetPoints), z.number().int().min(0, "Target poin minimal 0")),
  targetMeetings: z.preprocess((val) => emptyToDefault(val, DEFAULT_TARGETS.targetMeetings), z.number().int().min(0, "Target pertemuan minimal 0")),
  targetSales: z.preprocess((val) => emptyToDefault(val, DEFAULT_TARGETS.targetSales), z.number().int().min(0, "Target penjualan minimal 0")),
  targetWeeklyPoints: z.preprocess((val) => emptyToDefault(val, DEFAULT_TARGETS.targetWeeklyPoints), z.number().int().min(0, "Target mingguan poin minimal 0")),
  targetWeeklyMeetings: z.preprocess((val) => emptyToDefault(val, DEFAULT_TARGETS.targetWeeklyMeetings), z.number().int().min(0, "Target mingguan pertemuan minimal 0")),
  targetWeeklySales: z.preprocess((val) => emptyToDefault(val, DEFAULT_TARGETS.targetWeeklySales), z.number().int().min(0, "Target mingguan penjualan minimal 0")),
});

export type TargetsFormData = z.infer<typeof targetsFormSchema>;
