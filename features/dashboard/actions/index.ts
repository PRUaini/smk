"use server";

import { revalidatePath } from "next/cache";
import {
  getKodeAgentFromEmail,
  getRequiredCurrentUser,
} from "@/features/auth/data/auth.repository";
import type { Activity } from "../types";
import {
  removeActivityForAgent,
  saveActivityForAgent,
  saveTargetsForAgent,
  toggleActivityStatusForAgent,
} from "../services/dashboard-actions.service";
import type { AgentTargets } from "../data/targets.repository";

export async function saveActivityAction(
  activityData: Omit<Activity, "id"> & { id?: string }
): Promise<void> {
  const user = await getRequiredCurrentUser();

  await saveActivityForAgent(user.id, activityData);
  revalidatePath("/dashboard");
}

export async function toggleActivityStatusAction(
  id: string,
  currentStatus: Activity["status"]
): Promise<void> {
  const user = await getRequiredCurrentUser();

  await toggleActivityStatusForAgent(user.id, id, currentStatus);
  revalidatePath("/dashboard");
}

export async function removeActivityAction(id: string): Promise<void> {
  const user = await getRequiredCurrentUser();

  await removeActivityForAgent(user.id, id);
  revalidatePath("/dashboard");
}

export async function saveAgentTargetsAction(
  targetsData: Omit<AgentTargets, "kodeAgent">
): Promise<AgentTargets> {
  const user = await getRequiredCurrentUser();
  const kodeAgent = getKodeAgentFromEmail(user.email);
  const result = await saveTargetsForAgent(kodeAgent, targetsData);

  revalidatePath("/dashboard");
  return result;
}
