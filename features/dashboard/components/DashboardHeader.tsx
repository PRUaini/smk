import React from "react";
import { logout } from "@/features/auth/actions/logout";

interface DashboardHeaderProps {
  kodeAgent: string;
}

export default function DashboardHeader({ kodeAgent }: DashboardHeaderProps) {
  // Determine dynamic Indonesian greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Selamat pagi";
    if (hour >= 11 && hour < 15) return "Selamat siang";
    if (hour >= 15 && hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  // Format current date: "Rabu, 06 Januari 2024" (Indonesian Locale)
  const formatIndoDate = (date: Date) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, "0");
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  const currentDate = new Date();

  return (
    <header className="dashboard-header-new">
      <div className="header-greeting-section">
        <h1 className="header-title-new">
          {getGreeting()}, <span className="highlight-agent">{kodeAgent}</span>! 👋
        </h1>
        <p className="header-subtitle-new">{formatIndoDate(currentDate)}</p>
      </div>

      <div className="header-actions">




        {/* Logout Button */}
        <form action={logout}>
          <button type="submit" className="header-logout-btn header-logout-offset" id="logout-btn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.75 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 12.75L15.75 9L12 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15.75 9H6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Keluar
          </button>
        </form>
      </div>
    </header>
  );
}
