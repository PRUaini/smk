import React, { useState, useEffect } from "react";
import { Activity, ActivityType, ActivityStatus } from "../types";

interface ActivitySidebarProps {
  selectedActivity: Activity | null;
  selectedDate: string | null;
  selectedTime: string | null;
  onSave: (activity: Omit<Activity, "id"> & { id?: string }) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const activityPointsMap: Record<ActivityType, number> = {
  "Pendekatan": 1,
  "Pertemuan": 2,
  "Pencarian Fakta": 2,
  "Mendapatkan 3 Referensi": 4,
  "Wawancara Penutupan": 4,
  "Penjualan": 1,
  "Penyerahan Polis/Layanan": 1,
};

const activityDescriptions: Record<ActivityType, string> = {
  "Pendekatan": "Melakukan pendekatan awal dengan calon nasabah",
  "Pertemuan": "Melakukan pertemuan atau janji temu dengan nasabah",
  "Pencarian Fakta": "Menggali kebutuhan dan potensi nasabah",
  "Mendapatkan 3 Referensi": "Meminta referensi dari nasabah atau kontak terkait",
  "Wawancara Penutupan": "Melakukan wawancara untuk penutupan polis",
  "Penjualan": "Melakukan penjualan atau presentasi produk",
  "Penyerahan Polis/Layanan": "Menyerahkan polis atau memberikan layanan kepada nasabah",
};

export default function ActivitySidebar({
  selectedActivity,
  selectedDate,
  selectedTime,
  onSave,
  onDelete,
  onClose,
}: ActivitySidebarProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [kegiatan, setKegiatan] = useState<ActivityType>("Pendekatan");
  const [status, setStatus] = useState<ActivityStatus>("Belum");
  const [catatan, setCatatan] = useState("");
  const [nasabah, setNasabah] = useState("");

  // Sync state with selected props
  useEffect(() => {
    if (selectedActivity) {
      setDate(selectedActivity.tanggal);
      setTime(selectedActivity.waktu);
      setKegiatan(selectedActivity.kegiatan);
      setStatus(selectedActivity.status);
      setCatatan(selectedActivity.catatan);
      setNasabah(selectedActivity.nasabah);
    } else {
      setDate(selectedDate || "");
      setTime(selectedTime || "");
      setKegiatan("Pendekatan");
      setStatus("Belum");
      setCatatan("");
      setNasabah("");
    }
  }, [selectedActivity, selectedDate, selectedTime]);

  const handleKegiatanChange = (value: ActivityType) => {
    setKegiatan(value);
    // Populate default description if note is empty
    if (!catatan || Object.values(activityDescriptions).includes(catatan)) {
      setCatatan(activityDescriptions[value]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    onSave({
      id: selectedActivity?.id,
      tanggal: date,
      waktu: time,
      kegiatan,
      poin: activityPointsMap[kegiatan],
      status,
      catatan: catatan || activityDescriptions[kegiatan],
      nasabah,
    });
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

      <form onSubmit={handleSubmit} className="sidebar-form">
        {/* Tanggal */}
        <div className="form-group">
          <label className="form-label">Tanggal</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Waktu */}
        <div className="form-group">
          <label className="form-label">Waktu</label>
          <select
            className="form-input"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          >
            <option value="" disabled>Pilih Waktu</option>
            {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Kegiatan */}
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

        {/* Poin Indicator */}
        <div className="form-group">
          <label className="form-label">Poin Didapat</label>
          <div className="point-badge-display">
            {activityPointsMap[kegiatan]} poin
          </div>
        </div>

        {/* Status */}
        <div className="form-group">
          <label className="form-label">Status</label>
          <div className="status-radio-group">
            {(["Selesai", "Proses", "Belum"] as ActivityStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`status-select-btn ${s.toLowerCase()} ${status === s ? "active" : ""}`}
                onClick={() => setStatus(s)}
              >
                <span className="dot" />
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Catatan */}
        <div className="form-group">
          <label className="form-label">Catatan</label>
          <textarea
            className="form-textarea"
            maxLength={200}
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Tulis detail kegiatan..."
          />
          <span className="char-counter">{catatan.length}/200</span>
        </div>

        {/* Nasabah */}
        <div className="form-group">
          <label className="form-label">Nasabah (Opsional)</label>
          <input
            type="text"
            className="form-input"
            value={nasabah}
            onChange={(e) => setNasabah(e.target.value)}
            placeholder="Nama calon nasabah..."
          />
        </div>

        {/* Action Buttons */}
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
