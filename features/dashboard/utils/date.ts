export function getWeeksInMonth(selectedMonth: number) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const weeks: Date[] = [];
  
  const d = new Date(currentYear, selectedMonth, 1);
  const day = d.getDay();
  if (day === 0) {
    d.setDate(d.getDate() + 1);
  } else if (day > 1) {
    d.setDate(d.getDate() + (8 - day));
  }

  while (d.getMonth() === selectedMonth) {
    weeks.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return weeks;
}

export function getWeekDates(startDate: Date) {
  const dates = [];
  for (let i = 0; i < 6; i++) {
    const tempDate = new Date(startDate);
    tempDate.setDate(startDate.getDate() + i);
    dates.push(
      `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, "0")}-${String(tempDate.getDate()).padStart(2, "0")}`
    );
  }
  return dates;
}
