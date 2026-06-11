import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Activity } from "../types";
import ActivitySidebar from "./ActivitySidebar";

const activity: Activity = {
  id: "activity-1",
  tanggal: "2026-05-21",
  waktu: "08:00",
  kegiatan: ["Closing Prospek"],
  poin: 10,
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
    expect(screen.getByText("0 poin")).toBeInTheDocument();
    expect(container.querySelector(".activity-field-grid-summary")).toBeInTheDocument();
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
    expect(screen.getByLabelText("Annualized Premium Income (API) (Wajib)")).toBeInTheDocument();
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

    // Open dropdown and select a kegiatan first
    fireEvent.click(screen.getByLabelText("Kegiatan"));
    fireEvent.click(screen.getByText("Chat Calon Nasabah"));

    fireEvent.click(screen.getByRole("button", { name: "Simpan Aktivitas" }));

    expect(await screen.findByText("Nama Nasabah wajib diisi")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("submits the activity payload after selecting activities", async () => {
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

    // Select "Chat Calon Nasabah" (1 pt) and "Approach / Fact Finding" (4 pts)
    fireEvent.click(screen.getByLabelText("Kegiatan"));
    fireEvent.click(screen.getByText("Chat Calon Nasabah"));
    fireEvent.click(screen.getByText("Approach / Fact Finding"));

    expect(screen.getByText("5 poin")).toBeInTheDocument();

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
          kegiatan: ["Chat Calon Nasabah", "Approach / Fact Finding"],
          poin: 5,
          status: "Belum",
          catatan: "Meeting pertama",
          nasabah: "Budi",
          kontakNasabah: "08123456789",
        })
      );
    });
  });
});
