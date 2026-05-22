import type { Metadata } from "next";
import { DashboardContainer } from "@/features/dashboard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sistem Management Kegiatan",
  description: "Dashboard Utama",
};

import { getActivitiesByAgent } from "@/features/dashboard/data/activities.repository";
import { getAgentTargets } from "@/features/dashboard/data/targets.repository";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesi tidak ditemukan.");
  }

  const kodeAgent = user.email?.replace("@smk.internal", "") ?? "Agent";
  const activities = await getActivitiesByAgent(user.id);
  const initialTargets = await getAgentTargets(kodeAgent);

  return (
    <DashboardContainer
      initialKodeAgent={kodeAgent}
      initialActivities={activities}
      initialTargets={initialTargets}
    />
  );
}
