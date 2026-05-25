import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveActivityAction } from "../actions";
import type { Activity } from "../types";
import DashboardContainer from "./DashboardContainer";

vi.mock("../actions", () => ({
  saveActivityAction: vi.fn(),
  toggleActivityStatusAction: vi.fn(),
  removeActivityAction: vi.fn(),
  saveAgentTargetsAction: vi.fn(),
}));

vi.mock("@/features/auth/actions/logout", () => ({
  logout: vi.fn(),
}));

const activity: Activity = {
  id: "activity-1",
  tanggal: "2026-05-21",
  waktu: "08:00",
  kegiatan: "Pendekatan",
  poin: 1,
  status: "Belum",
  catatan: "",
  nasabah: "Budi",
  produk: "Produk A",
};

describe("DashboardContainer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the right sidebar mounted until the close transition ends", async () => {
    render(
      <DashboardContainer
        initialKodeAgent="Agent"
        initialActivities={[activity]}
        initialTargets={null}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Activity" }));
    expect(screen.getByRole("heading", { name: "Tambah Aktivitas" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.getByRole("heading", { name: "Tambah Aktivitas" })).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveClass("closing");

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.queryByRole("heading", { name: "Tambah Aktivitas" })).not.toBeInTheDocument();
  });

  it("keeps the edit target sidebar mounted until the close transition ends", () => {
    render(
      <DashboardContainer
        initialKodeAgent="Agent"
        initialActivities={[activity]}
        initialTargets={null}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Laporan Aktivitas" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit Target" }));
    expect(screen.getByRole("heading", { name: "Edit Target Agen" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.getByRole("heading", { name: "Edit Target Agen" })).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toHaveClass("closing");

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.queryByRole("heading", { name: "Edit Target Agen" })).not.toBeInTheDocument();
  });

  it("renders both dashboard tabs and switches between agenda and laporan", () => {
    render(
      <DashboardContainer
        initialKodeAgent="Agent"
        initialActivities={[]}
        initialTargets={null}
      />
    );

    expect(screen.getByRole("button", { name: "Agenda Aktivitas" })).toHaveClass("active");
    expect(screen.getByText("Belum ada aktivitas minggu ini")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Laporan Aktivitas" }));

    expect(screen.getByRole("button", { name: "Laporan Aktivitas" })).toHaveClass("active");
    expect(screen.getByRole("button", { name: "Edit Target" })).toBeInTheDocument();
  });

  it("shows activity years plus the current year in the year selector", () => {
    vi.setSystemTime(new Date("2026-05-25T00:00:00Z"));

    render(
      <DashboardContainer
        initialKodeAgent="Agent"
        initialActivities={[
          activity,
          { ...activity, id: "activity-2025", tanggal: "2025-04-10" },
        ]}
        initialTargets={null}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Pilih tahun 2026" }));

    expect(screen.getByRole("option", { name: "2026" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "2025" })).toBeInTheDocument();
  });

  it("changes dashboard dates when selecting a different year", () => {
    vi.setSystemTime(new Date("2026-05-25T00:00:00Z"));

    render(
      <DashboardContainer
        initialKodeAgent="Agent"
        initialActivities={[
          { ...activity, id: "activity-2027", tanggal: "2027-02-04" },
        ]}
        initialTargets={null}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Pilih tahun 2026" }));
    fireEvent.click(screen.getByRole("option", { name: "2027" }));
    fireEvent.click(screen.getByRole("button", { name: "Januari" }));
    fireEvent.click(screen.getAllByText("+ Tambah")[0].closest(".calendar-cell")!);

    expect(screen.getByLabelText("Tanggal")).toHaveValue("2027-01-04");
  });

  it("does not render fake activity titles when initial activities are empty", () => {
    render(
      <DashboardContainer
        initialKodeAgent="Agent"
        initialActivities={[]}
        initialTargets={null}
      />
    );

    expect(screen.queryByText("Pendekatan")).not.toBeInTheDocument();
    expect(screen.queryByText("Pertemuan")).not.toBeInTheDocument();
    expect(screen.queryByText("Wawancara")).not.toBeInTheDocument();
    expect(screen.queryByText("Penjualan")).not.toBeInTheDocument();
  });

  it("opens the add activity panel from the floating add button", () => {
    render(
      <DashboardContainer
        initialKodeAgent="Agent"
        initialActivities={[]}
        initialTargets={null}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Activity" }));

    expect(screen.getByRole("heading", { name: "Tambah Aktivitas" })).toBeInTheDocument();
  });

  it("replaces a new optimistic activity id with the persisted id before editing", async () => {
    vi.useRealTimers();
    const savedActivity: Activity = {
      ...activity,
      id: "persisted-activity",
      tanggal: "2026-05-04",
      waktu: "08:00",
    };
    vi.mocked(saveActivityAction)
      .mockResolvedValueOnce(savedActivity)
      .mockResolvedValueOnce({ ...savedActivity, catatan: "Updated note" });

    render(
      <DashboardContainer
        initialKodeAgent="Agent"
        initialActivities={[]}
        initialTargets={null}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Activity" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan Aktivitas" }));

    await waitFor(() => {
      expect(saveActivityAction).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Pendekatan")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Pendekatan"));
    fireEvent.change(screen.getByLabelText("Catatan"), {
      target: { value: "Updated note" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Aktivitas" }));

    await waitFor(() => {
      expect(saveActivityAction).toHaveBeenCalledTimes(2);
      expect(saveActivityAction).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: "persisted-activity", catatan: "Updated note" })
      );
    });
  });
});
