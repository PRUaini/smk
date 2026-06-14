"use client";

import React, { useState, useMemo, useTransition, useEffect, useRef } from "react";
import { Activity } from "../types";
import { calculateDashboardTargets } from "../services/targets.service";
import { saveActivityAction, toggleActivityStatusAction, removeActivityAction, saveAgentTargetsAction } from "../actions";
import DashboardHeader from "./DashboardHeader";
import MonthTabs from "./MonthTabs";
import WeeklyCalendar from "./WeeklyCalendar";
import ActivitySidebar from "./ActivitySidebar";
import LaporanAktivitas from "./LaporanAktivitas";
import DashboardWidgetBoundary from "./DashboardWidgetBoundary";
import type { AgentTargets } from "../data/targets.repository";
import TargetsSidebar from "./TargetsSidebar";
import { Toast, useToast } from "../utils/useToast";
import ToastContainer from "./ToastContainer";
import NotificationMenu from "./NotificationMenu";
import DashboardSettingsMenu from "./DashboardSettingsMenu";
import { buildActivityNotifications } from "../services/notifications.service";
import { DEFAULT_DASHBOARD_START_TIME } from "../constants";
const SIDEBAR_TRANSITION_MS = 250;
const REMINDER_TOAST_PREFIX = "reminder-";

interface DashboardContainerProps {
  initialKodeAgent: string;
  initialActivities: Activity[];
  initialTargets?: AgentTargets | null;
  initialWallpaperUrl?: string | null;
}

