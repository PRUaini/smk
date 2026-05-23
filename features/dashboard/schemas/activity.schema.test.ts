import { describe, expect, it } from "vitest";
import { activityFormSchema, buildActivityPayload } from "./activity.schema";

describe("activityFormSchema", () => {
  it("accepts a valid activity form", () => {
    const result = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      kegiatan: "Pertemuan",
      status: "Selesai",
      catatan: "Meeting",
      nasabah: "Bapak Andi",
      produk: "PRULink",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required date and time", () => {
    const result = activityFormSchema.safeParse({
      tanggal: "",
      waktu: "",
      kegiatan: "Pertemuan",
      status: "Selesai",
      catatan: "",
      nasabah: "",
      produk: "",
    });

    expect(result.success).toBe(false);
  });

  it("derives points and default notes for saved payloads", () => {
    const payload = buildActivityPayload({
      tanggal: "2026-01-05",
      waktu: "08:00",
      kegiatan: "Pendekatan",
      status: "Belum",
      catatan: "",
      nasabah: "",
      produk: "",
    });

    expect(payload.poin).toBe(1);
    expect(payload.catatan).toBe("");
  });

  it("handles valid and invalid API numbers", () => {
    const validResult = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      kegiatan: "Penjualan / Closing",
      status: "Selesai",
      catatan: "Sales",
      nasabah: "Ibu Rina",
      produk: "PRUWarisan",
      api: "15000000",
    });
    expect(validResult.success).toBe(true);
    expect(validResult.data?.api).toBe(15000000);

    const invalidResult = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      kegiatan: "Penjualan / Closing",
      status: "Selesai",
      catatan: "Sales",
      nasabah: "Ibu Rina",
      produk: "PRUWarisan",
      api: "-5000",
    });
    expect(invalidResult.success).toBe(false);
  });
});
