import React from "react";
import LogoutButton from "@/features/auth/components/LogoutButton";
import type { ToastType } from "../utils/useToast";
import WallpaperPicker from "./WallpaperPicker";

interface DashboardHeaderProps {
  kodeAgent: string;
  initialWallpaperUrl: string | null;
  onWallpaperChange: (wallpaperUrl: string | null) => void;
  onToast: (message: string, type: ToastType) => void;
}

export default function DashboardHeader({
  kodeAgent,
  initialWallpaperUrl,
  onWallpaperChange,
  onToast,
}: DashboardHeaderProps) {
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
          {getGreeting()}, <span className="highlight-agent">{kodeAgent}</span>!
        </h1>
        <p className="header-subtitle-new">{formatIndoDate(currentDate)}</p>
      </div>

      <div className="header-actions">
        <WallpaperPicker
          initialWallpaperUrl={initialWallpaperUrl}
          onWallpaperChange={onWallpaperChange}
          onToast={onToast}
        />

        {/* Logout Button */}
        <LogoutButton className="header-logout-offset" />
      </div>
    </header>
  );
}
