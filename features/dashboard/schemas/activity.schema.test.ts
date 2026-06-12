import { describe, expect, it } from "vitest";
import {
  activityActionSchema,
  activityFormSchema,
  buildActivityPayload,
  type ActivityFormData,
} from "./activity.schema";

describe("activityFormSchema", () => {
  it("accepts a valid activity form", () => {
    const result = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Approach / Fact Finding"],
      catatan: "Meeting",
      nasabah: "Bapak Andi",
      kontakNasabah: "08123456789",
      produk: "PRULink",
    });

    expect(result.success).toBe(true);
  });

  it("accepts full-day hourly activity ranges", () => {
    const earlyResult = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "00:00",
      waktuSelesai: "01:00",
      kegiatan: ["Approach / Fact Finding"],
      catatan: "Early meeting",
      nasabah: "Bapak Andi",
      kontakNasabah: "",
      produk: "",
    });
    const lateResult = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "23:00",
      waktuSelesai: "24:00",
      kegiatan: ["Approach / Fact Finding"],
      catatan: "Late meeting",
      nasabah: "Bapak Andi",
      kontakNasabah: "",
      produk: "",
    });

    expect(earlyResult.success).toBe(true);
    expect(lateResult.success).toBe(true);
  });

  it("rejects 24:00 as a start time", () => {
    const result = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "24:00",
      waktuSelesai: "24:00",
      kegiatan: ["Approach / Fact Finding"],
      catatan: "",
      nasabah: "Bapak Andi",
      kontakNasabah: "",
      produk: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Waktu mulai tidak valid");
  });

  it("rejects missing required date and time", () => {
    const result = activityFormSchema.safeParse({
      tanggal: "",
      waktu: "",
      waktuSelesai: "",
      kegiatan: ["Approach / Fact Finding"],
      catatan: "",
      nasabah: "",
      kontakNasabah: "",
      produk: "",
    });

    expect(result.success).toBe(false);
  });

  it("derives points and default notes for saved payloads", () => {
    const payload = buildActivityPayload({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Chat Calon Nasabah"],
      catatan: "",
      nasabah: "Bapak Andi",
      kontakNasabah: "08123456789",
      produk: "",
    }, "Belum");

    expect(payload.poin).toBe(1);
    expect(payload.catatan).toBe("");
    expect(payload.status).toBe("Belum");
    expect(payload.kontakNasabah).toBe("08123456789");
    expect(payload.waktuSelesai).toBe("09:00");
  });

  it("derives summed points for multiple activities in saved payloads", () => {
    const payload = buildActivityPayload({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Chat Calon Nasabah", "Approach / Fact Finding"], // 1 + 4 = 5
      catatan: "",
      nasabah: "Bapak Andi",
      kontakNasabah: "08123456789",
      produk: "",
    }, "Belum");

    expect(payload.poin).toBe(5);
  });

  it("rejects empty or whitespace-only customer names", () => {
    const emptyResult = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Approach / Fact Finding"],
      catatan: "",
      nasabah: "",
      kontakNasabah: "",
      produk: "",
    });
    const whitespaceResult = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Approach / Fact Finding"],
      catatan: "",
      nasabah: "   ",
      kontakNasabah: "",
      produk: "",
    });

    expect(emptyResult.success).toBe(false);
    expect(emptyResult.error?.issues[0]?.message).toBe("Nama Nasabah wajib diisi");
    expect(whitespaceResult.success).toBe(false);
    expect(whitespaceResult.error?.issues[0]?.message).toBe("Nama Nasabah wajib diisi");
  });

  it("accepts optional customer contact", () => {
    const result = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Approach / Fact Finding"],
      catatan: "",
      nasabah: "Bapak Andi",
      kontakNasabah: "",
      produk: "",
    });

    expect(result.success).toBe(true);
  });

  it("handles valid and invalid API numbers for closing", () => {
    const validResult = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Closing Prospek"],
      catatan: "Sales",
      nasabah: "Ibu Rina",
      kontakNasabah: "",
      produk: "PRUWarisan",
      api: "15000000",
    });
    expect(validResult.success).toBe(true);
    expect(validResult.data?.api).toBe("15000000");

    const payload = buildActivityPayload(validResult.data as ActivityFormData, "Selesai");
    expect(payload.api).toBe(15000000);
    expect(payload.status).toBe("Selesai");

    const invalidResult = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Closing Prospek"],
      catatan: "Sales",
      nasabah: "Ibu Rina",
      kontakNasabah: "",
      produk: "PRUWarisan",
      api: "-5000",
    });
    expect(invalidResult.success).toBe(false);
  });

  it("requires API number when a closing activity is selected", () => {
    const result = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Closing Prospek"],
      catatan: "Sales",
      nasabah: "Ibu Rina",
      kontakNasabah: "",
      produk: "PRUWarisan",
      api: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("API wajib diisi untuk kegiatan Closing");
  });

  it("requires end time after start time", () => {
    const result = activityFormSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "09:00",
      waktuSelesai: "09:00",
      kegiatan: ["Approach / Fact Finding"],
      catatan: "",
      nasabah: "Bapak Andi",
      kontakNasabah: "",
      produk: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Waktu selesai harus setelah waktu mulai");
  });
});

describe("activityActionSchema", () => {
  it("accepts a valid activity action payload", () => {
    const result = activityActionSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Approach / Fact Finding"],
      status: "Selesai",
      catatan: "Meeting",
      nasabah: "Bapak Andi",
      kontakNasabah: "08123456789",
      produk: "PRULink",
      api: 15000000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative API numbers", () => {
    const result = activityActionSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Closing Prospek"],
      status: "Selesai",
      catatan: "Sales",
      nasabah: "Ibu Rina",
      kontakNasabah: "",
      produk: "PRUWarisan",
      api: -5000,
    });
    expect(result.success).toBe(false);
  });

  it("requires API number for closing activity", () => {
    const result = activityActionSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "08:00",
      waktuSelesai: "09:00",
      kegiatan: ["Closing Prospek"],
      status: "Selesai",
      catatan: "Sales",
      nasabah: "Ibu Rina",
      kontakNasabah: "",
      produk: "PRUWarisan",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("API wajib diisi untuk kegiatan Closing");
  });

  it("rejects action payload when end time is before start time", () => {
    const result = activityActionSchema.safeParse({
      tanggal: "2026-01-05",
      waktu: "10:00",
      waktuSelesai: "09:00",
      kegiatan: ["Approach / Fact Finding"],
      status: "Belum",
      catatan: "",
      nasabah: "Bapak Andi",
      kontakNasabah: "",
      produk: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Waktu selesai harus setelah waktu mulai");
  });
});
