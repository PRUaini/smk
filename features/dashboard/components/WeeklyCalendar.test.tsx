import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WeeklyCalendar from "./WeeklyCalendar";

describe("WeeklyCalendar", () => {
  it("shows an empty state when the selected week has no activities", () => {
    render(
      <WeeklyCalendar
        selectedMonth={0}
        activities={[]}
        selectedActivityId={null}
        onSelectActivity={vi.fn()}
        onSelectTimeSlot={vi.fn()}
        onToggleComplete={vi.fn()}
      />
    );

    expect(screen.getByText("Belum ada aktivitas minggu ini")).toBeInTheDocument();
    expect(screen.getByText("Pilih slot waktu untuk menambahkan aktivitas baru.")).toBeInTheDocument();
  });
});
