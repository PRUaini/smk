import { createClient } from "@/lib/supabase/server";
import type { Activity } from "../types";

type ActivityRow = Omit<Activity, "kontakNasabah"> & {
  kontak_nasabah?: string | null;
};

function mapActivityRow(row: ActivityRow): Activity {
  return {
    id: row.id,
    tanggal: row.tanggal,
    waktu: row.waktu,
    kegiatan: row.kegiatan,
    poin: row.poin,
    status: row.status,
    catatan: row.catatan,
    nasabah: row.nasabah,
    kontakNasabah: row.kontak_nasabah ?? "",
    produk: row.produk,
    api: row.api,
  };
}

function mapActivityPayload(activity: Partial<Omit<Activity, "id">>) {
  const { kontakNasabah, ...payload } = activity;
  return kontakNasabah === undefined
    ? payload
    : { ...payload, kontak_nasabah: kontakNasabah };
}

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

  return (data || []).map(mapActivityRow);
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
      ...mapActivityPayload(activity),
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create activity:", error);
    throw new Error("Failed to create activity. Please try again later.");
  }

  return mapActivityRow(data);
}

export async function updateActivity(
  id: string,
  agentId: string,
  activity: Partial<Omit<Activity, "id">>
): Promise<Activity> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .update(mapActivityPayload(activity))
    .eq("id", id)
    .eq("agent_id", agentId)
    .select()
    .single();

  if (error) {
    console.error("Failed to update activity:", error);
    throw new Error("Failed to update activity. Please try again later.");
  }

  return mapActivityRow(data);
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
