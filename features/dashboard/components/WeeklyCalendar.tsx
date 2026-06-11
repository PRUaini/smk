import React from "react";
import { Activity } from "../types";
import { DASHBOARD_TIME_SLOTS, DAYS_OF_WEEK } from "../constants";
import { getWeekDates as getFormattedWeekDates, getWeeksInMonth } from "../utils/date";

interface WeeklyCalendarProps {
  selectedMonth: number;
  selectedYear?: number;
  activities: Activity[];
  selectedActivityId: string | null;
  onSelectActivity: (activity: Activity) => void;
  onSelectTimeSlot: (dayStr: string, timeStr: string) => void;
  onToggleComplete: (id: string) => void;
  autoFocusToday?: boolean;
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

export default function WeeklyCalendar({
  selectedMonth,
  selectedYear = new Date().getFullYear(),
  activities,
  selectedActivityId,
  onSelectActivity,
  onSelectTimeSlot,
  onToggleComplete,
  autoFocusToday,
}: WeeklyCalendarProps) {
  const [weekSelection, setWeekSelection] = React.useState<{ month: number; year: number; week: number } | null>(null);
  const [expandedSlots, setExpandedSlots] = React.useState<Record<string, boolean>>({});
  const weeks = getWeeksInMonth(selectedMonth, selectedYear);
  const defaultWeek = React.useMemo(() => {
    if (autoFocusToday) {
      const today = new Date();
      if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth()) {
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < weeks.length; i++) {
          const start = new Date(weeks[i]);
          start.setHours(0, 0, 0, 0);
          const end = new Date(start);
          end.setDate(end.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          if (today >= start && today <= end) {
            return i;
          }
        }
      }
    }
    return 0;
  }, [selectedMonth, selectedYear, autoFocusToday, weeks]);
  const selectedWeek = weekSelection?.month === selectedMonth && weekSelection.year === selectedYear ? weekSelection.week : defaultWeek;

  // Helper: Get dates (Monday - Sunday) for the active week
  const getWeekDates = () => {
    // Make sure selectedWeek is within bounds (in case it hasn't reset yet)
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
  };

  const weekDates = getWeekDates();
  const weeklyActivities = activities.filter((activity) =>
    weekDates.some((date) => date.formatted === activity.tanggal)
  );
  // Helper: Find activities for a given date and time slot
  const getActivitiesForSlot = (dateStr: string, timeStr: string) => {
    return activities.filter(
      (act) => act.tanggal === dateStr && act.waktu === timeStr
    );
  };

  // Helper: Calculate total points for each day of the current week
  const getDailyPoints = (dateStr: string) => {
    return activities
      .filter((act) => act.tanggal === dateStr && act.status === "Selesai")
      .reduce((sum, act) => sum + act.poin, 0);
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return dateStr === formattedToday;
  };

  const renderActivityCard = (activity: Activity) => {
    return (
      <div
        key={activity.id}
        className={`activity-card-item ${getActivityTypeClass(activity.kegiatan)} ${selectedActivityId === activity.id ? "selected-activity" : ""}`}
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
              <span className="activity-card-time">{activity.waktu}</span>
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

        {activity.status === "Proses" && (
          <div className="activity-card-footer">
            <span className="badge-proses">Proses</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="weekly-calendar-card">
      {/* Week Selector Tabs */}
      <div className="month-tabs-container week-tabs-container">
        <div className="month-tabs-scroll">
          {weeks.map((_, index) => (
            <button
              key={index}
              className={`month-tab-btn ${selectedWeek === index ? "active" : ""}`}
              onClick={() => setWeekSelection({ month: selectedMonth, year: selectedYear, week: index })}
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

        {/* Grid Header */}
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

        {/* Time Grid Rows */}
        <div className="calendar-grid-body">
          {DASHBOARD_TIME_SLOTS.map((time) => (
            <div key={time} className="calendar-grid-row">
              {/* Day Cells */}
              {weekDates.map((d) => {
                const slotActivities = getActivitiesForSlot(d.formatted, time);
                const isActiveDay = isToday(d.formatted);
                const slotKey = `${d.formatted}-${time}`;

                return (
                  <div
                    key={slotKey}
                    className={`calendar-cell ${isActiveDay ? "active-day-col" : ""}`}
                    onClick={(e) => {
                      // Only trigger cell select if clicking empty space
                      const target = e.target as HTMLElement;
                      if (!target.closest(".activity-card-item") && !target.closest(".more-activities-toggle")) {
                        onSelectTimeSlot(d.formatted, time);
                      }
                    }}
                  >
                    {slotActivities.length > 0 ? (
                      <div className="slot-activities-container" style={{ display: "flex", flexDirection: "column", gap: "0.375rem", width: "100%" }}>
                        {renderActivityCard(slotActivities[0])}

                        {slotActivities.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="more-activities-toggle"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedSlots((prev) => ({
                                  ...prev,
                                  [slotKey]: !prev[slotKey],
                                }));
                              }}
                            >
                              <span>
                                {expandedSlots[slotKey]
                                  ? "Sembunyikan"
                                  : `+${slotActivities.length - 1} aktivitas lagi`}
                              </span>
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                style={{
                                  transform: expandedSlots[slotKey] ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.2s ease",
                                }}
                              >
                                <path d="M6 9l6 6 6-6" />
                              </svg>
                            </button>

                            {expandedSlots[slotKey] && (
                              <div className="expanded-activities-list" style={{ display: "flex", flexDirection: "column", gap: "0.375rem", width: "100%" }}>
                                {slotActivities.slice(1).map((act) => renderActivityCard(act))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="empty-cell-hover-indicator">+ Tambah</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Grid Footer (Daily Point Totals) */}
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
  );
}
