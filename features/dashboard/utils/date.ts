import { DAYS_OF_WEEK } from "../constants";

export function getWeeksInMonth(selectedMonth: number, selectedYear = new Date().getFullYear()) {
  const weeks: Date[] = [];

  const firstDay = new Date(selectedYear, selectedMonth, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const firstWeekStart = new Date(selectedYear, selectedMonth, 1 - mondayOffset);
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

  for (
    const weekStart = firstWeekStart;
    weekStart <= lastDay;
    weekStart.setDate(weekStart.getDate() + 7)
  ) {
    weeks.push(new Date(weekStart));
  }

  return weeks;
}

export function getWeekDates(startDate: Date) {
  const dates = [];
  for (let i = 0; i < DAYS_OF_WEEK.length; i++) {
    const tempDate = new Date(startDate);
    tempDate.setDate(startDate.getDate() + i);
    dates.push(
      `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}-${String(tempDate.getDate()).padStart(2, "0")}`
    );
  }
  return dates;
}

export function getDaysInPeriod(year: number, startMonth: number, endMonth: number) {
  let total = 0;
  for (let month = startMonth; month <= endMonth; month++) {
    total += new Date(year, month, 0).getDate();
  }
  return total;
}
