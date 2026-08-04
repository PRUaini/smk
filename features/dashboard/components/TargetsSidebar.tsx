import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { targetsFormSchema, type TargetsFormData } from "../schemas/targets.schema";
import type { AgentTargets } from "../data/targets.repository";
import { DEFAULT_TARGETS } from "../constants";

interface TargetsSidebarProps {
  initialTargets: AgentTargets | null;
  onSave: (targets: Omit<AgentTargets, "kodeAgent">) => void;
  isPending: boolean;
  onClose: () => void;
  className?: string;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export default function TargetsSidebar({
  initialTargets,
  onSave,
  isPending,
  onClose,
  className = "",
}: TargetsSidebarProps) {
  const [activeTab, setActiveTab] = useState<"tahunan" | "bulanan" | "mingguan">("tahunan");

  const form = useForm<TargetsFormData>({
    resolver: zodResolver(targetsFormSchema) as Resolver<TargetsFormData>,
    values: {
      targetPoints: initialTargets?.targetPoints ?? DEFAULT_TARGETS.targetPoints,
      targetMeetings: initialTargets?.targetMeetings ?? DEFAULT_TARGETS.targetMeetings,
      targetWeeklyPoints: initialTargets?.targetWeeklyPoints ?? DEFAULT_TARGETS.targetWeeklyPoints,
      targetWeeklyMeetings: initialTargets?.targetWeeklyMeetings ?? DEFAULT_TARGETS.targetWeeklyMeetings,
      targetApi: initialTargets?.targetApi ?? DEFAULT_TARGETS.targetApi,
      periodeKerjaAwal: initialTargets?.periodeKerjaAwal ?? DEFAULT_TARGETS.periodeKerjaAwal,
      periodeKerjaAkhir: initialTargets?.periodeKerjaAkhir ?? DEFAULT_TARGETS.periodeKerjaAkhir,
    },
  });

  const watchedApi = Number(useWatch({ control: form.control, name: "targetApi" }) || 0);
  const watchedPoints = Number(useWatch({ control: form.control, name: "targetPoints" }) || 0);
  const watchedMeetings = Number(useWatch({ control: form.control, name: "targetMeetings" }) || 0);
  const watchedAwal = Number(useWatch({ control: form.control, name: "periodeKerjaAwal" }) || 1);
  const watchedAkhir = Number(useWatch({ control: form.control, name: "periodeKerjaAkhir" }) || 12);

  const activeMonths = Math.max(1, watchedAkhir - watchedAwal + 1);
  const calculatedMonthlyApi = Math.round(watchedApi / activeMonths);
  const calculatedWeeklyApi = Math.round(calculatedMonthlyApi / 4);
  const yearlyPoints = watchedPoints * 12;
  const yearlyMeetings = watchedMeetings * 12;

  const handleSubmit = (data: TargetsFormData) => {
    onSave(data);
  };

  return (
    <aside className={`activity-sidebar-card ${className}`.trim()}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Edit Target Agen</h2>
        <button className="close-sidebar-btn" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="segmented-control" style={{ margin: "0 1.25rem 1rem 1.25rem" }}>
        <button
          type="button"
          className={`segmented-tab ${activeTab === "tahunan" ? "active" : ""}`}
          onClick={() => setActiveTab("tahunan")}
        >
          Tahunan
        </button>
        <button
          type="button"
          className={`segmented-tab ${activeTab === "bulanan" ? "active" : ""}`}
          onClick={() => setActiveTab("bulanan")}
        >
          Bulanan
        </button>
        <button
          type="button"
          className={`segmented-tab ${activeTab === "mingguan" ? "active" : ""}`}
          onClick={() => setActiveTab("mingguan")}
        >
          Mingguan
        </button>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="sidebar-form">
        {activeTab === "tahunan" && (
          <div className="tab-content">
            <div className="form-group">
              <label className="form-label">Target Poin Tahunan</label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 6000"
                value={yearlyPoints}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  form.setValue("targetPoints", Math.round(val / 12), { shouldValidate: true });
                }}
              />
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Target Janji Pertemuan Tahunan</label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 480"
                value={yearlyMeetings}
                onChange={(e) => {
                  const val = Number(e.target.value) || 0;
                  form.setValue("targetMeetings", Math.round(val / 12), { shouldValidate: true });
                }}
              />
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Target API Tahunan (Rp)</label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 120000000"
                {...form.register("targetApi")}
              />
              {form.formState.errors.targetApi && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>
                  {form.formState.errors.targetApi?.message}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Periode Kerja Awal</label>
              <select className="form-input" {...form.register("periodeKerjaAwal")}>
                {MONTH_NAMES.map((month, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Periode Kerja Akhir</label>
              <select className="form-input" {...form.register("periodeKerjaAkhir")}>
                {MONTH_NAMES.map((month, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {month}
                  </option>
                ))}
              </select>
              {form.formState.errors.periodeKerjaAkhir && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>
                  {form.formState.errors.periodeKerjaAkhir?.message}
                </span>
              )}
            </div>

            {/* Calculated Breakdown Summary Box */}
            <div
              style={{
                marginTop: "1.25rem",
                padding: "1rem",
                borderRadius: "0.5rem",
                backgroundColor: "var(--color-bg-secondary, rgba(0,0,0,0.03))",
                border: "1px solid var(--color-border, rgba(0,0,0,0.08))",
              }}
            >
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Rincian Pembagian Target API ({activeMonths} Bulan)
              </h4>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>
                <span>Target API Bulanan:</span>
                <strong>Rp {calculatedMonthlyApi.toLocaleString("id-ID")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span>Target API Mingguan:</span>
                <strong>Rp {calculatedWeeklyApi.toLocaleString("id-ID")}</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bulanan" && (
          <div className="tab-content">
            <div className="form-group">
              <label className="form-label">Target Poin Bulanan</label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 500"
                {...form.register("targetPoints")}
              />
              {form.formState.errors.targetPoints && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>
                  {form.formState.errors.targetPoints?.message}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Target Janji Pertemuan Bulanan</label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 40"
                {...form.register("targetMeetings")}
              />
              {form.formState.errors.targetMeetings && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>
                  {form.formState.errors.targetMeetings?.message}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Target API Bulanan (Otomatis dari Tahunan)</label>
              <input
                type="text"
                className="form-input"
                disabled
                value={`Rp ${calculatedMonthlyApi.toLocaleString("id-ID")}`}
                style={{ opacity: 0.8, backgroundColor: "var(--color-bg-secondary, rgba(0,0,0,0.03))" }}
              />
            </div>
          </div>
        )}

        {activeTab === "mingguan" && (
          <div className="tab-content">
            <div className="form-group">
              <label className="form-label">Target Poin Mingguan</label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 125"
                {...form.register("targetWeeklyPoints")}
              />
              {form.formState.errors.targetWeeklyPoints && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>
                  {form.formState.errors.targetWeeklyPoints?.message}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Target Janji Pertemuan Mingguan</label>
              <input
                type="number"
                className="form-input"
                placeholder="Contoh: 10"
                {...form.register("targetWeeklyMeetings")}
              />
              {form.formState.errors.targetWeeklyMeetings && (
                <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>
                  {form.formState.errors.targetWeeklyMeetings?.message}
                </span>
              )}
            </div>

            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Target API Mingguan (Otomatis dari Bulanan)</label>
              <input
                type="text"
                className="form-input"
                disabled
                value={`Rp ${calculatedWeeklyApi.toLocaleString("id-ID")}`}
                style={{ opacity: 0.8, backgroundColor: "var(--color-bg-secondary, rgba(0,0,0,0.03))" }}
              />
            </div>
          </div>
        )}

        <div className="sidebar-action-buttons" style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            className="target-sidebar-btn-secondary flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            Batal
          </button>
          <button
            type="submit"
            className="target-sidebar-btn-primary flex-1"
            disabled={isPending}
          >
            {isPending ? "Menyimpan..." : "Simpan Target"}
          </button>
        </div>
      </form>
    </aside>
  );
}
