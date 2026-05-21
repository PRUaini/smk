"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import { Activity } from "../types";
import { calculateDashboardTargets } from "../services/targets.service";
import { saveActivityAction, toggleActivityStatusAction, removeActivityAction } from "../actions";
import DashboardHeader from "./DashboardHeader";
import MonthTabs from "./MonthTabs";
import KPIGrid from "./KPIGrid";
import WeeklyCalendar from "./WeeklyCalendar";
import ActivitySidebar from "./ActivitySidebar";
import FooterSummary from "./FooterSummary";
import DashboardWidgetBoundary from "./DashboardWidgetBoundary";

interface DashboardContainerProps {
  initialKodeAgent: string;
  initialActivities: Activity[];
}

export default function DashboardContainer({ initialKodeAgent, initialActivities }: DashboardContainerProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"agenda" | "laporan">("agenda");

  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  const targets = useMemo(
    () => calculateDashboardTargets(activities, selectedMonth),
    [activities, selectedMonth]
  );

  const handleMonthChange = (monthIdx: number) => {
    setSelectedMonth(monthIdx);
    setIsSidebarOpen(false);
    setSelectedActivity(null);
  };

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedDate(null);
    setSelectedTime(null);
    setIsSidebarOpen(true);
  };

  const handleSelectTimeSlot = (dateStr: string, timeStr: string) => {
    setSelectedActivity(null);
    setSelectedDate(dateStr);
    setSelectedTime(timeStr);
    setIsSidebarOpen(true);
  };

  const handleToggleComplete = (id: string) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    setActivities((prev) =>
      prev.map((act) =>
        act.id === id
          ? { ...act, status: act.status === "Selesai" ? "Belum" : "Selesai" }
          : act
      )
    );

    startTransition(async () => {
      try {
        await toggleActivityStatusAction(id, activity.status);
      } catch (err) {
        setActivities((prev) =>
          prev.map((act) =>
            act.id === id ? { ...act, status: activity.status } : act
          )
        );
        alert("Gagal memperbarui status aktivitas");
      }
    });
  };

  const handleSaveActivity = (activityData: Omit<Activity, "id"> & { id?: string }) => {
    const isEdit = !!activityData.id;
    const tempId = activityData.id || `temp-${Date.now()}`;
    const prevActivities = [...activities];

    if (isEdit) {
      setActivities((prev) =>
        prev.map((act) => (act.id === activityData.id ? (activityData as Activity) : act))
      );
    } else {
      const newActivity: Activity = {
        ...activityData,
        id: tempId,
      };
      setActivities((prev) => [...prev, newActivity]);
    }
    setIsSidebarOpen(false);
    setSelectedActivity(null);

    startTransition(async () => {
      try {
        await saveActivityAction(activityData);
      } catch (err) {
        setActivities(prevActivities);
        alert("Gagal menyimpan aktivitas");
      }
    });
  };

  const handleDeleteActivity = (id: string) => {
    const prevActivities = [...activities];

    setActivities((prev) => prev.filter((act) => act.id !== id));
    setIsSidebarOpen(false);
    setSelectedActivity(null);

    startTransition(async () => {
      try {
        await removeActivityAction(id);
      } catch (err) {
        setActivities(prevActivities);
        alert("Gagal menghapus aktivitas");
      }
    });
  };

  const handleTabChange = (tab: "agenda" | "laporan") => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    setSelectedActivity(null);
  };

  return (
    <div className={`dashboard-layout-new ${isSidebarOpen ? "sidebar-expanded" : ""}`}>
      {/* Main Content Area */}
      <main className="dashboard-main-new">
        <DashboardHeader kodeAgent={initialKodeAgent} />

        {/* Luxury Segmented Tab Menu */}
        <div className="dashboard-tab-navigation">
          <div className="segmented-control">
            <button
              className={`segmented-tab ${activeTab === "agenda" ? "active" : ""}`}
              onClick={() => handleTabChange("agenda")}
            >
              <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Agenda Aktivitas</span>
            </button>
            <button
              className={`segmented-tab ${activeTab === "laporan" ? "active" : ""}`}
              onClick={() => handleTabChange("laporan")}
            >
              <svg className="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Laporan Aktivitas</span>
            </button>
          </div>
        </div>

        <MonthTabs selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />

        {activeTab === "agenda" ? (
          <DashboardWidgetBoundary label="Kalender mingguan">
            <WeeklyCalendar
              selectedMonth={selectedMonth}
              activities={activities}
              selectedActivityId={selectedActivity?.id || null}
              onSelectActivity={handleSelectActivity}
              onSelectTimeSlot={handleSelectTimeSlot}
              onToggleComplete={handleToggleComplete}
            />
          </DashboardWidgetBoundary>
        ) : (
          <>
            <DashboardWidgetBoundary label="Ringkasan KPI">
              <KPIGrid targets={targets} />
            </DashboardWidgetBoundary>

            <DashboardWidgetBoundary label="Ringkasan sasaran">
              <FooterSummary targets={targets} />
            </DashboardWidgetBoundary>
          </>
        )}
      </main>

      {isSidebarOpen && (
        <ActivitySidebar
          selectedActivity={selectedActivity}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSave={handleSaveActivity}
          onDelete={handleDeleteActivity}
          isPending={isPending}
          onClose={() => {
            setIsSidebarOpen(false);
            setSelectedActivity(null);
          }}
        />
      )}

      {activeTab === "agenda" && (
        <button
          className="fab-add-activity"
          onClick={() => {
            setSelectedActivity(null);
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
      )}
    </div>
  );
}
