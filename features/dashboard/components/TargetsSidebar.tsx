import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { DEFAULT_TARGETS } from "../constants";
import { targetsFormSchema, type TargetsFormData } from "../schemas/targets.schema";
import type { AgentTargets } from "../data/targets.repository";

interface TargetsSidebarProps {
  initialTargets: AgentTargets | null;
  onSave: (targets: Omit<AgentTargets, "kodeAgent">) => void;
  isPending: boolean;
  onClose: () => void;
  className?: string;
}

export default function TargetsSidebar({
  initialTargets,
  onSave,
  isPending,
  onClose,
  className = "",
}: TargetsSidebarProps) {
  const form = useForm<TargetsFormData>({
    resolver: zodResolver(targetsFormSchema) as Resolver<TargetsFormData>,
    values: {
      targetPoints: initialTargets?.targetPoints ?? ("" as any),
      targetMeetings: initialTargets?.targetMeetings ?? ("" as any),
      targetSales: initialTargets?.targetSales ?? ("" as any),
      targetWeeklyPoints: initialTargets?.targetWeeklyPoints ?? ("" as any),
      targetWeeklyMeetings: initialTargets?.targetWeeklyMeetings ?? ("" as any),
      targetWeeklySales: initialTargets?.targetWeeklySales ?? ("" as any),
    },
  });

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

      <form onSubmit={form.handleSubmit(handleSubmit)} className="sidebar-form">
        <h3 className="section-subtitle-targets">Target Bulanan</h3>
        
        <div className="form-group">
          <label className="form-label">Target Poin</label>
          <input
            type="number"
            className="form-input"
            placeholder="Contoh: 500"
            {...form.register("targetPoints")}
          />
          {form.formState.errors.targetPoints && (
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>{form.formState.errors.targetPoints.message}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Target Janji Pertemuan</label>
          <input
            type="number"
            className="form-input"
            placeholder="Contoh: 10"
            {...form.register("targetMeetings")}
          />
          {form.formState.errors.targetMeetings && (
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>{form.formState.errors.targetMeetings.message}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Target Penjualan</label>
          <input
            type="number"
            className="form-input"
            placeholder="Contoh: 5"
            {...form.register("targetSales")}
          />
          {form.formState.errors.targetSales && (
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>{form.formState.errors.targetSales.message}</span>
          )}
        </div>

        <h3 className="section-subtitle-targets margin-top">Target Mingguan</h3>

        <div className="form-group">
          <label className="form-label">Target Poin</label>
          <input
            type="number"
            className="form-input"
            placeholder="Contoh: 125"
            {...form.register("targetWeeklyPoints")}
          />
          {form.formState.errors.targetWeeklyPoints && (
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>{form.formState.errors.targetWeeklyPoints.message}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Target Janji Pertemuan</label>
          <input
            type="number"
            className="form-input"
            placeholder="Contoh: 3"
            {...form.register("targetWeeklyMeetings")}
          />
          {form.formState.errors.targetWeeklyMeetings && (
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>{form.formState.errors.targetWeeklyMeetings.message}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Target Penjualan</label>
          <input
            type="number"
            className="form-input"
            placeholder="Contoh: 1"
            {...form.register("targetWeeklySales")}
          />
          {form.formState.errors.targetWeeklySales && (
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>{form.formState.errors.targetWeeklySales.message}</span>
          )}
        </div>

        <div className="sidebar-action-buttons">
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
