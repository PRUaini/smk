import {
  createActivity,
  deleteActivity,
  updateActivity,
} from "../data/activities.repository";
import {
  saveAgentTargets,
  type AgentTargets,
} from "../data/targets.repository";
import { activityActionSchema } from "../schemas/activity.schema";
import { targetsFormSchema } from "../schemas/targets.schema";
import { calculateActivityPoints, shouldHideActivityExtraInfo } from "../constants";
import type { Activity, ActivityType } from "../types";

export async function saveActivityForAgent(
  agentId: string,
  activityData: Omit<Activity, "id"> & { id?: string }
): Promise<Activity> {
  const validated = activityActionSchema.safeParse(activityData);
  if (!validated.success) {
    throw new Error("Invalid activity data");
  }

  const validatedData = validated.data;
  const poin = calculateActivityPoints(validatedData.kegiatan as ActivityType[]);
  const hideExtraInfo = shouldHideActivityExtraInfo(validatedData.kegiatan as ActivityType[]);
  const normalizedData = hideExtraInfo
    ? {
        ...validatedData,
        nasabah: "",
        kontakNasabah: "",
        produk: "",
        api: undefined,
      }
    : validatedData;

  if (normalizedData.id) {
    const { id, ...payload } = normalizedData;
    return updateActivity(id, agentId, { ...payload, poin });
  }

  return createActivity(agentId, { ...normalizedData, poin });
}

export async function toggleActivityStatusForAgent(
  agentId: string,
  id: string,
  currentStatus: Activity["status"]
): Promise<void> {
  const nextStatus: Activity["status"] =
    currentStatus === "Selesai" ? "Belum" : "Selesai";

  await updateActivity(id, agentId, { status: nextStatus });
}

export async function removeActivityForAgent(
  agentId: string,
  id: string
): Promise<void> {
  await deleteActivity(id, agentId);
}

export async function saveTargetsForAgent(
  kodeAgent: string,
  targetsData: Omit<AgentTargets, "kodeAgent">
): Promise<AgentTargets> {
  const validated = targetsFormSchema.safeParse(targetsData);
  if (!validated.success) {
    throw new Error("Invalid targets data");
  }

  return saveAgentTargets(kodeAgent, validated.data);
}
