import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ACTIVITY_DESCRIPTIONS, ACTIVITY_POINTS, DASHBOARD_TIME_SLOTS } from "../constants";
import { activityFormSchema, buildActivityPayload, type ActivityFormData } from "../schemas/activity.schema";
import { Activity, ActivityStatus, ActivityType } from "../types";

interface ActivitySidebarProps {
  selectedActivity: Activity | null;
  selectedDate: string | null;
  selectedTime: string | null;
  onSave: (activity: Omit<Activity, "id"> & { id?: string }) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ActivitySidebar({
  selectedActivity,
  selectedDate,
  selectedTime,
  onSave,
  onDelete,
  onClose,
}: ActivitySidebarProps) {
  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    values: {
      tanggal: selectedActivity?.tanggal ?? selectedDate ?? "",
      waktu: selectedActivity?.waktu ?? selectedTime ?? "08:00",
      kegiatan: selectedActivity?.kegiatan ?? "Pendekatan",
      status: selectedActivity?.status ?? "Belum",
      catatan: selectedActivity?.catatan ?? "...",
      nasabah: selectedActivity?.nasabah ?? "...",
      produk: selectedActivity?.produk ?? "...",
    },
  });

  const kegiatan = useWatch({ control: form.control, name: "kegiatan" });
  const status = useWatch({ control: form.control, name: "status" });
  const catatan = useWatch({ control: form.control, name: "catatan" });

  const handleKegiatanChange = (value: ActivityType) => {
    form.setValue("kegiatan", value, { shouldValidate: true });
    if (!catatan || Object.values(ACTIVITY_DESCRIPTIONS).includes(catatan)) {
      form.setValue("catatan", ACTIVITY_DESCRIPTIONS[value], { shouldValidate: true });
    }
  };

  const handleSubmit = (data: ActivityFormData) => {
    onSave(buildActivityPayload(data, selectedActivity?.id));
  };

  return (
    <aside className="activity-sidebar-card">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          {selectedActivity ? "Edit Aktivitas" : "Tambah Aktivitas"}
        </h2>
        <button className="close-sidebar-btn" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="sidebar-form">
        <div className="form-group">
          <label className="form-label">Tanggal</label>
          <input
            type="date"
            className="form-input"
            {...form.register("tanggal")}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Waktu</label>
          <select
            className="form-input"
            {...form.register("waktu")}
          >
            <option value="" disabled>Pilih Waktu</option>
            {DASHBOARD_TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Kegiatan</label>
          <select
            className="form-input"
            value={kegiatan}
            onChange={(e) => handleKegiatanChange(e.target.value as ActivityType)}
          >
            <option value="Pendekatan">Pendekatan (1 poin)</option>
            <option value="Pertemuan">Pertemuan (2 poin)</option>
            <option value="Pencarian Fakta">Pencarian Fakta (2 poin)</option>
            <option value="Mendapatkan 3 Referensi">Mendapatkan 3 Referensi (4 poin)</option>
            <option value="Wawancara Penutupan">Wawancara Penutupan (4 poin)</option>
            <option value="Penjualan">Penjualan (1 poin)</option>
            <option value="Penyerahan Polis/Layanan">Penyerahan Polis/Layanan (1 poin)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Poin Didapat</label>
          <div className="point-badge-display">
            {ACTIVITY_POINTS[kegiatan]} poin
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <div className="status-radio-group">
            {(["Selesai", "Proses", "Belum"] as ActivityStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`status-select-btn ${s.toLowerCase()} ${status === s ? "active" : ""}`}
                onClick={() => form.setValue("status", s, { shouldValidate: true })}
              >
                <span className="dot" />
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Catatan</label>
          <textarea
            className="form-textarea"
            maxLength={200}
            rows={3}
            placeholder="Tulis detail kegiatan..."
            {...form.register("catatan")}
          />
          <span className="char-counter">{catatan.length}/200</span>
        </div>

        <div className="form-group">
          <label className="form-label">Nasabah (Opsional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Nama calon nasabah..."
            {...form.register("nasabah")}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Produk (Opsional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Nama calon nasabah..."
            {...form.register("produk")}
          />
        </div>

        <div className="sidebar-actions">
          <button type="submit" className="save-activity-btn">
            Simpan Aktivitas
          </button>
          
          {selectedActivity && (
            <button
              type="button"
              className="delete-activity-btn"
              onClick={() => onDelete(selectedActivity.id)}
            >
              Hapus
            </button>
          )}
        </div>
      </form>
    </aside>
  );
}
