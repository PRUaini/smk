import { createClient } from "@/lib/supabase/server";

export interface AgentTargets {
  kodeAgent: string;
  targetPoints: number;
  targetMeetings: number;
  targetWeeklyPoints: number;
  targetWeeklyMeetings: number;
  targetApi: number;
  periodeKerjaAwal: number;
  periodeKerjaAkhir: number;
}

export async function getAgentTargets(kodeAgent: string): Promise<AgentTargets | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_targets")
    .select("*")
    .eq("kode_agent", kodeAgent)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch agent targets:", error);
    throw new Error("Failed to fetch agent targets. Please try again later.");
  }

  if (!data) return null;

  return {
    kodeAgent: data.kode_agent,
    targetPoints: data.target_points,
    targetMeetings: data.target_meetings,
    targetWeeklyPoints: data.target_weekly_points,
    targetWeeklyMeetings: data.target_weekly_meetings,
    targetApi: data.target_api ?? 0,
    periodeKerjaAwal: data.periode_kerja_awal ?? 1,
    periodeKerjaAkhir: data.periode_kerja_akhir ?? 12,
  };
}

export async function saveAgentTargets(kodeAgent: string, targets: Omit<AgentTargets, "kodeAgent">): Promise<AgentTargets> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_targets")
    .upsert(
      {
        kode_agent: kodeAgent,
        target_points: targets.targetPoints,
        target_meetings: targets.targetMeetings,
        target_weekly_points: targets.targetWeeklyPoints,
        target_weekly_meetings: targets.targetWeeklyMeetings,
        target_api: targets.targetApi,
        periode_kerja_awal: targets.periodeKerjaAwal,
        periode_kerja_akhir: targets.periodeKerjaAkhir,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "kode_agent" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to save agent targets:", error);
    throw new Error("Failed to save agent targets. Please try again later.");
  }

  return {
    kodeAgent: data.kode_agent,
    targetPoints: data.target_points,
    targetMeetings: data.target_meetings,
    targetWeeklyPoints: data.target_weekly_points,
    targetWeeklyMeetings: data.target_weekly_meetings,
    targetApi: data.target_api ?? targets.targetApi,
    periodeKerjaAwal: data.periode_kerja_awal ?? targets.periodeKerjaAwal,
    periodeKerjaAkhir: data.periode_kerja_akhir ?? targets.periodeKerjaAkhir,
  };
}
