import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <section className="welcome-section" id="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Selamat datang, <span className="welcome-highlight">{kodeAgent}</span>
          </h1>
          <p className="welcome-subtitle">
            Berikut ringkasan aktivitas Anda hari ini.
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="stats-grid" id="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-data">
            <p className="stat-label">Total Materi</p>
            <p className="stat-value">—</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-data">
            <p className="stat-label">Selesai</p>
            <p className="stat-value">—</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-data">
            <p className="stat-label">Dalam Proses</p>
            <p className="stat-value">—</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="stat-data">
            <p className="stat-label">Skor Rata-rata</p>
            <p className="stat-value">—</p>
          </div>
        </div>
      </section>

      {/* Placeholder content area */}
      <section className="content-placeholder" id="content-area">
        <div className="placeholder-card">
          <div className="placeholder-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="placeholder-title">Konten akan segera hadir</h3>
          <p className="placeholder-text">
            Materi pembelajaran dan fitur interaktif sedang dalam pengembangan.
          </p>
        </div>
      </section>
    </div>
  );
}
