import { createClient } from "@/lib/supabase/server";

export interface AgentTargets {
  kodeAgent: string;
  targetPoints: number;
  targetMeetings: number;
  targetSales: number;
  targetWeeklyPoints: number;
  targetWeeklyMeetings: number;
  targetWeeklySales: number;
}

export async function getAgentTargets(kodeAgent: string): Promise<AgentTargets | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_targets")
    .select("*")
    .eq("kode_agent", kodeAgent)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch agent targets: ${error.message}`);
  }

  if (!data) return null;

  return {
    kodeAgent: data.kode_agent,
    targetPoints: data.target_points,
    targetMeetings: data.target_meetings,
    targetSales: data.target_sales,
    targetWeeklyPoints: data.target_weekly_points,
    targetWeeklyMeetings: data.target_weekly_meetings,
    targetWeeklySales: data.target_weekly_sales,
  };
}

export async function saveAgentTargets(kodeAgent: string, targets: Omit<AgentTargets, "kodeAgent">): Promise<AgentTargets> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_targets")
    .upsert({
      kode_agent: kodeAgent,
      target_points: targets.targetPoints,
      target_meetings: targets.targetMeetings,
      target_sales: targets.targetSales,
      target_weekly_points: targets.targetWeeklyPoints,
      target_weekly_meetings: targets.targetWeeklyMeetings,
      target_weekly_sales: targets.targetWeeklySales,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save agent targets: ${error.message}`);
  }

  return {
    kodeAgent: data.kode_agent,
    targetPoints: data.target_points,
    targetMeetings: data.target_meetings,
    targetSales: data.target_sales,
    targetWeeklyPoints: data.target_weekly_points,
    targetWeeklyMeetings: data.target_weekly_meetings,
    targetWeeklySales: data.target_weekly_sales,
  };
}
