"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Activity, ActivityType, ActivityStatus, DashboardTargets } from "../types";
import DashboardHeader from "./DashboardHeader";
import MonthTabs from "./MonthTabs";
import KPIGrid from "./KPIGrid";
import WeeklyCalendar from "./WeeklyCalendar";
import ActivitySidebar from "./ActivitySidebar";
import FooterSummary from "./FooterSummary";

interface DashboardContainerProps {
  initialKodeAgent: string;
}

// Initial seed data based on reference image
const SEED_ACTIVITIES: Activity[] = [
  // Senin, 06 Januari 2024
  {
    id: "act-1",
    tanggal: "2024-01-06",
    waktu: "08:00",
    kegiatan: "Pendekatan",
    poin: 1,
    status: "Selesai",
    catatan: "Melakukan pendekatan dengan calon nasabah",
    nasabah: "",
  },
  {
    id: "act-2",
    tanggal: "2024-01-06",
    waktu: "09:00",
    kegiatan: "Pertemuan",
    poin: 2,
    status: "Selesai",
    catatan: "Melakukan pertemuan / janji dengan nasabah",
    nasabah: "Bapak Andi",
  },
  {
    id: "act-3",
    tanggal: "2024-01-06",
    waktu: "10:00",
    kegiatan: "Pencarian Fakta",
    poin: 2,
    status: "Selesai",
    catatan: "Menggali kebutuhan dan potensi nasabah",
    nasabah: "",
  },
  {
    id: "act-4",
    tanggal: "2024-01-06",
    waktu: "11:00",
    kegiatan: "Mendapatkan 3 Referensi",
    poin: 4,
    status: "Selesai",
    catatan: "Meminta referensi dari nasabah atau kontak terkait",
    nasabah: "",
  },
  {
    id: "act-5",
    tanggal: "2024-01-06",
    waktu: "13:00",
    kegiatan: "Wawancara Penutupan",
    poin: 4,
    status: "Belum",
    catatan: "Melakukan wawancara penutupan",
    nasabah: "",
  },
  {
    id: "act-6",
    tanggal: "2024-01-06",
    waktu: "14:00",
    kegiatan: "Penjualan",
    poin: 1,
    status: "Belum",
    catatan: "Melakukan penjualan / presentasi produk",
    nasabah: "",
  },
  {
    id: "act-7",
    tanggal: "2024-01-06",
    waktu: "15:00",
    kegiatan: "Penyerahan Polis/Layanan",
    poin: 1,
    status: "Belum",
    catatan: "Menyerahkan polis / layanan kepada nasabah",
    nasabah: "",
  },

  // Selasa, 07 Januari 2024
  {
    id: "act-8",
    tanggal: "2024-01-07",
    waktu: "08:00",
    kegiatan: "Pendekatan",
    poin: 1,
    status: "Selesai",
    catatan: "Melakukan pendekatan dengan calon nasabah",
    nasabah: "",
  },
  {
    id: "act-9",
    tanggal: "2024-01-07",
    waktu: "09:00",
    kegiatan: "Pertemuan",
    poin: 2,
    status: "Selesai",
    catatan: "Melakukan pertemuan / janji dengan nasabah",
    nasabah: "",
  },
  {
    id: "act-10",
    tanggal: "2024-01-07",
    waktu: "10:00",
    kegiatan: "Pencarian Fakta",
    poin: 2,
    status: "Belum",
    catatan: "Menggali kebutuhan dan potensi nasabah",
    nasabah: "",
  },
  {
    id: "act-11",
    tanggal: "2024-01-07",
    waktu: "11:00",
    kegiatan: "Mendapatkan 3 Referensi",
    poin: 4,
    status: "Belum",
    catatan: "Meminta referensi dari nasabah atau kontak terkait",
    nasabah: "",
  },

  // Rabu, 08 Januari 2024 (Active Column in references)
  {
    id: "act-12",
    tanggal: "2024-01-08",
    waktu: "08:00",
    kegiatan: "Pendekatan",
    poin: 1,
    status: "Selesai",
    catatan: "Melakukan pendekatan dengan calon nasabah",
    nasabah: "",
  },
  {
    id: "act-13",
    tanggal: "2024-01-08",
    waktu: "09:00",
    kegiatan: "Pertemuan",
    poin: 2,
    status: "Belum",
    catatan: "Melakukan pertemuan / janji dengan nasabah",
    nasabah: "",
  },
  {
    id: "act-14",
    tanggal: "2024-01-08",
    waktu: "10:00",
    kegiatan: "Pencarian Fakta",
    poin: 2,
    status: "Selesai",
    catatan: "Menggali kebutuhan dan potensi nasabah",
    nasabah: "",
  },
  {
    id: "act-15",
    tanggal: "2024-01-08",
    waktu: "11:00",
    kegiatan: "Mendapatkan 3 Referensi",
    poin: 4,
    status: "Belum",
    catatan: "Meminta referensi dari nasabah atau kontak terkait",
    nasabah: "",
  },
  {
    id: "act-16",
    tanggal: "2024-01-08",
    waktu: "13:00",
    kegiatan: "Wawancara Penutupan",
    poin: 4,
    status: "Proses",
    catatan: "Wawancara Penutupan",
    nasabah: "",
  },
];

