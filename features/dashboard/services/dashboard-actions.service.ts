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
import { ACTIVITY_POINTS } from "../constants";
import type { Activity } from "../types";

export async function saveActivityForAgent(
  agentId: string,
  activityData: Omit<Activity, "id"> & { id?: string }
): Promise<void> {
  const validated = activityActionSchema.safeParse(activityData);
  if (!validated.success) {
    throw new Error("Invalid activity data");
  }

  const validatedData = validated.data;
  const poin = ACTIVITY_POINTS[validatedData.kegiatan];

  if (validatedData.id) {
    const { id, ...payload } = validatedData;
    await updateActivity(id, agentId, { ...payload, poin });
    return;
  }

  await createActivity(agentId, { ...validatedData, poin });
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
