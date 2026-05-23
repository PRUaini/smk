import { DEFAULT_TARGETS } from "../constants";
import type { Activity, DashboardTargets } from "../types";
import { getWeeksInMonth, getWeekDates } from "../utils/date";

const MEETING_TYPES = new Set(["Pertemuan", "Wawancara Penutupan"]);

export function calculateDashboardTargets(
  activities: Activity[],
  selectedMonth: number,
  customTargets?: Partial<
    Pick<
      DashboardTargets,
      | "targetPoints"
      | "targetMeetings"
      | "targetSales"
      | "targetWeeklyPoints"
      | "targetWeeklyMeetings"
      | "targetWeeklySales"
    >
  >
): DashboardTargets {
  const monthNumber = selectedMonth + 1;
  const currentYear = new Date().getFullYear();
  const monthlyActivities = activities.filter((activity) => {
    const parts = activity.tanggal.split("-");
    const yr = parseInt(parts[0], 10);
    const mo = parseInt(parts[1], 10);
    return yr === currentYear && mo === monthNumber;
  });
  const completedMonthlyActivities = monthlyActivities.filter(
    (activity) => activity.status === "Selesai"
  );

  const weeks = getWeeksInMonth(selectedMonth);
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  let currentWeekStart = weeks[0];
  let foundTodayWeek = false;
  for (const wStart of weeks) {
    const dates = getWeekDates(wStart);
    if (dates.includes(todayString)) {
      currentWeekStart = wStart;
      foundTodayWeek = true;
      break;
    }
  }

  if (!foundTodayWeek && completedMonthlyActivities.length > 0) {
    const sortedActs = [...completedMonthlyActivities].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    const firstActDate = sortedActs[0].tanggal;
    for (const wStart of weeks) {
      const dates = getWeekDates(wStart);
      if (dates.includes(firstActDate)) {
        currentWeekStart = wStart;
        break;
      }
    }
  }

  const currentWeekDates = currentWeekStart ? getWeekDates(currentWeekStart) : [];

  const weeklyActivities = activities.filter((activity) =>
    currentWeekDates.includes(activity.tanggal)
  );
  const completedWeeklyActivities = weeklyActivities.filter(
    (activity) => activity.status === "Selesai"
  );

  return {
    ...DEFAULT_TARGETS,
    ...customTargets,
    totalPoints: sumPoints(completedMonthlyActivities),
    totalMeetings: countMeetings(completedMonthlyActivities),
    totalSales: countSales(completedMonthlyActivities),
    activeDays: new Set(completedMonthlyActivities.map((activity) => activity.tanggal)).size,
    totalDays: getDaysInMonth(new Date().getFullYear(), selectedMonth),
    totalWeeklyPoints: sumPoints(completedWeeklyActivities),
    totalWeeklyMeetings: countMeetings(completedWeeklyActivities),
    totalWeeklySales: countSales(completedWeeklyActivities),
    totalApi: monthlyActivities
      .filter((activity) => activity.kegiatan === "Penjualan / Closing")
      .reduce((sum, activity) => sum + (activity.api || 0), 0),
    totalWeeklyApi: weeklyActivities
      .filter((activity) => activity.kegiatan === "Penjualan / Closing")
      .reduce((sum, activity) => sum + (activity.api || 0), 0),
  };
}

function sumPoints(activities: Activity[]) {
  return activities.reduce((sum, activity) => sum + activity.poin, 0);
}

function countMeetings(activities: Activity[]) {
  return activities.filter((activity) => MEETING_TYPES.has(activity.kegiatan)).length;
}

function countSales(activities: Activity[]) {
  return activities.filter((activity) => activity.kegiatan === "Penjualan / Closing").length;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

