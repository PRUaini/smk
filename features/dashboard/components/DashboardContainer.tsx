"use client";

import React, { useState, useMemo } from "react";
import { Activity } from "../types";
import { getSeedActivities } from "../data/activities.repository";
import { calculateDashboardTargets } from "../services/targets.service";
import DashboardHeader from "./DashboardHeader";
import MonthTabs from "./MonthTabs";
import KPIGrid from "./KPIGrid";
import WeeklyCalendar from "./WeeklyCalendar";
import ActivitySidebar from "./ActivitySidebar";
import FooterSummary from "./FooterSummary";
import DashboardWidgetBoundary from "./DashboardWidgetBoundary";

interface DashboardContainerProps {
  initialKodeAgent: string;
}

export default function DashboardContainer({ initialKodeAgent }: DashboardContainerProps) {
  const [activities, setActivities] = useState<Activity[]>(() => getSeedActivities());
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    setActivities((prev) =>
      prev.map((act) =>
        act.id === id
          ? { ...act, status: act.status === "Selesai" ? "Belum" : "Selesai" }
          : act
      )
    );
  };

  const handleSaveActivity = (activityData: Omit<Activity, "id"> & { id?: string }) => {
    if (activityData.id) {
      setActivities((prev) =>
        prev.map((act) => (act.id === activityData.id ? (activityData as Activity) : act))
      );
    } else {
      const newActivity: Activity = {
        ...activityData,
        id: `act-${Date.now()}`,
      };
      setActivities((prev) => [...prev, newActivity]);
    }
    setIsSidebarOpen(false);
    setSelectedActivity(null);
  };

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

        <DashboardWidgetBoundary label="Ringkasan KPI">
          <KPIGrid targets={targets} />
        </DashboardWidgetBoundary>

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

        <DashboardWidgetBoundary label="Ringkasan sasaran">
          <FooterSummary targets={targets} />
        </DashboardWidgetBoundary>
      </main>

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
    </div>
  );
}
