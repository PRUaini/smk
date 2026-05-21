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
      targetPoints: initialTargets?.targetPoints ?? DEFAULT_TARGETS.targetPoints,
      targetMeetings: initialTargets?.targetMeetings ?? DEFAULT_TARGETS.targetMeetings,
      targetSales: initialTargets?.targetSales ?? DEFAULT_TARGETS.targetSales,
      targetWeeklyPoints: initialTargets?.targetWeeklyPoints ?? DEFAULT_TARGETS.targetWeeklyPoints,
      targetWeeklyMeetings: initialTargets?.targetWeeklyMeetings ?? DEFAULT_TARGETS.targetWeeklyMeetings,
      targetWeeklySales: initialTargets?.targetWeeklySales ?? DEFAULT_TARGETS.targetWeeklySales,
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
            {...form.register("targetPoints")}
          />
          {form.formState.errors.targetPoints && (
            <span className="form-error-msg">{form.formState.errors.targetPoints.message}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Target Janji Pertemuan</label>
          <input
            type="number"
            className="form-input"
            {...form.register("targetMeetings")}
          />
          {form.formState.errors.targetMeetings && (
            <span className="form-error-msg">{form.formState.errors.targetMeetings.message}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Target Penjualan</label>
          <input
            type="number"
            className="form-input"
            {...form.register("targetSales")}
          />
          {form.formState.errors.targetSales && (
            <span className="form-error-msg">{form.formState.errors.targetSales.message}</span>
          )}
        </div>

        <h3 className="section-subtitle-targets margin-top">Target Mingguan</h3>

        <div className="form-group">
          <label className="form-label">Target Poin</label>
          <input
            type="number"
            className="form-input"
            {...form.register("targetWeeklyPoints")}
          />
          {form.formState.errors.targetWeeklyPoints && (
            <span className="form-error-msg">{form.formState.errors.targetWeeklyPoints.message}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Target Janji Pertemuan</label>
          <input
            type="number"
            className="form-input"
            {...form.register("targetWeeklyMeetings")}
          />
          {form.formState.errors.targetWeeklyMeetings && (
            <span className="form-error-msg">{form.formState.errors.targetWeeklyMeetings.message}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Target Penjualan</label>
          <input
            type="number"
            className="form-input"
            {...form.register("targetWeeklySales")}
          />
          {form.formState.errors.targetWeeklySales && (
            <span className="form-error-msg">{form.formState.errors.targetWeeklySales.message}</span>
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
