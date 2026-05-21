"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createActivity,
  updateActivity,
  deleteActivity,
  getActivitiesByAgent,
} from "../data/activities.repository";
import type { Activity } from "../types";

async function getAuthenticatedAgentId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized access");
  }

  return user.id;
}

export async function saveActivityAction(
  activityData: Omit<Activity, "id"> & { id?: string }
): Promise<void> {
  const agentId = await getAuthenticatedAgentId();

  if (activityData.id) {
    const { id, ...payload } = activityData;
    await updateActivity(id, agentId, payload);
  } else {
    await createActivity(agentId, activityData);
  }

  revalidatePath("/dashboard");
}

export async function toggleActivityStatusAction(
  id: string,
  currentStatus: Activity["status"]
): Promise<void> {
  const agentId = await getAuthenticatedAgentId();
  const nextStatus: Activity["status"] = currentStatus === "Selesai" ? "Belum" : "Selesai";

  await updateActivity(id, agentId, { status: nextStatus });
  revalidatePath("/dashboard");
}

export async function removeActivityAction(id: string): Promise<void> {
  const agentId = await getAuthenticatedAgentId();

  await deleteActivity(id, agentId);
  revalidatePath("/dashboard");
}

import { saveAgentTargets, type AgentTargets } from "../data/targets.repository";

export async function saveAgentTargetsAction(
  targetsData: Omit<AgentTargets, "kodeAgent">
): Promise<AgentTargets> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized access");
  }

  const kodeAgent = user.email?.replace("@smk.internal", "") ?? "Agent";
  const result = await saveAgentTargets(kodeAgent, targetsData);
  revalidatePath("/dashboard");
  return result;
}
