import React from "react";
import { Activity, ActivityStatus } from "../types";

interface WeeklyCalendarProps {
  selectedMonth: number;
  activities: Activity[];
  selectedActivityId: string | null;
  onSelectActivity: (activity: Activity) => void;
  onSelectTimeSlot: (dayStr: string, timeStr: string) => void;
  onToggleComplete: (id: string) => void;
}

export default function WeeklyCalendar({
  selectedMonth,
  activities,
  selectedActivityId,
  onSelectActivity,
  onSelectTimeSlot,
  onToggleComplete,
}: WeeklyCalendarProps) {
  const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const [selectedWeek, setSelectedWeek] = React.useState(0);

  // Reset selected week when month changes
  React.useEffect(() => {
    setSelectedWeek(0);
  }, [selectedMonth]);

  const getWeeksInMonth = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const weeks: Date[] = [];
    
    let d = new Date(currentYear, selectedMonth, 1);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff); // First Monday of the month's first week

    while (true) {
      weeks.push(new Date(d));
      const nextMonday = new Date(d);
      nextMonday.setDate(nextMonday.getDate() + 7);
      
      // Stop if the next Monday is in the next month
      if (nextMonday.getFullYear() > currentYear || (nextMonday.getFullYear() === currentYear && nextMonday.getMonth() > selectedMonth)) {
        break;
      }
      d = nextMonday;
    }
    return weeks;
  };

  const weeks = getWeeksInMonth();

  // Helper: Get dates (Monday - Saturday) for the active week
  const getWeekDates = () => {
    // Make sure selectedWeek is within bounds (in case it hasn't reset yet)
    const weekIndex = Math.min(selectedWeek, weeks.length - 1);
    const startDate = weeks[weekIndex] || new Date();

    const weekDates = [];
    for (let i = 0; i < 6; i++) {
      const tempDate = new Date(startDate);
      tempDate.setDate(startDate.getDate() + i);
      weekDates.push({
        dayName: daysOfWeek[i],
        dayOfMonth: tempDate.getDate(),
        monthNum: tempDate.getMonth() + 1,
        formatted: `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}-${String(tempDate.getDate()).padStart(2, "0")}`,
        label: `${String(tempDate.getDate()).padStart(2, "0")}/${String(tempDate.getMonth() + 1).padStart(2, "0")}`,
      });
    }
    return weekDates;
  };

  const weekDates = getWeekDates();

  // Helper: Find activity for a given date and time slot
  const getActivityForSlot = (dateStr: string, timeStr: string) => {
    return activities.find(
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

  return (
    <div className="weekly-calendar-card">
      {/* Week Selector Tabs */}
      <div className="month-tabs-container" style={{ width: "fit-content", marginBottom: "1rem" }}>
        <div className="month-tabs-scroll">
          {weeks.map((_, index) => (
            <button
              key={index}
              className={`month-tab-btn ${selectedWeek === index ? "active" : ""}`}
              onClick={() => setSelectedWeek(index)}
            >
              Minggu {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="weekly-grid-container">
        {/* Grid Header */}
        <div className="calendar-grid-header">
          <div className="time-col-header" />
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
          {timeSlots.map((time) => (
            <div key={time} className="calendar-grid-row">
              {/* Time Label */}
              <div className="time-cell">{time}</div>

              {/* Day Cells */}
              {weekDates.map((d) => {
                const activity = getActivityForSlot(d.formatted, time);
                const isActiveDay = isToday(d.formatted);

                return (
                  <div
                    key={`${d.formatted}-${time}`}
                    className={`calendar-cell ${isActiveDay ? "active-day-col" : ""}`}
                    onClick={(e) => {
                      // Only trigger cell select if clicking empty space
                      if (e.target === e.currentTarget) {
                        onSelectTimeSlot(d.formatted, time);
                      }
                    }}
                  >
                    {activity ? (
                      <div
                        className={`activity-card-item ${
                          activity.status === "Selesai"
                            ? "border-green"
                            : activity.status === "Proses"
                            ? "border-orange"
                            : "border-gray"
                        } ${selectedActivityId === activity.id ? "selected-activity" : ""}`}
                        onClick={() => onSelectActivity(activity)}
                      >
                        <div className="activity-card-left">
                          <label className="checkbox-container" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={activity.status === "Selesai"}
                              onChange={() => onToggleComplete(activity.id)}
                            />
                            <span className="checkmark" />
                          </label>
                          <div className="activity-details">
                            <span className="activity-card-title">{activity.kegiatan}</span>
                            <span className="activity-card-desc">{activity.catatan}</span>
                          </div>
                        </div>
                        <div className="activity-card-right">
                          {activity.status === "Proses" && (
                            <span className="badge-proses">Proses</span>
                          )}
                          <span
                            className={`badge-point ${
                              activity.status === "Selesai" ? "point-green" : "point-gray"
                            }`}
                          >
                            {activity.poin} poin
                          </span>
                        </div>
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
          <div className="time-col-footer">Total Poin</div>
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
