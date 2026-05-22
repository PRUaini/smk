import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/features/auth/components/LogoutButton";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Extract kode_agent from the synthetic email
  const kodeAgent = user?.email?.replace("@smk.internal", "") ?? "Agent";

  return (
    <header className="dashboard-header" id="dashboard-header">
      <div className="header-left">
        <h2 className="header-page-title">Dashboard</h2>
      </div>

      <div className="header-right">
        <div className="header-user-info">
          <div className="header-avatar" aria-hidden="true">
            {kodeAgent.charAt(0).toUpperCase()}
          </div>
          <span className="header-user-name">{kodeAgent}</span>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
