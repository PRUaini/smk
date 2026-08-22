import React from "react";
import { Activity } from "../types";
import { DAYS_OF_WEEK, DEFAULT_DASHBOARD_START_TIME } from "../constants";
import { getWeekDates as getFormattedWeekDates, getDefaultWeekIndex, getWeeksInMonth } from "../utils/date";

interface WeeklyCalendarProps {
  selectedMonth: number;
  selectedYear?: number;
  activities: Activity[];
  selectedActivityId: string | null;
  onSelectActivity: (activity: Activity) => void;
  onSelectTimeSlot: (dayStr: string, timeStr: string) => void;
  onToggleComplete: (id: string) => void;
  autoFocusToday?: boolean;
  selectedWeekIndex?: number;
  onSelectWeek?: (index: number) => void;
}

const getActivityTypeClass = (kegiatan: string[]) => {
  const primary = kegiatan[0] || "";
  if (primary.includes("Chat")) return "act-type-pendekatan";
  if (primary.includes("Approach")) return "act-type-pertemuan";
  if (primary.includes("Follow Up")) return "act-type-pertemuan";
  if (primary.includes("Presentasi")) return "act-type-wawancara";
  if (primary.includes("Closing") || primary === "NPA") return "act-type-penjualan";
  if (primary.includes("Agen FLC")) return "act-type-penjualan";
  if (primary.includes("Coaching") || primary.includes("Meeting")) return "act-type-meeting";
  return "act-type-admin";
};

const formatKegiatanLabel = (kegiatan: string[]) => {
  if (kegiatan.length <= 2) return kegiatan.join(", ");
  return `${kegiatan[0]} +${kegiatan.length - 1}`;
};

const formatActivityTimeRange = (activity: Activity) => {
  return `${activity.waktu} - ${activity.waktuSelesai}`;
};

const compareActivityTime = (a: Activity, b: Activity) => {
  return a.waktu.localeCompare(b.waktu);
};

