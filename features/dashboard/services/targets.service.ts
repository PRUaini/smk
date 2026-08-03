import { CLOSING_TYPES, DEFAULT_TARGETS, MEETING_TYPES } from "../constants";
import type { Activity, DashboardTargets } from "../types";
import { getWeeksInMonth, getWeekDates } from "../utils/date";

function parseYearMonth(dateStr: string) {
  const parts = dateStr.split("-");
  return {
    yr: parseInt(parts[0], 10),
    mo: parseInt(parts[1], 10),
  };
}

export function calculateDashboardTargets(
  activities: Activity[],
  selectedMonth: number,
  customTargets?: Partial<
    Pick<
      DashboardTargets,
      | "targetPoints"
      | "targetMeetings"
      | "targetWeeklyPoints"
      | "targetWeeklyMeetings"
      | "targetApi"
      | "periodeKerjaAwal"
      | "periodeKerjaAkhir"
    >
  >,
  selectedYear = new Date().getFullYear()
): DashboardTargets {
  const monthNumber = selectedMonth + 1;
  const activitiesUpToMonth = activities.filter((activity) => {
    const { yr, mo } = parseYearMonth(activity.tanggal);
    return yr === selectedYear && mo <= monthNumber;
  });
  const monthlyActivities = activitiesUpToMonth.filter((activity) => {
    const { mo } = parseYearMonth(activity.tanggal);
    return mo === monthNumber;
  });
  const completedMonthlyActivities = monthlyActivities.filter(
    (activity) => activity.status === "Selesai"
  );

  const weeks = getWeeksInMonth(selectedMonth, selectedYear);
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

  const targetApi = customTargets?.targetApi ?? DEFAULT_TARGETS.targetApi;
  const periodeKerjaAwal = customTargets?.periodeKerjaAwal ?? DEFAULT_TARGETS.periodeKerjaAwal;
  const periodeKerjaAkhir = customTargets?.periodeKerjaAkhir ?? DEFAULT_TARGETS.periodeKerjaAkhir;
  const activeMonths = Math.max(1, periodeKerjaAkhir - periodeKerjaAwal + 1);
  const targetApiBulanan = Math.round(targetApi / activeMonths);
  const targetApiMingguan = Math.round(targetApiBulanan / Math.max(1, weeks.length));

  return {
    ...DEFAULT_TARGETS,
    ...customTargets,
    targetApi,
    periodeKerjaAwal,
    periodeKerjaAkhir,
    targetApiBulanan,
    targetApiMingguan,
    totalPoints: sumPoints(completedMonthlyActivities),
    totalMeetings: countMeetings(completedMonthlyActivities),
    activeDays: new Set(completedMonthlyActivities.map((activity) => activity.tanggal)).size,
    totalDays: getDaysInMonth(selectedYear, selectedMonth),
    totalWeeklyPoints: sumPoints(completedWeeklyActivities),
    totalWeeklyMeetings: countMeetings(completedWeeklyActivities),
    totalApi: monthlyActivities
      .filter((activity) => activity.kegiatan.some((k) => CLOSING_TYPES.has(k)))
      .reduce((sum, activity) => sum + (activity.api || 0), 0),
    totalAccumulatedApi: activitiesUpToMonth
      .filter((activity) => activity.kegiatan.some((k) => CLOSING_TYPES.has(k)))
      .reduce((sum, activity) => sum + (activity.api || 0), 0),
    totalWeeklyApi: weeklyActivities
      .filter((activity) => activity.kegiatan.some((k) => CLOSING_TYPES.has(k)))
      .reduce((sum, activity) => sum + (activity.api || 0), 0),
  };
}

function sumPoints(activities: Activity[]) {
  return activities.reduce((sum, activity) => sum + activity.poin, 0);
}

function countMeetings(activities: Activity[]) {
  return activities.filter((activity) => activity.kegiatan.some((k) => MEETING_TYPES.has(k))).length;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
