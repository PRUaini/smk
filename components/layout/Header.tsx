import {
  getCurrentUser,
  getKodeAgentFromEmail,
} from "@/features/auth/data/auth.repository";
import LogoutButton from "@/features/auth/components/LogoutButton";

export default async function Header() {
  const user = await getCurrentUser();
  const kodeAgent = getKodeAgentFromEmail(user?.email);

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
