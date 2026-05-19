import React from "react";
import { DashboardTargets } from "../types";
import { calculatePercentage } from "../utils/percentage";

interface FooterSummaryProps {
  targets: DashboardTargets;
}

export default function FooterSummary({ targets }: FooterSummaryProps) {
  const percentage = calculatePercentage(targets.totalPoints, targets.targetPoints);
  
  // Calculate average points per day based on totalPoints divided by activeDays (or default to 0 if 0 active days)
  const averagePoints = targets.activeDays 
    ? (targets.totalPoints / targets.activeDays).toFixed(1) 
    : "0";

  return (
    <div className="dashboard-footer-summary">
      <div className="footer-summary-left">
        <div className="footer-target-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
        </div>

        <div className="summary-section">
          <span className="summary-title">Sasaran Bulan Ini</span>
          <div className="summary-stats-row">
            <div className="stat-sub-item">
              <span className="label">Target Poin</span>
              <span className="val">{targets.targetPoints}</span>
            </div>
            <div className="stat-sub-item">
              <span className="label">Total Poin</span>
              <span className="val highlight-red">{targets.totalPoints}</span>
            </div>
            <div className="summary-progress-wrapper">
              <div className="summary-progress-bar-bg">
                <div className="summary-progress-bar" style={{ width: `${percentage}%` }} />
              </div>
              <span className="summary-pct-label">{percentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-summary-right">
        <div className="metrics-summary-item">
          <span className="metric-label">Rata-rata Poin per Hari</span>
          <span className="metric-value">{averagePoints} <span className="unit">poin</span></span>
        </div>

        <div className="metrics-summary-item">
          <span className="metric-label">Hari Aktif</span>
          <span className="metric-value">
            {targets.activeDays} <span className="slash">/</span> {targets.totalDays} <span className="unit">hari</span>
          </span>
        </div>

        <button className="monthly-report-btn">
          <span>Lihat Laporan Bulanan</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