export default function DashboardContainer({ initialKodeAgent }: DashboardContainerProps) {
  const [activities, setActivities] = useState<Activity[]>(SEED_ACTIVITIES);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = Januari
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Take over the layout styling to prevent double-headers and double-padding
  useEffect(() => {
    const globalHeader = document.getElementById("dashboard-header");
    if (globalHeader) globalHeader.style.display = "none";

    const sidebar = document.querySelector(".sidebar") as HTMLElement;
    if (sidebar) sidebar.style.display = "none";

    const dashboardMain = document.querySelector(".dashboard-main") as HTMLElement;
    if (dashboardMain) dashboardMain.style.marginLeft = "0";

    const mainContent = document.querySelector(".dashboard-content") as HTMLElement;
    if (mainContent) {
      mainContent.style.padding = "0";
      mainContent.style.backgroundColor = "#f8fafc";
    }

    return () => {
      if (globalHeader) globalHeader.style.display = "";
      if (sidebar) sidebar.style.display = "";
      if (dashboardMain) dashboardMain.style.marginLeft = "";
      if (mainContent) {
        mainContent.style.padding = "";
        mainContent.style.backgroundColor = "";
      }
    };
  }, []);

  // Targets structure with weekly breakdown
  const targets: DashboardTargets = useMemo(() => {
    // 1. Total Points for the selected month (Selesai only)
    const activeMonthStr = `-${String(selectedMonth + 1).padStart(2, "0")}-`;
    const monthlyActs = activities.filter((act) => act.tanggal.includes(activeMonthStr));
    const completedMonthlyActs = monthlyActs.filter((act) => act.status === "Selesai");

    const totalPoints = completedMonthlyActs.reduce((sum, act) => sum + act.poin, 0);

    // 2. Count meetings (Pertemuan + Wawancara Penutupan)
    const totalMeetings = completedMonthlyActs.filter(
      (act) => act.kegiatan === "Pertemuan" || act.kegiatan === "Wawancara Penutupan"
    ).length;

    // 3. Count sales (Penjualan)
    const totalSales = completedMonthlyActs.filter((act) => act.kegiatan === "Penjualan").length;

    // 4. Calculate unique active days in this month
    const activeDaysSet = new Set(completedMonthlyActs.map((act) => act.tanggal));
    const activeDays = activeDaysSet.size;

    // 5. Weekly stats calculation (for the week currently loaded/displayed)
    // For mock calculation, we'll calculate it using the first week of that month's dates
    // In real system, we filter by dates of the visible week.
    const weeklyActs = activities.filter((act) => {
      // Find matches for the week dates of interest (e.g. week 1 of selected month)
      // To keep it simple, let's grab the first week dates and check if this act falls inside
      const dayNum = parseInt(act.tanggal.split("-")[2]);
      return act.tanggal.includes(activeMonthStr) && dayNum >= 1 && dayNum <= 12;
    });
    const completedWeeklyActs = weeklyActs.filter((act) => act.status === "Selesai");

    const totalWeeklyPoints = completedWeeklyActs.reduce((sum, act) => sum + act.poin, 0);
    const totalWeeklyMeetings = completedWeeklyActs.filter(
      (act) => act.kegiatan === "Pertemuan" || act.kegiatan === "Wawancara Penutupan"
    ).length;
    const totalWeeklySales = completedWeeklyActs.filter((act) => act.kegiatan === "Penjualan").length;

    return {
      targetPoints: 500,
      totalPoints,
      targetMeetings: 40,
      totalMeetings,
      targetSales: 25,
      totalSales,
      activeDays,
      totalDays: 31, // Default monthly length

      // Weekly Targets
      targetWeeklyPoints: 125,
      totalWeeklyPoints,
      targetWeeklyMeetings: 10,
      totalWeeklyMeetings,
      targetWeeklySales: 6,
      totalWeeklySales,
    };
  }, [activities, selectedMonth]);

  // Handle month selection
  const handleMonthChange = (monthIdx: number) => {
    setSelectedMonth(monthIdx);
    setIsSidebarOpen(false);
    setSelectedActivity(null);
  };

  // Select activity to edit
  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedDate(null);
    setSelectedTime(null);
    setIsSidebarOpen(true);
  };

  // Select time cell to create new activity
  const handleSelectTimeSlot = (dateStr: string, timeStr: string) => {
    setSelectedActivity(null);
    setSelectedDate(dateStr);
    setSelectedTime(timeStr);
    setIsSidebarOpen(true);
  };

  // Toggle complete state directly on calendar card checkmark click
  const handleToggleComplete = (id: string) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === id
          ? { ...act, status: act.status === "Selesai" ? "Belum" : "Selesai" }
          : act
      )
    );
  };

  // Save new or edited activity
  const handleSaveActivity = (activityData: Omit<Activity, "id"> & { id?: string }) => {
    if (activityData.id) {
      // Edit
      setActivities((prev) =>
        prev.map((act) => (act.id === activityData.id ? (activityData as Activity) : act))
      );
    } else {
      // Create new
      const newActivity: Activity = {
        ...activityData,
        id: `act-${Date.now()}`,
      };
      setActivities((prev) => [...prev, newActivity]);
    }
    setIsSidebarOpen(false);
    setSelectedActivity(null);
  };

  // Delete activity
  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((act) => act.id !== id));
    setIsSidebarOpen(false);
    setSelectedActivity(null);
  };

  return (
    <div className={`dashboard-layout-new ${isSidebarOpen ? "sidebar-expanded" : ""}`}>
      {/* Main Content Area */}
      <main className="dashboard-main-new">
        <DashboardHeader kodeAgent={initialKodeAgent} />

        <MonthTabs selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />

        <KPIGrid targets={targets} />

        <WeeklyCalendar
          selectedMonth={selectedMonth}
          activities={activities}
          selectedActivityId={selectedActivity?.id || null}
          onSelectActivity={handleSelectActivity}
          onSelectTimeSlot={handleSelectTimeSlot}
          onToggleComplete={handleToggleComplete}
        />

        <FooterSummary targets={targets} />
      </main>

      {/* Slide-over or Fixed Sidebar */}
      {isSidebarOpen && (
        <ActivitySidebar
          selectedActivity={selectedActivity}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSave={handleSaveActivity}
          onDelete={handleDeleteActivity}
          onClose={() => {
            setIsSidebarOpen(false);
            setSelectedActivity(null);
          }}
        />
      )}

      {/* Floating Action Button (FAB) */}
      <button
        className="fab-add-activity"
        onClick={() => {
          setSelectedActivity(null);
          // Default to today's date formatted
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
          setSelectedDate(todayStr);
          setSelectedTime("08:00");
          setIsSidebarOpen(true);
        }}
        aria-label="Add Activity"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
