import React from "react";
import LogoutButton from "@/features/auth/components/LogoutButton";

interface DashboardHeaderProps {
  kodeAgent: string;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

// Format current date: "Rabu, 06 Januari 2024" (Indonesian Locale)
function formatIndoDate(date: Date) {
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
}

export default function DashboardHeader({ kodeAgent }: DashboardHeaderProps) {
  const [greeting, setGreeting] = React.useState(getGreeting);

  React.useEffect(() => {
    const refresh = () => setGreeting(getGreeting());
    const interval = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const currentDate = new Date();

  return (
    <header className="dashboard-header-new">
      <div className="header-greeting-section">
        <h1 className="header-title-new">
          {greeting}, <span className="highlight-agent">{kodeAgent}</span>!
        </h1>
        <p className="header-subtitle-new">{formatIndoDate(currentDate)}</p>
      </div>

      <div className="header-actions">
        {/* Logout Button */}
        <LogoutButton className="header-logout-offset" />
      </div>
    </header>
  );
}
