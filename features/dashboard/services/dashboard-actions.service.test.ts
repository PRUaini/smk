import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Activity } from "../types";
import {
  removeActivityForAgent,
  saveActivityForAgent,
  saveTargetsForAgent,
  toggleActivityStatusForAgent,
} from "./dashboard-actions.service";

vi.mock("../data/activities.repository", () => ({
  createActivity: vi.fn(),
  updateActivity: vi.fn(),
  deleteActivity: vi.fn(),
}));

vi.mock("../data/targets.repository", () => ({
  saveAgentTargets: vi.fn(),
}));

const activityInput: Omit<Activity, "id"> = {
  tanggal: "2026-05-21",
  waktu: "08:00",
  kegiatan: "Pertemuan",
  poin: 99,
  status: "Belum",
  catatan: "",
  nasabah: "",
  produk: "",
};

describe("dashboard action service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates new activities with server-derived points", async () => {
    const { createActivity } = await import("../data/activities.repository");

    await saveActivityForAgent("agent-1", activityInput);

    expect(createActivity).toHaveBeenCalledWith("agent-1", {
      ...activityInput,
      poin: 2,
    });
  });

  it("updates existing activities with server-derived points", async () => {
    const { updateActivity } = await import("../data/activities.repository");

    await saveActivityForAgent("agent-1", { ...activityInput, id: "activity-1" });

    expect(updateActivity).toHaveBeenCalledWith("activity-1", "agent-1", {
      ...activityInput,
      poin: 2,
    });
  });

  it("toggles activity status for the authenticated agent", async () => {
    const { updateActivity } = await import("../data/activities.repository");

    await toggleActivityStatusForAgent("agent-1", "activity-1", "Selesai");

    expect(updateActivity).toHaveBeenCalledWith("activity-1", "agent-1", {
      status: "Belum",
    });
  });

  it("deletes activity through the repository", async () => {
    const { deleteActivity } = await import("../data/activities.repository");

    await removeActivityForAgent("agent-1", "activity-1");

    expect(deleteActivity).toHaveBeenCalledWith("activity-1", "agent-1");
  });

  it("validates and saves targets through the repository", async () => {
    const { saveAgentTargets } = await import("../data/targets.repository");
    vi.mocked(saveAgentTargets).mockResolvedValue({
      kodeAgent: "agent001",
      targetPoints: 500,
      targetMeetings: 40,
      targetSales: 25,
      targetWeeklyPoints: 125,
      targetWeeklyMeetings: 10,
      targetWeeklySales: 6,
    });

    await saveTargetsForAgent("agent001", {
      targetPoints: 500,
      targetMeetings: 40,
      targetSales: 25,
      targetWeeklyPoints: 125,
      targetWeeklyMeetings: 10,
      targetWeeklySales: 6,
    });

    expect(saveAgentTargets).toHaveBeenCalledWith("agent001", {
      targetPoints: 500,
      targetMeetings: 40,
      targetSales: 25,
      targetWeeklyPoints: 125,
      targetWeeklyMeetings: 10,
      targetWeeklySales: 6,
    });
  });
});