export default function WeeklyCalendar({
  selectedMonth,
  selectedYear = new Date().getFullYear(),
  activities,
  selectedActivityId,
  onSelectActivity,
  onSelectTimeSlot,
  onToggleComplete,
  autoFocusToday,
  selectedWeekIndex,
  onSelectWeek,
}: WeeklyCalendarProps) {
  const [internalWeekSelection, setInternalWeekSelection] = React.useState<{ month: number; year: number; week: number } | null>(null);
  const isWeekControlled = selectedWeekIndex !== undefined && onSelectWeek !== undefined;
  const weeks = React.useMemo(() => getWeeksInMonth(selectedMonth, selectedYear), [selectedMonth, selectedYear]);
  const defaultWeek = React.useMemo(
    () => getDefaultWeekIndex(weeks, selectedMonth, selectedYear, autoFocusToday),
    [selectedMonth, selectedYear, autoFocusToday, weeks]
  );
  const internalSelectedWeek = internalWeekSelection?.month === selectedMonth && internalWeekSelection.year === selectedYear ? internalWeekSelection.week : defaultWeek;
  const selectedWeek = isWeekControlled ? Math.min(selectedWeekIndex!, weeks.length - 1) : internalSelectedWeek;
  const handleWeekSelect = (index: number) => {
    if (isWeekControlled) {
      onSelectWeek!(index);
      return;
    }
    setInternalWeekSelection({ month: selectedMonth, year: selectedYear, week: index });
  };

  const weekDates = React.useMemo(() => {
    const weekIndex = Math.min(selectedWeek, weeks.length - 1);
    const startDate = weeks[weekIndex] || new Date();

    return getFormattedWeekDates(startDate).map((formatted, i) => {
      const tempDate = new Date(`${formatted}T00:00:00`);
      return {
        dayName: DAYS_OF_WEEK[i],
        dayOfMonth: tempDate.getDate(),
        monthNum: tempDate.getMonth() + 1,
        formatted,
        label: `${String(tempDate.getDate()).padStart(2, "0")}/${String(tempDate.getMonth() + 1).padStart(2, "0")}`,
      };
    });
  }, [selectedWeek, weeks]);
  const weeklyActivities = React.useMemo(
    () =>
      activities.filter((activity) =>
        weekDates.some((date) => date.formatted === activity.tanggal)
      ),
    [activities, weekDates]
  );

  const getDailyPoints = (dateStr: string) => {
    return activities
      .filter((act) => act.tanggal === dateStr && act.status === "Selesai")
      .reduce((sum, act) => sum + act.poin, 0);
  };

  const todayStr = React.useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }, []);

  const isToday = (dateStr: string) => dateStr === todayStr;

  const renderActivityCard = (activity: Activity) => {
    return (
      <div
        key={activity.id}
        role="button"
        tabIndex={0}
        aria-label={`${formatKegiatanLabel(activity.kegiatan)}, ${formatActivityTimeRange(activity)}`}
        className={`activity-card-item ${getActivityTypeClass(activity.kegiatan)} ${selectedActivityId === activity.id ? "selected-activity" : ""}`}
        onKeyDown={(e) => handleCardKeyDown(e, activity)}
        onClick={(e) => {
          e.stopPropagation();
          onSelectActivity(activity);
        }}
      >
        <div className="activity-card-top">
          <div className="activity-card-left-group">
            <label className="checkbox-container" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={activity.status === "Selesai"}
                onChange={() => onToggleComplete(activity.id)}
              />
              <span className="checkmark" />
            </label>
            <div className="activity-card-copy">
              <span className="activity-card-title">{formatKegiatanLabel(activity.kegiatan)}</span>
              <span className="activity-card-time">{formatActivityTimeRange(activity)}</span>
            </div>
          </div>
          
          <span
            className={`badge-point ${
              activity.status === "Selesai" ? "point-green" : "point-gray"
            }`}
          >
            {activity.poin} poin
          </span>
        </div>

        {(activity.nasabah || activity.kontakNasabah || activity.produk || activity.catatan) && (
          <div className="activity-card-meta-list">
            {activity.nasabah && (
              <div className="activity-card-meta-item">
                <span className="meta-label">Nasabah:</span>
                <span className="meta-value font-semibold">{activity.nasabah}</span>
              </div>
            )}
            {activity.kontakNasabah && (
              <div className="activity-card-meta-item">
                <span className="meta-label">Kontak:</span>
                <span className="meta-value">{activity.kontakNasabah}</span>
              </div>
            )}
            {activity.produk && (
              <div className="activity-card-meta-item">
                <span className="meta-label">Produk:</span>
                <span className="meta-value">{activity.produk}</span>
              </div>
            )}
            {activity.catatan && (
              <p className="activity-card-notes">&quot;{activity.catatan}&quot;</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleCardKeyDown = (event: React.KeyboardEvent, activity: Activity) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectActivity(activity);
    }
  };

  return (
    <div className="weekly-calendar-card">
      <div className="month-tabs-container week-tabs-container">
        <div className="month-tabs-scroll">
          {weeks.map((_, index) => (
            <button
              key={index}
              className={`month-tab-btn ${selectedWeek === index ? "active" : ""}`}
              aria-pressed={selectedWeek === index}
              onClick={() => handleWeekSelect(index)}
            >
              Minggu {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="weekly-grid-container">
        {weeklyActivities.length === 0 && (
          <div className="weekly-empty-state">
            <div className="weekly-empty-state-icon" aria-hidden="true">
              +
            </div>
            <div>
              <p className="weekly-empty-state-title">Belum ada aktivitas minggu ini</p>
              <p className="weekly-empty-state-description">
                Pilih slot waktu untuk menambahkan aktivitas baru.
              </p>
            </div>
          </div>
        )}

        <div className="calendar-grid-table">
          <div className="calendar-grid-header">
            {weekDates.map((d) => (
              <div
                key={d.formatted}
                className={`day-col-header ${isToday(d.formatted) ? "active-day" : ""}`}
              >
                <span className="day-name">{d.dayName}</span>
                <span className="day-date">{d.label}</span>
              </div>
            ))}
          </div>

          <div className="calendar-grid-body">
            <div className="calendar-grid-row">
              {weekDates.map((d) => {
                const dayActivities = weeklyActivities
                  .filter((act) => act.tanggal === d.formatted)
                  .sort(compareActivityTime);
                const isActiveDay = isToday(d.formatted);

                return (
                  <div
                    key={d.formatted}
                    className={`calendar-cell ${isActiveDay ? "active-day-col" : ""}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      alignItems: "stretch",
                      minHeight: "220px",
                      padding: "0.5rem",
                      gap: "0.5rem",
                    }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (!target.closest(".activity-card-item") && !target.closest(".empty-cell-hover-indicator")) {
                        onSelectTimeSlot(d.formatted, DEFAULT_DASHBOARD_START_TIME);
                      }
                    }}
                  >
                    {dayActivities.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                        {dayActivities.map((act) => renderActivityCard(act))}
                      </div>
                    )}

                    <div
                      role="button"
                      tabIndex={0}
                      className="empty-cell-hover-indicator"
                      aria-label={`Tambah aktivitas ${d.label}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectTimeSlot(d.formatted, DEFAULT_DASHBOARD_START_TIME);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTimeSlot(d.formatted, DEFAULT_DASHBOARD_START_TIME);
                      }}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        minHeight: "50px",
                      }}
                    >
                      + Tambah
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="calendar-grid-footer">
            {weekDates.map((d) => (
              <div
                key={`footer-${d.formatted}`}
                className={`footer-point-cell ${isToday(d.formatted) ? "active-day-col" : ""}`}
              >
                <span className="total-label">Total Poin</span>
                <span className="total-points-value">{getDailyPoints(d.formatted)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
