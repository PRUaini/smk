import { createClient } from "@/lib/supabase/server";
import { logout } from "@/features/auth/actions/logout";

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

        <form action={logout}>
          <button type="submit" className="header-logout-btn" id="logout-btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.75 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H6.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 12.75L15.75 9L12 5.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.75 9H6.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
