import type { Metadata } from "next";
import { DashboardContainer } from "@/features/dashboard";
import {
  getKodeAgentFromEmail,
  getRequiredCurrentUser,
} from "@/features/auth/data/auth.repository";
import { getActivitiesByAgent } from "@/features/dashboard/data/activities.repository";
import { getAgentTargets } from "@/features/dashboard/data/targets.repository";
import { getUserWallpaper } from "@/features/dashboard/data/wallpaper.repository";

export const metadata: Metadata = {
  title: "Sistem Management Kegiatan",
  description: "Dashboard Utama",
};

export default async function DashboardPage() {
  const user = await getRequiredCurrentUser();
  const kodeAgent = getKodeAgentFromEmail(user.email);
  const activities = await getActivitiesByAgent(user.id);
  const initialTargets = await getAgentTargets(kodeAgent);
  const initialWallpaper = await getUserWallpaper(user.id);

  return (
    <DashboardContainer
      initialKodeAgent={kodeAgent}
      initialActivities={activities}
      initialTargets={initialTargets}
      initialWallpaperUrl={initialWallpaper?.wallpaperUrl ?? null}
    />
  );
}
