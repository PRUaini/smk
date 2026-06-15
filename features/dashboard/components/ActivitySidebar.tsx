import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  ACTIVITY_POINTS,
  CLOSING_TYPES,
  DASHBOARD_END_TIME_SLOTS,
  DASHBOARD_TIME_SLOTS,
  DEFAULT_DASHBOARD_START_TIME,
  OTHER_ACTIVITY_TYPE,
  calculateActivityPoints,
  getNextDashboardTimeSlot,
  isValidDashboardTimeRange,
  shouldHideActivityExtraInfo,
} from "../constants";
import { activityFormSchema, buildActivityPayload, type ActivityFormData } from "../schemas/activity.schema";
import { Activity, ActivityType } from "../types";

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

const ACTIVITY_TYPE_LIST = Object.keys(ACTIVITY_POINTS) as ActivityType[];

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
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    values: {
      tanggal: selectedActivity?.tanggal ?? selectedDate ?? "",
      waktu: selectedActivity?.waktu ?? selectedTime ?? DEFAULT_DASHBOARD_START_TIME,
      waktuSelesai: selectedActivity?.waktuSelesai ?? getNextDashboardTimeSlot(selectedTime ?? DEFAULT_DASHBOARD_START_TIME),
      kegiatan: selectedActivity?.kegiatan ?? [],
      catatan: selectedActivity?.catatan ?? "",
      nasabah: selectedActivity?.nasabah ?? "",
      kontakNasabah: selectedActivity?.kontakNasabah ?? "",
      produk: selectedActivity?.produk ?? "",
      api: selectedActivity?.api !== undefined && selectedActivity?.api !== null ? String(selectedActivity.api) : "",
    },
  });

  const kegiatan = useWatch({ control: form.control, name: "kegiatan" }) as ActivityType[];
  const catatan = useWatch({ control: form.control, name: "catatan" });
  const waktu = useWatch({ control: form.control, name: "waktu" });
  const waktuSelesai = useWatch({ control: form.control, name: "waktuSelesai" });

  const hasClosing = kegiatan.some((k) => CLOSING_TYPES.has(k as ActivityType));
  const hideExtraInfo = shouldHideActivityExtraInfo(kegiatan);
  const totalPoints = calculateActivityPoints(kegiatan);
  const endTimeOptions = React.useMemo(
    () => DASHBOARD_END_TIME_SLOTS.filter((time) => !waktu || isValidDashboardTimeRange(waktu, time)),
    [waktu]
  );

  const toggleKegiatan = (type: ActivityType) => {
    const current = form.getValues("kegiatan") as ActivityType[];
    let updated: ActivityType[];

    if (current.includes(type)) {
      updated = current.filter((k) => k !== type);
    } else if (type === OTHER_ACTIVITY_TYPE) {
      updated = [OTHER_ACTIVITY_TYPE];
    } else {
      updated = [...current.filter((k) => k !== OTHER_ACTIVITY_TYPE), type];
    }

    form.setValue("kegiatan", updated, { shouldValidate: true });
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  React.useEffect(() => {
    if (!waktu) return;
    if (!waktuSelesai || !isValidDashboardTimeRange(waktu, waktuSelesai)) {
      form.setValue("waktuSelesai", getNextDashboardTimeSlot(waktu), { shouldValidate: true });
    }
  }, [form, waktu, waktuSelesai]);

  React.useEffect(() => {
    if (!hideExtraInfo) return;

    form.setValue("nasabah", "", { shouldValidate: true });
    form.setValue("kontakNasabah", "");
    form.setValue("produk", "");
    form.setValue("api", "");
  }, [form, hideExtraInfo]);

  const handleSubmit = (data: ActivityFormData) => {
    onSave(buildActivityPayload(data, selectedActivity?.status, selectedActivity?.id));
  };

  const triggerLabel = kegiatan.length > 0
    ? kegiatan.length <= 2
      ? kegiatan.join(", ")
      : `${kegiatan[0]} +${kegiatan.length - 1} lainnya`
    : "Pilih kegiatan...";

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
                <label className="form-label" htmlFor="activity-waktu">Waktu Mulai</label>
                <select
                  id="activity-waktu"
                  className="form-input"
                  {...form.register("waktu")}
                >
                  <option value="" disabled>Pilih Waktu Mulai</option>
                  {DASHBOARD_TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <FieldError message={form.formState.errors.waktu?.message} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="activity-waktu-selesai">Waktu Selesai</label>
                <select
                  id="activity-waktu-selesai"
                  className="form-input"
                  {...form.register("waktuSelesai")}
                >
                  <option value="" disabled>Pilih Waktu Selesai</option>
                  {endTimeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <FieldError message={form.formState.errors.waktuSelesai?.message} />
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
              <div className="multi-select-container" ref={dropdownRef}>
                <button
                  id="activity-kegiatan"
                  type="button"
                  className={`multi-select-trigger form-input ${isDropdownOpen ? "open" : ""}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className="multi-select-trigger-label">{triggerLabel}</span>
                  <svg
                    className={`multi-select-chevron ${isDropdownOpen ? "rotated" : ""}`}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="multi-select-dropdown" role="listbox" aria-label="Pilih kegiatan">
                    {ACTIVITY_TYPE_LIST.map((type) => {
                      const isChecked = kegiatan.includes(type);
                      return (
                        <label
                          key={type}
                          className={`multi-select-option ${isChecked ? "selected" : ""}`}
                          role="option"
                          aria-selected={isChecked}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleKegiatan(type)}
                            className="multi-select-checkbox"
                          />
                          <span className="multi-select-option-label">{type}</span>
                          <span className="multi-select-option-points">{ACTIVITY_POINTS[type]} poin</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <FieldError message={form.formState.errors.kegiatan?.message} />

              {kegiatan.length > 0 && (
                <div className="selected-tags-row">
                  {kegiatan.map((k) => (
                    <span key={k} className="selected-tag">
                      {k}
                      <button
                        type="button"
                        className="selected-tag-remove"
                        onClick={() => toggleKegiatan(k)}
                        aria-label={`Hapus ${k}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="activity-field-grid activity-field-grid-summary">
              <div className="form-group">
                <label className="form-label">Poin Didapat</label>
                <div className="point-badge-display">
                  <span className="point-badge-icon" aria-hidden="true">+</span>
                  <span>{totalPoints} poin</span>
                </div>
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

          {!hideExtraInfo && (
            <section className="activity-form-section" aria-labelledby="activity-extra-section">
              <div className="activity-section-heading" id="activity-extra-section">
                <SectionIcon type="info" />
                <span>Informasi Tambahan</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="activity-nasabah">Nama Nasabah</label>
                <input
                  id="activity-nasabah"
                  type="text"
                  className="form-input"
                  placeholder="Nama calon nasabah..."
                  {...form.register("nasabah")}
                />
                <FieldError message={form.formState.errors.nasabah?.message} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="activity-kontak">Kontak Nasabah (Opsional)</label>
                <input
                  id="activity-kontak"
                  type="text"
                  className="form-input"
                  placeholder="Kontak calon nasabah..."
                  {...form.register("kontakNasabah")}
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

              <div className="form-group">
                <label className="form-label" htmlFor="activity-api">
                  Annualized Premium Income (API) {hasClosing ? "(Wajib)" : "(Opsional)"}
                </label>
                <input
                  id="activity-api"
                  type="number"
                  className="form-input"
                  placeholder="Contoh: 10000000"
                  {...form.register("api")}
                />
                <FieldError message={form.formState.errors.api?.message} />
              </div>
            </section>
          )}
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
