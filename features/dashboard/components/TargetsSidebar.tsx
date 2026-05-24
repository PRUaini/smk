import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { targetsFormSchema, type TargetsFormData } from "../schemas/targets.schema";
import type { AgentTargets } from "../data/targets.repository";

interface TargetsSidebarProps {
  initialTargets: AgentTargets | null;
  onSave: (targets: Omit<AgentTargets, "kodeAgent">) => void;
  isPending: boolean;
  onClose: () => void;
  className?: string;
}

const emptyTargetValue = "" as unknown as number;

const targetFields: Array<{
  name: keyof TargetsFormData;
  label: string;
  placeholder: string;
}> = [
  { name: "targetPoints", label: "Target Poin", placeholder: "Contoh: 500" },
  { name: "targetMeetings", label: "Target Janji Pertemuan", placeholder: "Contoh: 10" },
  { name: "targetSales", label: "Target Penjualan", placeholder: "Contoh: 5" },
  { name: "targetWeeklyPoints", label: "Target Poin", placeholder: "Contoh: 125" },
  { name: "targetWeeklyMeetings", label: "Target Janji Pertemuan", placeholder: "Contoh: 3" },
  { name: "targetWeeklySales", label: "Target Penjualan", placeholder: "Contoh: 1" },
];

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
      targetPoints: initialTargets?.targetPoints ?? emptyTargetValue,
      targetMeetings: initialTargets?.targetMeetings ?? emptyTargetValue,
      targetSales: initialTargets?.targetSales ?? emptyTargetValue,
      targetWeeklyPoints: initialTargets?.targetWeeklyPoints ?? emptyTargetValue,
      targetWeeklyMeetings: initialTargets?.targetWeeklyMeetings ?? emptyTargetValue,
      targetWeeklySales: initialTargets?.targetWeeklySales ?? emptyTargetValue,
    },
  });

  const handleSubmit = (data: TargetsFormData) => {
    onSave(data);
  };

  const renderTargetField = (field: (typeof targetFields)[number]) => (
    <div className="form-group" key={field.name}>
      <label className="form-label">{field.label}</label>
      <input
        type="number"
        className="form-input"
        placeholder={field.placeholder}
        {...form.register(field.name)}
      />
      {form.formState.errors[field.name] && (
        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--color-error)", marginTop: "0.25rem", fontWeight: 500 }}>
          {form.formState.errors[field.name]?.message}
        </span>
      )}
    </div>
  );

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
        {targetFields.slice(0, 3).map(renderTargetField)}

        <h3 className="section-subtitle-targets margin-top">Target Mingguan</h3>
        {targetFields.slice(3).map(renderTargetField)}

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
