import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ACTIVITY_POINTS, DASHBOARD_TIME_SLOTS } from "../constants";
import { activityFormSchema, buildActivityPayload, type ActivityFormData } from "../schemas/activity.schema";
import { Activity, ActivityStatus, ActivityType } from "../types";

type SectionIconType = "time" | "detail" | "info";

interface ActivitySidebarProps {
  selectedActivity: Activity | null;
  selectedDate: string | null;
  selectedTime: string | null;
  onSave: (activity: Omit<Activity, "id"> & { id?: string }) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
  onClose: () => void;
  className?: string;
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="activity-field-error">{message}</span> : null;
}

function SectionIcon({ type }: { type: SectionIconType }) {
  if (type === "time") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "detail") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l2.5 5.1 5.6.8-4 3.9.9 5.5-5-2.6-5 2.6.9-5.5-4-3.9 5.6-.8L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function ActivitySidebar({
  selectedActivity,
  selectedDate,
  selectedTime,
  onSave,
  onDelete,
  isPending,
  onClose,
  className = "",
}: ActivitySidebarProps) {
  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    values: {
      tanggal: selectedActivity?.tanggal ?? selectedDate ?? "",
      waktu: selectedActivity?.waktu ?? selectedTime ?? "08:00",
      kegiatan: selectedActivity?.kegiatan ?? "Pendekatan",
      status: selectedActivity?.status ?? "Belum",
      catatan: selectedActivity?.catatan ?? "",
      nasabah: selectedActivity?.nasabah ?? "",
      produk: selectedActivity?.produk ?? "",
      api: selectedActivity?.api !== undefined && selectedActivity?.api !== null ? String(selectedActivity.api) : "",
    },
  });

  const kegiatan = useWatch({ control: form.control, name: "kegiatan" });
  const status = useWatch({ control: form.control, name: "status" });
  const catatan = useWatch({ control: form.control, name: "catatan" });

  const handleKegiatanChange = (value: ActivityType) => {
    form.setValue("kegiatan", value, { shouldValidate: true });
  };

  const handleSubmit = (data: ActivityFormData) => {
    onSave(buildActivityPayload(data, selectedActivity?.id));
  };

  return (
    <aside className={`activity-sidebar-card activity-drawer-panel ${className}`.trim()}>
      <div className="sidebar-header">
        <div>
          <h2 className="sidebar-title">
            {selectedActivity ? "Edit Aktivitas" : "Tambah Aktivitas"}
          </h2>
          <p className="sidebar-subtitle">Isi detail kegiatan harian Anda</p>
        </div>
        <button className="close-sidebar-btn" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="sidebar-form">
        <div className="sidebar-form-body">
          <section className="activity-form-section" aria-labelledby="activity-time-section">
            <div className="activity-section-heading" id="activity-time-section">
              <SectionIcon type="time" />
              <span>Informasi Waktu</span>
            </div>

            <div className="activity-field-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="activity-tanggal">Tanggal</label>
                <input
                  id="activity-tanggal"
                  type="date"
                  className="form-input"
                  {...form.register("tanggal")}
                />
                <FieldError message={form.formState.errors.tanggal?.message} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="activity-waktu">Waktu</label>
                <select
                  id="activity-waktu"
                  className="form-input"
                  {...form.register("waktu")}
                >
                  <option value="" disabled>Pilih Waktu</option>
                  {DASHBOARD_TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <FieldError message={form.formState.errors.waktu?.message} />
              </div>
            </div>
          </section>

          <section className="activity-form-section" aria-labelledby="activity-detail-section">
            <div className="activity-section-heading" id="activity-detail-section">
              <SectionIcon type="detail" />
              <span>Detail Aktivitas</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="activity-kegiatan">Kegiatan</label>
              <select
                id="activity-kegiatan"
                className="form-input"
                value={kegiatan}
                onChange={(e) => handleKegiatanChange(e.target.value as ActivityType)}
              >
                <option value="Pendekatan">Pendekatan (1 poin)</option>
                <option value="Pertemuan">Pertemuan (2 poin)</option>
                <option value="Fact Finding">Fact Finding (2 poin)</option>
                <option value="Mendapatkan 3 Referensi">Mendapatkan 3 Referensi (4 poin)</option>
                <option value="Wawancara Penutupan">Wawancara Penutupan (4 poin)</option>
                <option value="Penjualan / Closing">Penjualan / Closing (1 poin)</option>
                <option value="Penyerahan Polis / Servicing">Penyerahan Polis / Servicing (1 poin)</option>
              </select>
              <FieldError message={form.formState.errors.kegiatan?.message} />
            </div>

            <div className="activity-field-grid activity-field-grid-summary">
              <div className="form-group">
                <label className="form-label">Poin Didapat</label>
                <div className="point-badge-display">
                  <span className="point-badge-icon" aria-hidden="true">+</span>
                  <span>{ACTIVITY_POINTS[kegiatan]} poin</span>
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
                <FieldError message={form.formState.errors.status?.message} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="activity-catatan">Catatan</label>
              <div className="textarea-wrap">
                <textarea
                  id="activity-catatan"
                  className="form-textarea"
                  maxLength={200}
                  rows={4}
                  placeholder="Tulis detail kegiatan..."
                  {...form.register("catatan")}
                />
                <span className="char-counter">{catatan.length}/200</span>
              </div>
              <FieldError message={form.formState.errors.catatan?.message} />
            </div>
          </section>

          <section className="activity-form-section" aria-labelledby="activity-extra-section">
            <div className="activity-section-heading" id="activity-extra-section">
              <SectionIcon type="info" />
              <span>Informasi Tambahan</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="activity-nasabah">Nasabah (Opsional)</label>
              <input
                id="activity-nasabah"
                type="text"
                className="form-input"
                placeholder="Nama calon nasabah..."
                {...form.register("nasabah")}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="activity-kontak">Kontak Nasabah (Opsional)</label>
              <input
                id="activity-nasabah"
                type="text"
                className="form-input"
                placeholder="Kontak calon nasabah..."
                {...form.register("nasabah")}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="activity-produk">Produk (Opsional)</label>
              <input
                id="activity-produk"
                type="text"
                className="form-input"
                placeholder="Nama produk..."
                {...form.register("produk")}
              />
            </div>

            {kegiatan === "Penjualan / Closing" && (
              <div className="form-group">
                <label className="form-label" htmlFor="activity-api">Annualized Premium Income (API) (Opsional)</label>
                <input
                  id="activity-api"
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 10000000"
                  {...form.register("api")}
                />
                <FieldError message={form.formState.errors.api?.message} />
              </div>
            )}
          </section>
        </div>

        <div className="sidebar-actions">
          <button type="submit" className="save-activity-btn" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Aktivitas"}
          </button>

          {selectedActivity && (
            <button
              type="button"
              className="delete-activity-btn"
              disabled={isPending}
              onClick={() => onDelete(selectedActivity.id)}
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </button>
          )}
        </div>
      </form>
    </aside>
  );
}
