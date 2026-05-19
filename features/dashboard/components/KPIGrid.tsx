import React from "react";
import { DashboardTargets } from "../types";
import { calculatePercentage } from "../utils/percentage";

interface KPIGridProps {
  targets: DashboardTargets;
}

export default function KPIGrid({ targets }: KPIGridProps) {
  const pointPct = calculatePercentage(targets.totalPoints, targets.targetPoints);
  const meetingPct = calculatePercentage(targets.totalMeetings, targets.targetMeetings);
  const salesPct = calculatePercentage(targets.totalSales, targets.targetSales);
  const activeDaysPct = calculatePercentage(targets.activeDays, targets.totalDays);
  const weeklyPointPct = calculatePercentage(targets.totalWeeklyPoints, targets.targetWeeklyPoints);
  const weeklyMeetingPct = calculatePercentage(targets.totalWeeklyMeetings, targets.targetWeeklyMeetings);
  const weeklySalesPct = calculatePercentage(targets.totalWeeklySales, targets.targetWeeklySales);

  return (
    <div className="kpi-grid">
      {/* Total Point Card */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-icon kpi-icon-red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Total Poin Bulan Ini</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{targets.totalPoints}</span>
              <span className="kpi-target">/ target {targets.targetPoints}</span>
            </div>
          </div>
        </div>
        <div className="kpi-progress-bar-wrapper">
          <div className="kpi-progress-bar bg-red" style={{ width: `${pointPct}%` }} />
        </div>
        <div className="kpi-card-footer">
          <span>{pointPct}% Tercapai</span>
          <span className="kpi-weekly-badge">Minggu ini: {targets.totalWeeklyPoints}/{targets.targetWeeklyPoints} ({weeklyPointPct}%)</span>
        </div>
      </div>

      {/* Janji Pertemuan Card */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-icon kpi-icon-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Janji Pertemuan</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{targets.totalMeetings}</span>
              <span className="kpi-target">/ target {targets.targetMeetings}</span>
            </div>
          </div>
        </div>
        <div className="kpi-progress-bar-wrapper">
          <div className="kpi-progress-bar bg-purple" style={{ width: `${meetingPct}%` }} />
        </div>
        <div className="kpi-card-footer">
          <span>{meetingPct}% Tercapai</span>
          <span className="kpi-weekly-badge">Minggu ini: {targets.totalWeeklyMeetings}/{targets.targetWeeklyMeetings} ({weeklyMeetingPct}%)</span>
        </div>
      </div>

      {/* Penjualan Card */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-icon kpi-icon-green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill="currentColor"/>
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill="currentColor"/>
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38753 15.5583C8.75315 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Penjualan</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{targets.totalSales}</span>
              <span className="kpi-target">/ target {targets.targetSales}</span>
            </div>
          </div>
        </div>
        <div className="kpi-progress-bar-wrapper">
          <div className="kpi-progress-bar bg-green" style={{ width: `${salesPct}%` }} />
        </div>
        <div className="kpi-card-footer">
          <span>{salesPct}% Tercapai</span>
          <span className="kpi-weekly-badge">Minggu ini: {targets.totalWeeklySales}/{targets.targetWeeklySales} ({weeklySalesPct}%)</span>
        </div>
      </div>

      {/* Penyelesaian Aktivitas Card */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-icon kpi-icon-orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Penyelesaian Aktivitas</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{activeDaysPct}%</span>
              <span className="kpi-target">rata-rata bulan ini</span>
            </div>
          </div>
        </div>
        <div className="kpi-progress-bar-wrapper">
          <div className="kpi-progress-bar bg-orange" style={{ width: `${activeDaysPct}%` }} />
        </div>
        <div className="kpi-card-footer">
          <span>{targets.activeDays} dari {targets.totalDays} Hari Aktif</span>
        </div>
      </div>
    </div>
  );
}