export default function DashboardContainer({
  initialKodeAgent,
  initialActivities,
  initialTargets,
  initialWallpaperUrl = null,
}: DashboardContainerProps) {
  const { toasts, showToast, dismissToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [targetsData, setTargetsData] = useState<AgentTargets | null>(initialTargets ?? null);
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(initialWallpaperUrl);
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
  const [autoFocusToday, setAutoFocusToday] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTargetsSidebarOpen, setIsTargetsSidebarOpen] = useState(false);
  const [isSidebarClosing, setIsSidebarClosing] = useState(false);
  const [isTargetsSidebarClosing, setIsTargetsSidebarClosing] = useState(false);
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(
    () => new Set()
  );
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"agenda" | "laporan">("agenda");
  const sidebarCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetsSidebarCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tempActivityIdCounter = useRef(0);

  const clearSidebarCloseTimer = () => {
    if (sidebarCloseTimer.current) {
      clearTimeout(sidebarCloseTimer.current);
      sidebarCloseTimer.current = null;
    }
  };

  const clearTargetsSidebarCloseTimer = () => {
    if (targetsSidebarCloseTimer.current) {
      clearTimeout(targetsSidebarCloseTimer.current);
      targetsSidebarCloseTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearSidebarCloseTimer();
      clearTargetsSidebarCloseTimer();
    };
  }, []);

  const openActivitySidebar = () => {
    clearSidebarCloseTimer();
    setIsSidebarClosing(false);
    setIsSidebarOpen(true);
  };

  const closeActivitySidebar = () => {
    clearSidebarCloseTimer();
    if (!isSidebarOpen) {
      setSelectedActivity(null);
      setIsSidebarClosing(false);
      return;
    }
    setIsSidebarOpen(false);
    setIsSidebarClosing(true);
    sidebarCloseTimer.current = setTimeout(() => {
      setIsSidebarClosing(false);
      setSelectedActivity(null);
      sidebarCloseTimer.current = null;
    }, SIDEBAR_TRANSITION_MS);
  };

  const openTargetsSidebar = () => {
    clearTargetsSidebarCloseTimer();
    setIsTargetsSidebarClosing(false);
    setIsTargetsSidebarOpen(true);
  };

  const closeTargetsSidebar = () => {
    clearTargetsSidebarCloseTimer();
    if (!isTargetsSidebarOpen) {
      setIsTargetsSidebarClosing(false);
      return;
    }
    setIsTargetsSidebarOpen(false);
    setIsTargetsSidebarClosing(true);
    targetsSidebarCloseTimer.current = setTimeout(() => {
      setIsTargetsSidebarClosing(false);
      targetsSidebarCloseTimer.current = null;
    }, SIDEBAR_TRANSITION_MS);
  };

  const targets = useMemo(() => {
    const customTargets = targetsData ? {
      targetPoints: targetsData.targetPoints,
      targetMeetings: targetsData.targetMeetings,
      targetSales: targetsData.targetSales,
      targetWeeklyPoints: targetsData.targetWeeklyPoints,
      targetWeeklyMeetings: targetsData.targetWeeklyMeetings,
      targetWeeklySales: targetsData.targetWeeklySales,
    } : undefined;
    return calculateDashboardTargets(activities, selectedMonth, customTargets, selectedYear);
  }, [activities, selectedMonth, selectedYear, targetsData]);

  const allNotifications = useMemo(
    () => buildActivityNotifications(activities),
    [activities]
  );

  const notifications = useMemo(
    () => allNotifications.filter((notification) => !readNotificationIds.has(notification.id)),
    [allNotifications, readNotificationIds]
  );

  const reminderToasts = useMemo<Toast[]>(
    () =>
      notifications.map((notification) => ({
        id: `${REMINDER_TOAST_PREFIX}${notification.id}`,
        message: `Pengingat: ${notification.statusLabel} - ${notification.title} (${notification.description})`,
        type: "info",
      })),
    [notifications]
  );

  const visibleToasts = useMemo(
    () => [...reminderToasts, ...toasts],
    [reminderToasts, toasts]
  );

  const availableYears = useMemo(() => {
    const years = new Set<number>([new Date().getFullYear(), selectedYear]);
    activities.forEach((activity) => {
      const year = Number(activity.tanggal.split("-")[0]);
      if (!Number.isNaN(year)) {
        years.add(year);
      }
    });
    return [...years].sort((a, b) => b - a);
  }, [activities, selectedYear]);

  const handleMonthChange = (monthIdx: number) => {
    setAutoFocusToday(false);
    setSelectedMonth(monthIdx);
    closeActivitySidebar();
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setAutoFocusToday(false);
    setIsYearMenuOpen(false);
    closeActivitySidebar();
  };

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedDate(null);
    setSelectedTime(null);
    openActivitySidebar();
  };

  const handleSelectNotification = (activityId: string) => {
    const activity = activities.find((item) => item.id === activityId);
    if (!activity) return;

    const notification = allNotifications.find((item) => item.activityId === activityId);
    if (notification) {
      markNotificationRead(notification.id);
    }

    closeTargetsSidebar();
    handleSelectActivity(activity);
  };

  const markNotificationRead = (notificationId: string) => {
    setReadNotificationIds((current) => {
      if (current.has(notificationId)) return current;

      const next = new Set(current);
      next.add(notificationId);
      return next;
    });
  };

  const handleMarkAllNotificationsRead = () => {
    setReadNotificationIds((current) => {
      const next = new Set(current);
      allNotifications.forEach((notification) => next.add(notification.id));
      return next;
    });
  };

  const handleDismissToast = (id: string) => {
    if (id.startsWith(REMINDER_TOAST_PREFIX)) {
      markNotificationRead(id.slice(REMINDER_TOAST_PREFIX.length));
      return;
    }

    dismissToast(id);
  };

  const handleSelectTimeSlot = (dateStr: string, timeStr: string) => {
    setSelectedActivity(null);
    setSelectedDate(dateStr);
    setSelectedTime(timeStr);
    openActivitySidebar();
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
        showToast("Status aktivitas berhasil diperbarui", "success");
      } catch {
        setActivities((prev) =>
          prev.map((act) =>
            act.id === id ? { ...act, status: activity.status } : act
          )
        );
        showToast("Gagal memperbarui status aktivitas", "error");
      }
    });
  };

  const handleSaveActivity = (activityData: Omit<Activity, "id"> & { id?: string }) => {
    const isEdit = !!activityData.id;
    tempActivityIdCounter.current += 1;
    const tempId = activityData.id || `temp-${tempActivityIdCounter.current}`;
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
    closeActivitySidebar();

    startTransition(async () => {
      try {
        const savedActivity = await saveActivityAction(activityData);
        setActivities((prev) =>
          prev.map((act) => (act.id === tempId ? savedActivity : act))
        );
        showToast("Aktivitas berhasil disimpan", "success");
      } catch {
        setActivities(prevActivities);
        showToast("Gagal menyimpan aktivitas", "error");
      }
    });
  };

  const handleDeleteActivity = (id: string) => {
    showToast("Apakah Anda yakin ingin menghapus aktivitas ini?", "confirm", {
      onConfirm: () => {
        const prevActivities = [...activities];

        setActivities((prev) => prev.filter((act) => act.id !== id));
        closeActivitySidebar();

        startTransition(async () => {
          try {
            await removeActivityAction(id);
            showToast("Aktivitas berhasil dihapus", "success");
          } catch {
            setActivities(prevActivities);
            showToast("Gagal menghapus aktivitas", "error");
          }
        });
      }
    });
  };

  const handleSaveTargets = (newTargets: Omit<AgentTargets, "kodeAgent">) => {
    startTransition(async () => {
      try {
        const saved = await saveAgentTargetsAction(newTargets);
        setTargetsData(saved);
        closeTargetsSidebar();
        showToast("Target agen berhasil disimpan", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Gagal menyimpan target", "error");
      }
    });
  };

  const handleTabChange = (tab: "agenda" | "laporan") => {
    setActiveTab(tab);
    closeActivitySidebar();
    closeTargetsSidebar();
  };

  const wallpaperStyle = wallpaperUrl
    ? ({
        "--dashboard-wallpaper-url": `url("${wallpaperUrl.replaceAll("\"", "\\\"")}")`,
      } as React.CSSProperties & Record<string, string>)
    : undefined;

  return (
    <div
      className={`dashboard-layout-new ${wallpaperUrl ? "has-wallpaper" : ""} ${isSidebarOpen ? "sidebar-expanded" : ""}`}
      style={wallpaperStyle}
    >
      {/* Main Content Area */}
      <main className="dashboard-main-new">
        <DashboardHeader kodeAgent={initialKodeAgent} />

        {/* Tab Selection Row (Segmented tab + Actions) */}
        <div className="dashboard-tab-row">
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

          <div className="dashboard-tab-actions">
            <div className="chart-filter-select-wrapper">
              <button
                type="button"
                className="report-dropdown-selector"
                aria-haspopup="listbox"
                aria-expanded={isYearMenuOpen}
                aria-label={`Pilih tahun ${selectedYear}`}
                onClick={() => setIsYearMenuOpen((isOpen) => !isOpen)}
              >
                <svg className="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>
                  {selectedYear}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {isYearMenuOpen && (
                <div className="filter-dropdown-menu" role="listbox" aria-label="Tahun">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      role="option"
                      aria-selected={selectedYear === year}
                      className={`filter-option ${selectedYear === year ? "active" : ""}`}
                      onClick={() => handleYearChange(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {activeTab === "laporan" && (
              <button className="edit-targets-trigger-btn" onClick={openTargetsSidebar}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Edit Target</span>
              </button>
            )}
          </div>
        </div>

        <MonthTabs selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />

        {activeTab === "agenda" ? (
          <DashboardWidgetBoundary label="Kalender mingguan">
            <WeeklyCalendar
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              activities={activities}
              selectedActivityId={selectedActivity?.id || null}
              onSelectActivity={handleSelectActivity}
              onSelectTimeSlot={handleSelectTimeSlot}
              onToggleComplete={handleToggleComplete}
              autoFocusToday={autoFocusToday}
            />
          </DashboardWidgetBoundary>
        ) : (
          <LaporanAktivitas targets={targets} activities={activities} selectedMonth={selectedMonth} selectedYear={selectedYear} />
        )}
      </main>

      {(isSidebarOpen || isSidebarClosing) && (
        <ActivitySidebar
          selectedActivity={selectedActivity}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSave={handleSaveActivity}
          onDelete={handleDeleteActivity}
          isPending={isPending}
          onClose={closeActivitySidebar}
          className={isSidebarClosing ? "closing" : "opening"}
        />
      )}

      {(isTargetsSidebarOpen || isTargetsSidebarClosing) && (
        <TargetsSidebar
          initialTargets={targetsData}
          onSave={handleSaveTargets}
          isPending={isPending}
          onClose={closeTargetsSidebar}
          className={isTargetsSidebarClosing ? "closing" : "opening"}
        />
      )}

      <div className="floating-action-stack">
        <NotificationMenu
          notifications={notifications}
          onSelectNotification={handleSelectNotification}
          onMarkAllRead={handleMarkAllNotificationsRead}
        />

        {activeTab === "agenda" && (
          <button
            className="fab-add-activity"
            onClick={() => {
              setSelectedActivity(null);
              const today = new Date();
              const isCurrentPeriod = selectedYear === today.getFullYear() && selectedMonth === today.getMonth();
              const selectedDateForPeriod = isCurrentPeriod ? today : new Date(selectedYear, selectedMonth, 1);
              const todayStr = `${selectedDateForPeriod.getFullYear()}-${String(selectedDateForPeriod.getMonth() + 1).padStart(2, "0")}-${String(selectedDateForPeriod.getDate()).padStart(2, "0")}`;
              setSelectedDate(todayStr);
              setSelectedTime(DEFAULT_DASHBOARD_START_TIME);
              openActivitySidebar();
            }}
            aria-label="Add Activity"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <DashboardSettingsMenu
          initialWallpaperUrl={wallpaperUrl}
          onWallpaperChange={setWallpaperUrl}
          onToast={showToast}
        />
      </div>

      <ToastContainer toasts={visibleToasts} onDismiss={handleDismissToast} />
    </div>
  );
}
