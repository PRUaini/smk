import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardContainer from "@/features/dashboard/components/DashboardContainer";

export const metadata: Metadata = {
  title: "Dashboard — SMK Portal",
  description: "Dashboard utama SMK Portal.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const kodeAgent = user?.email?.replace("@smk.internal", "") ?? "Agent";

  return <DashboardContainer initialKodeAgent={kodeAgent} />;
}
