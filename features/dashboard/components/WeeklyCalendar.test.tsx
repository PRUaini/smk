import { fireEvent, render, screen } from "@testing-library/react";
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

  it("calls onSelectTimeSlot when clicking the hover indicator inside empty cell", () => {
    const onSelectTimeSlotMock = vi.fn();
    render(
      <WeeklyCalendar
        selectedMonth={0}
        activities={[]}
        selectedActivityId={null}
        onSelectActivity={vi.fn()}
        onSelectTimeSlot={onSelectTimeSlotMock}
        onToggleComplete={vi.fn()}
      />
    );

    // Let's find the empty hover indicator "+ Tambah"
    const indicators = screen.getAllByText("+ Tambah");
    expect(indicators.length).toBeGreaterThan(0);

    // Click on the first "+ Tambah" hover indicator
    indicators[0].click();

    expect(onSelectTimeSlotMock).toHaveBeenCalled();
  });

  it("renders week chips and grid labels for an empty weekly calendar", () => {
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

    expect(screen.getByRole("button", { name: "Minggu 1" })).toBeInTheDocument();
    expect(screen.getByText("Senin")).toBeInTheDocument();
    expect(screen.getByText("Sabtu")).toBeInTheDocument();
    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getAllByText("Total Poin").length).toBeGreaterThan(0);
  });

  it("calls onSelectTimeSlot when clicking an empty calendar slot", () => {
    const onSelectTimeSlotMock = vi.fn();
    render(
      <WeeklyCalendar
        selectedMonth={0}
        activities={[]}
        selectedActivityId={null}
        onSelectActivity={vi.fn()}
        onSelectTimeSlot={onSelectTimeSlotMock}
        onToggleComplete={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByText("+ Tambah")[0].closest(".calendar-cell")!);

    expect(onSelectTimeSlotMock).toHaveBeenCalledWith(expect.stringMatching(/^2026-01-/), "08:00");
  });
});
