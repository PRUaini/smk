import { vi, describe, it, expect } from "vitest";

const mockInsert = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());

const mockQuery = vi.hoisted(() => {
  const queryObj = {
    select: () => queryObj,
    eq: () => queryObj,
    insert: mockInsert,
    update: mockUpdate,
    order: () => queryObj,
    then: (onfulfilled: (value: { data: null; error: { message: string } }) => void) => {
      if (onfulfilled) {
        onfulfilled({
          data: null,
          error: { message: "Detailed PG error: violates foreign key" },
        });
      }
    },
  };
  return queryObj;
});

const mockSupabase = vi.hoisted(() => ({
  from: () => mockQuery,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { createActivity, getActivitiesByAgent, updateActivity } from "./activities.repository";

describe("activities.repository error handling", () => {
  it("hides raw database error message and logs it", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(getActivitiesByAgent("agent-123")).rejects.toThrow(
      "Failed to fetch activities. Please try again later."
    );
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe("activities.repository mapping", () => {
  it("maps kontak_nasabah on create payload and result", async () => {
    const row = {
      id: "activity-1",
      tanggal: "2026-05-21",
      waktu: "08:00",
      kegiatan: "Pertemuan",
      poin: 2,
      status: "Belum",
      catatan: "",
      nasabah: "Budi",
      kontak_nasabah: "08123456789",
      produk: "",
      api: null,
    };
    mockInsert.mockReturnValueOnce({
      select: () => ({
        single: () => Promise.resolve({ data: row, error: null }),
      }),
    });

    const result = await createActivity("agent-1", {
      tanggal: "2026-05-21",
      waktu: "08:00",
      kegiatan: "Pertemuan",
      poin: 2,
      status: "Belum",
      catatan: "",
      nasabah: "Budi",
      kontakNasabah: "08123456789",
      produk: "",
      api: undefined,
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ kontak_nasabah: "08123456789" })
    );
    expect(result.kontakNasabah).toBe("08123456789");
  });

  it("maps kontakNasabah to kontak_nasabah on update", async () => {
    const row = {
      id: "activity-1",
      tanggal: "2026-05-21",
      waktu: "08:00",
      kegiatan: "Pertemuan",
      poin: 2,
      status: "Belum",
      catatan: "",
      nasabah: "Budi",
      kontak_nasabah: "08123456789",
      produk: "",
      api: null,
    };
    mockUpdate.mockReturnValueOnce({
      eq: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: row, error: null }),
          }),
        }),
      }),
    });

    const result = await updateActivity("activity-1", "agent-1", {
      kontakNasabah: "08123456789",
    });

    expect(mockUpdate).toHaveBeenCalledWith({ kontak_nasabah: "08123456789" });
    expect(result.kontakNasabah).toBe("08123456789");
  });
});
