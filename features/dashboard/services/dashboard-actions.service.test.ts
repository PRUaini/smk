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
  waktuSelesai: "09:00",
  kegiatan: ["Approach / Fact Finding"],
  poin: 99,
  status: "Belum",
  catatan: "",
  nasabah: "Budi",
  kontakNasabah: "08123456789",
  produk: "",
};

describe("dashboard action service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates new activities with server-derived points", async () => {
    const { createActivity } = await import("../data/activities.repository");
    vi.mocked(createActivity).mockResolvedValue({ ...activityInput, id: "activity-1", poin: 4 });

    const result = await saveActivityForAgent("agent-1", activityInput);

    expect(createActivity).toHaveBeenCalledWith("agent-1", {
      ...activityInput,
      poin: 4,
    });
    expect(result).toEqual({ ...activityInput, id: "activity-1", poin: 4 });
  });

  it("creates Others activities without additional customer info", async () => {
    const { createActivity } = await import("../data/activities.repository");
    const othersInput: Omit<Activity, "id"> = {
      ...activityInput,
      kegiatan: ["Others"],
      poin: 99,
      nasabah: "",
      kontakNasabah: "",
      produk: "",
      api: undefined,
    };
    vi.mocked(createActivity).mockResolvedValue({
      ...othersInput,
      id: "activity-others",
      poin: 0,
    });

    const result = await saveActivityForAgent("agent-1", othersInput);

    expect(createActivity).toHaveBeenCalledWith("agent-1", {
      ...othersInput,
      poin: 0,
    });
    expect(result).toEqual({ ...othersInput, id: "activity-others", poin: 0 });
  });

  it("creates non-customer activities without additional customer info", async () => {
    const { createActivity } = await import("../data/activities.repository");
    const trainingInput: Omit<Activity, "id"> = {
      ...activityInput,
      kegiatan: ["Training", "Bawa teman ke BOP"],
      poin: 99,
      nasabah: "",
      kontakNasabah: "old-contact",
      produk: "old-product",
      api: 1000000,
    };
    const normalizedInput = {
      ...trainingInput,
      poin: 6,
      nasabah: "",
      kontakNasabah: "",
      produk: "",
      api: undefined,
    };
    vi.mocked(createActivity).mockResolvedValue({
      ...normalizedInput,
      id: "activity-training",
    });

    const result = await saveActivityForAgent("agent-1", trainingInput);

    expect(createActivity).toHaveBeenCalledWith("agent-1", normalizedInput);
    expect(result).toEqual({ ...normalizedInput, id: "activity-training" });
  });

  it("updates existing activities with server-derived points", async () => {
    const { updateActivity } = await import("../data/activities.repository");
    vi.mocked(updateActivity).mockResolvedValue({ ...activityInput, id: "activity-1", poin: 4 });

    const result = await saveActivityForAgent("agent-1", { ...activityInput, id: "activity-1" });

    expect(updateActivity).toHaveBeenCalledWith("activity-1", "agent-1", {
      ...activityInput,
      poin: 4,
    });
    expect(result).toEqual({ ...activityInput, id: "activity-1", poin: 4 });
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
      targetWeeklyPoints: 125,
      targetWeeklyMeetings: 10,
      targetApi: 120000000,
      periodeKerjaAwal: 1,
      periodeKerjaAkhir: 12,
    });

    await saveTargetsForAgent("agent001", {
      targetPoints: 500,
      targetMeetings: 40,
      targetWeeklyPoints: 125,
      targetWeeklyMeetings: 10,
      targetApi: 120000000,
      periodeKerjaAwal: 1,
      periodeKerjaAkhir: 12,
    });

    expect(saveAgentTargets).toHaveBeenCalledWith("agent001", {
      targetPoints: 500,
      targetMeetings: 40,
      targetWeeklyPoints: 125,
      targetWeeklyMeetings: 10,
      targetApi: 120000000,
      periodeKerjaAwal: 1,
      periodeKerjaAkhir: 12,
    });
  });
});
