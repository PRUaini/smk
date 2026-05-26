import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Activity } from "../types";
import ActivitySidebar from "./ActivitySidebar";

const activity: Activity = {
  id: "activity-1",
  tanggal: "2026-05-21",
  waktu: "08:00",
  kegiatan: "Penjualan / Closing",
  poin: 1,
  status: "Belum",
  catatan: "Follow up",
  nasabah: "Budi",
  kontakNasabah: "08123456789",
  produk: "Produk A",
  api: 10000000,
};

describe("ActivitySidebar", () => {
  it("groups add activity fields into polished sections", () => {
    const { container } = render(
      <ActivitySidebar
        selectedActivity={null}
        selectedDate="2026-05-21"
        selectedTime="08:00"
        onSave={vi.fn()}
        onDelete={vi.fn()}
        isPending={false}
        onClose={vi.fn()}
      />
    );
    const drawer = container.querySelector(".activity-drawer-panel");

    expect(drawer).toBeInTheDocument();
    expect(container.querySelectorAll(".activity-form-section")).toHaveLength(3);
    expect(container.querySelector(".sidebar-actions")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tambah Aktivitas" })).toBeInTheDocument();
    expect(screen.getByText("Isi detail kegiatan harian Anda")).toBeInTheDocument();
    expect(screen.getByText("Informasi Waktu")).toBeInTheDocument();
    expect(screen.getByText("Detail Aktivitas")).toBeInTheDocument();
    expect(screen.getByText("Informasi Tambahan")).toBeInTheDocument();
    expect(screen.getByLabelText("Tanggal")).toBeInTheDocument();
    expect(screen.getByLabelText("Waktu")).toBeInTheDocument();
    expect(screen.getByLabelText("Kegiatan")).toBeInTheDocument();
    expect(screen.getByText("1 poin")).toBeInTheDocument();
    expect(container.querySelector(".activity-field-grid-summary")).toBeInTheDocument();
    expect(container.querySelector(".status-radio-group")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Selesai" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proses" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Belum" })).toBeInTheDocument();
    expect(screen.getByLabelText("Catatan")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama Nasabah")).toBeInTheDocument();
    expect(screen.getByLabelText("Kontak Nasabah (Opsional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Produk (Opsional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan Aktivitas" })).toBeInTheDocument();
  });

  it("keeps conditional API field and edit delete behavior", () => {
    render(
      <ActivitySidebar
        selectedActivity={activity}
        selectedDate={null}
        selectedTime={null}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        isPending={false}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Edit Aktivitas" })).toBeInTheDocument();
    expect(screen.getByLabelText("Annualized Premium Income (API) (Opsional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hapus" })).toBeInTheDocument();
  });

  it("blocks submit when customer name is empty", async () => {
    const onSave = vi.fn();
    render(
      <ActivitySidebar
        selectedActivity={null}
        selectedDate="2026-05-21"
        selectedTime="08:00"
        onSave={onSave}
        onDelete={vi.fn()}
        isPending={false}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Simpan Aktivitas" }));

    expect(await screen.findByText("Nama Nasabah wajib diisi")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("submits the existing activity payload with separate customer contact", async () => {
    const onSave = vi.fn();
    render(
      <ActivitySidebar
        selectedActivity={null}
        selectedDate="2026-05-21"
        selectedTime="08:00"
        onSave={onSave}
        onDelete={vi.fn()}
        isPending={false}
        onClose={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("Catatan"), {
      target: { value: "Meeting pertama" },
    });
    fireEvent.change(screen.getByLabelText("Nama Nasabah"), {
      target: { value: "Budi" },
    });
    fireEvent.change(screen.getByLabelText("Kontak Nasabah (Opsional)"), {
      target: { value: "08123456789" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Aktivitas" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          tanggal: "2026-05-21",
          waktu: "08:00",
          kegiatan: "Pendekatan",
          poin: 1,
          status: "Belum",
          catatan: "Meeting pertama",
          nasabah: "Budi",
          kontakNasabah: "08123456789",
        })
      );
    });
  });
});
