import React from "react";
import { DashboardTargets } from "../types";
import { calculatePercentage } from "../utils/percentage";

interface KPIGridProps {
  targets: DashboardTargets;
}

export default function KPIGrid({ targets }: KPIGridProps) {
  const pointPct = calculatePercentage(targets.totalPoints, targets.targetPoints);
  const meetingPct = calculatePercentage(targets.totalMeetings, targets.targetMeetings);
  const weeklyPointPct = calculatePercentage(targets.totalWeeklyPoints, targets.targetWeeklyPoints);
  const weeklyMeetingPct = calculatePercentage(targets.totalWeeklyMeetings, targets.targetWeeklyMeetings);

  const remainingMonthlyApi = Math.max(0, targets.targetApiBulanan - targets.totalApi);
  const apiPct = calculatePercentage(targets.totalApi, targets.targetApiBulanan);
  const weeklyApiPct = calculatePercentage(targets.totalWeeklyApi, targets.targetApiMingguan);

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
            <span className="kpi-label">Total Poin</span>
            <div className="kpi-value-row">
              <span className="kpi-value">{targets.totalPoints}</span>
              <span className="kpi-target">dari target {targets.targetPoints}</span>
            </div>
          </div>
        </div>
        <div className="kpi-progress-bar-wrapper">
          <div className="kpi-progress-bar bg-red" style={{ width: `${pointPct}%` }} />
        </div>
        <div className="kpi-card-footer">
          <span>{pointPct}% Tercapai</span>
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
              <span className="kpi-target">dari target {targets.targetMeetings}</span>
            </div>
          </div>
        </div>
        <div className="kpi-progress-bar-wrapper">
          <div className="kpi-progress-bar bg-purple" style={{ width: `${meetingPct}%` }} />
        </div>
        <div className="kpi-card-footer">
          <span>{meetingPct}% Tercapai</span>
        </div>
      </div>

      {/* Target API Card */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <div className="kpi-icon kpi-icon-orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.2 7.7 7.8 8 8.3C5.5 9.5 4 12.2 4 15.5C4 19 7.5 22 12 22C16.5 22 20 19 20 15.5C20 12.2 18.5 9.5 16 8.3C16.3 7.8 16.5 7.2 16.5 6.5C16.5 4 14.5 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 9.5C9.2 9.2 10.6 9 12 9C13.4 9 14.8 9.2 16 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <text x="12" y="17" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">Rp</text>
            </svg>
          </div>
          <div className="kpi-meta">
            <span className="kpi-label">Sisa Target API Bulanan</span>
            <div className="kpi-value-row-stacked">
              <span className="kpi-value">Rp {remainingMonthlyApi.toLocaleString("id-ID")}</span>
              <span className="kpi-target-label">dari target Rp {targets.targetApiBulanan.toLocaleString("id-ID")}</span>
            </div>
          </div>
        </div>
        <div className="kpi-progress-bar-wrapper">
          <div className="kpi-progress-bar bg-orange" style={{ width: `${apiPct}%` }} />
        </div>
        <div className="kpi-card-footer">
          <span>Total API Terkumpul: Rp {targets.totalApi.toLocaleString("id-ID")} ({apiPct}% Tercapai)</span>
        </div>
      </div>
    </div>
  );
}
