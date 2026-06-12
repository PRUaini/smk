import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WeeklyCalendar from "./WeeklyCalendar";

describe("WeeklyCalendar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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
    const { container } = render(
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
    expect(screen.getByText("Minggu")).toBeInTheDocument();
    expect(screen.queryByText("08:00")).not.toBeInTheDocument();
    expect(container.querySelector(".time-col-header")).not.toBeInTheDocument();
    expect(container.querySelector(".time-cell")).not.toBeInTheDocument();
    expect(container.querySelector(".time-col-footer")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".calendar-grid-header .day-col-header")).toHaveLength(7);
    expect(container.querySelectorAll(".calendar-grid-row:first-child .calendar-cell")).toHaveLength(7);
    expect(container.querySelectorAll(".calendar-grid-footer .footer-point-cell")).toHaveLength(7);
    expect(screen.getAllByText("Total Poin")).toHaveLength(7);
  });

  it("shows customer contact below customer name when present", () => {
    render(
      <WeeklyCalendar
        selectedMonth={0}
        selectedYear={2026}
        activities={[
          {
            id: "activity-1",
            tanggal: "2026-01-05",
            waktu: "08:00",
            waktuSelesai: "09:00",
            kegiatan: ["Approach / Fact Finding"],
            poin: 4,
            status: "Belum",
            catatan: "",
            nasabah: "Budi",
            kontakNasabah: "08123456789",
            produk: "",
          },
        ]}
        selectedActivityId={null}
        onSelectActivity={vi.fn()}
        onSelectTimeSlot={vi.fn()}
        onToggleComplete={vi.fn()}
      />
    );

    expect(screen.getByText("Nasabah:")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("08:00 - 09:00")).toBeInTheDocument();
    expect(screen.getByText("Kontak:")).toBeInTheDocument();
    expect(screen.getByText("08123456789")).toBeInTheDocument();
  });

  it("sorts activities by start time only", () => {
    render(
      <WeeklyCalendar
        selectedMonth={0}
        selectedYear={2026}
        activities={[
          {
            id: "activity-late-end",
            tanggal: "2026-01-05",
            waktu: "08:00",
            waktuSelesai: "10:00",
            kegiatan: ["Follow Up"],
            poin: 2,
            status: "Belum",
            catatan: "",
            nasabah: "Budi",
            kontakNasabah: "",
            produk: "",
          },
          {
            id: "activity-earlier-start",
            tanggal: "2026-01-05",
            waktu: "07:00",
            waktuSelesai: "12:00",
            kegiatan: ["Presentasi"],
            poin: 3,
            status: "Belum",
            catatan: "",
            nasabah: "Cici",
            kontakNasabah: "",
            produk: "",
          },
          {
            id: "activity-early-end",
            tanggal: "2026-01-05",
            waktu: "08:00",
            waktuSelesai: "09:00",
            kegiatan: ["Chat Calon Nasabah"],
            poin: 1,
            status: "Belum",
            catatan: "",
            nasabah: "Andi",
            kontakNasabah: "",
            produk: "",
          },
        ]}
        selectedActivityId={null}
        onSelectActivity={vi.fn()}
        onSelectTimeSlot={vi.fn()}
        onToggleComplete={vi.fn()}
      />
    );

    const cards = screen.getAllByText(/Presentasi|Chat Calon Nasabah|Follow Up/);
    expect(cards.map((card) => card.textContent)).toEqual([
      "Presentasi",
      "Follow Up",
      "Chat Calon Nasabah",
    ]);
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

  it("uses the selected year when selecting an empty calendar slot", () => {
    const onSelectTimeSlotMock = vi.fn();
    render(
      <WeeklyCalendar
        selectedMonth={0}
        selectedYear={2027}
        activities={[]}
        selectedActivityId={null}
        onSelectActivity={vi.fn()}
        onSelectTimeSlot={onSelectTimeSlotMock}
        onToggleComplete={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByText("+ Tambah")[0].closest(".calendar-cell")!);

    expect(onSelectTimeSlotMock).toHaveBeenCalledWith(expect.stringMatching(/^2027-01-/), "08:00");
  });

  it("creates selectable Sunday slots", () => {
    const onSelectTimeSlotMock = vi.fn();
    render(
      <WeeklyCalendar
        selectedMonth={0}
        selectedYear={2026}
        activities={[]}
        selectedActivityId={null}
        onSelectActivity={vi.fn()}
        onSelectTimeSlot={onSelectTimeSlotMock}
        onToggleComplete={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByText("+ Tambah")[6].closest(".calendar-cell")!);

    expect(onSelectTimeSlotMock).toHaveBeenCalledWith("2026-01-11", "08:00");
  });

  it("auto-selects today's week before manual selection", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 20, 9, 0, 0));
    const onSelectTimeSlotMock = vi.fn();

    render(
      <WeeklyCalendar
        selectedMonth={0}
        selectedYear={2026}
        activities={[]}
        selectedActivityId={null}
        onSelectActivity={vi.fn()}
        onSelectTimeSlot={onSelectTimeSlotMock}
        onToggleComplete={vi.fn()}
        autoFocusToday
      />
    );

    expect(screen.getByRole("button", { name: "Minggu 3" })).toHaveClass("active");
    fireEvent.click(screen.getAllByText("+ Tambah")[0].closest(".calendar-cell")!);
    expect(onSelectTimeSlotMock).toHaveBeenCalledWith("2026-01-19", "08:00");
  });

  it("keeps manual week selection after auto-focus", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 20, 9, 0, 0));
    const onSelectTimeSlotMock = vi.fn();

    render(
      <WeeklyCalendar
        selectedMonth={0}
        selectedYear={2026}
        activities={[]}
        selectedActivityId={null}
        onSelectActivity={vi.fn()}
        onSelectTimeSlot={onSelectTimeSlotMock}
        onToggleComplete={vi.fn()}
        autoFocusToday
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Minggu 1" }));
    fireEvent.click(screen.getAllByText("+ Tambah")[0].closest(".calendar-cell")!);

    expect(screen.getByRole("button", { name: "Minggu 1" })).toHaveClass("active");
    expect(onSelectTimeSlotMock).toHaveBeenCalledWith("2026-01-05", "08:00");
  });
});
