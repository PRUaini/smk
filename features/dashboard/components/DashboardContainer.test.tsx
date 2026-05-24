import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
});
