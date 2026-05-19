import { DEFAULT_TARGETS } from "../constants";
import type { Activity, DashboardTargets } from "../types";

const MEETING_TYPES = new Set(["Pertemuan", "Wawancara Penutupan"]);

export function calculateDashboardTargets(
  activities: Activity[],
  selectedMonth: number
): DashboardTargets {
  const monthNumber = selectedMonth + 1;
  const monthlyActivities = activities.filter((activity) => {
    const activityDate = new Date(`${activity.tanggal}T00:00:00`);
    return activityDate.getMonth() + 1 === monthNumber;
  });
  const completedMonthlyActivities = monthlyActivities.filter(
    (activity) => activity.status === "Selesai"
  );

  const weeklyActivities = activities.filter((activity) => {
    const activityDate = new Date(`${activity.tanggal}T00:00:00`);
    const dayOfMonth = activityDate.getDate();
    return activityDate.getMonth() + 1 === monthNumber && dayOfMonth >= 1 && dayOfMonth <= 12;
  });
  const completedWeeklyActivities = weeklyActivities.filter(
    (activity) => activity.status === "Selesai"
  );

  return {
    ...DEFAULT_TARGETS,
    totalPoints: sumPoints(completedMonthlyActivities),
    totalMeetings: countMeetings(completedMonthlyActivities),
    totalSales: countSales(completedMonthlyActivities),
    activeDays: new Set(completedMonthlyActivities.map((activity) => activity.tanggal)).size,
    totalDays: getDaysInMonth(new Date().getFullYear(), selectedMonth),
    totalWeeklyPoints: sumPoints(completedWeeklyActivities),
    totalWeeklyMeetings: countMeetings(completedWeeklyActivities),
    totalWeeklySales: countSales(completedWeeklyActivities),
  };
}

function sumPoints(activities: Activity[]) {
  return activities.reduce((sum, activity) => sum + activity.poin, 0);
}

function countMeetings(activities: Activity[]) {
  return activities.filter((activity) => MEETING_TYPES.has(activity.kegiatan)).length;
}

function countSales(activities: Activity[]) {
  return activities.filter((activity) => activity.kegiatan === "Penjualan").length;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
