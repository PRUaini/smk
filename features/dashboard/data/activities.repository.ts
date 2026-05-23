import { createClient } from "@/lib/supabase/server";
import type { Activity } from "../types";

export async function getActivitiesByAgent(agentId: string): Promise<Activity[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("agent_id", agentId)
    .order("tanggal", { ascending: true })
    .order("waktu", { ascending: true });

  if (error) {
    console.error("Failed to fetch activities:", error);
    throw new Error("Failed to fetch activities. Please try again later.");
  }

  return (data || []).map((row) => ({
    id: row.id,
    tanggal: row.tanggal,
    waktu: row.waktu,
    kegiatan: row.kegiatan,
    poin: row.poin,
    status: row.status,
    catatan: row.catatan,
    nasabah: row.nasabah,
    produk: row.produk,
    api: row.api,
  }));
}

export async function createActivity(
  agentId: string,
  activity: Omit<Activity, "id">
): Promise<Activity> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .insert({
      agent_id: agentId,
      tanggal: activity.tanggal,
      waktu: activity.waktu,
      kegiatan: activity.kegiatan,
      poin: activity.poin,
      status: activity.status,
      catatan: activity.catatan,
      nasabah: activity.nasabah,
      produk: activity.produk,
      api: activity.api,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create activity:", error);
    throw new Error("Failed to create activity. Please try again later.");
  }

  return {
    id: data.id,
    tanggal: data.tanggal,
    waktu: data.waktu,
    kegiatan: data.kegiatan,
    poin: data.poin,
    status: data.status,
    catatan: data.catatan,
    nasabah: data.nasabah,
    produk: data.produk,
    api: data.api,
  };
}

export async function updateActivity(
  id: string,
  agentId: string,
  activity: Partial<Omit<Activity, "id">>
): Promise<Activity> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .update(activity)
    .eq("id", id)
    .eq("agent_id", agentId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update activity:", error);
    throw new Error("Failed to update activity. Please try again later.");
  }

  return {
    id: data.id,
    tanggal: data.tanggal,
    waktu: data.waktu,
    kegiatan: data.kegiatan,
    poin: data.poin,
    status: data.status,
    catatan: data.catatan,
    nasabah: data.nasabah,
    produk: data.produk,
    api: data.api,
  };
}

export async function deleteActivity(id: string, agentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", id)
    .eq("agent_id", agentId);

  if (error) {
    console.error("Failed to delete activity:", error);
    throw new Error("Failed to delete activity. Please try again later.");
  }
}
