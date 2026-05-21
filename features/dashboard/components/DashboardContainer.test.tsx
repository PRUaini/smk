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
});
