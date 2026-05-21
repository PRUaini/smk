import React, { useState, useMemo } from "react";
import { Activity, DashboardTargets } from "../types";
import { calculatePercentage } from "../utils/percentage";

interface LaporanAktivitasProps {
  targets: DashboardTargets;
  activities: Activity[];
  selectedMonth: number; // 0-indexed
}

export default function LaporanAktivitas({ targets, activities, selectedMonth }: LaporanAktivitasProps) {
  const currentYear = new Date().getFullYear();
  const monthsAbbr = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agt", "Sep", "Okt", "Nov", "Des"
  ];
  const monthLabel = monthsAbbr[selectedMonth];

  // Interactive Filter States
  const [dailyFilter, setDailyFilter] = useState<"harian" | "bulanan" | "tahunan">("harian");
  const [barFilter, setBarFilter] = useState<"bulan" | "tahun">("bulan");
  const [isDailyMenuOpen, setIsDailyMenuOpen] = useState(false);
  const [isBarMenuOpen, setIsBarMenuOpen] = useState(false);

  // Calculate percentages (monthly)
  const pointPct = calculatePercentage(targets.totalPoints, targets.targetPoints);
  const meetingPct = calculatePercentage(targets.totalMeetings, targets.targetMeetings);
  const salesPct = calculatePercentage(targets.totalSales, targets.targetSales);
  const activeDaysPct = calculatePercentage(targets.activeDays, targets.totalDays);
  
  const weeklyPointPct = calculatePercentage(targets.totalWeeklyPoints, targets.targetWeeklyPoints);
  const weeklyMeetingPct = calculatePercentage(targets.totalWeeklyMeetings, targets.targetWeeklyMeetings);
  const weeklySalesPct = calculatePercentage(targets.totalWeeklySales, targets.targetWeeklySales);

  // 1. Day-to-day (Daily points in selected month)
  const dailyData = useMemo(() => {
    const data = [];
    for (let d = 1; d <= targets.totalDays; d++) {
      const dateString = `${currentYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayActivities = activities.filter(
        (act) => act.tanggal === dateString && act.status === "Selesai"
      );
      const points = dayActivities.reduce((sum, act) => sum + act.poin, 0);
      data.push({ day: d, points });
    }
    return data;
  }, [activities, selectedMonth, targets.totalDays, currentYear]);

  // 2. Month-per-month (Monthly points in current year)
  const monthlyData = useMemo(() => {
    const data = [];
    for (let m = 0; m < 12; m++) {
      const monthActivities = activities.filter((act) => {
        const actDate = new Date(`${act.tanggal}T00:00:00`);
        return actDate.getFullYear() === currentYear && actDate.getMonth() === m && act.status === "Selesai";
      });
      const points = monthActivities.reduce((sum, act) => sum + act.poin, 0);
      data.push({ month: m, points });
    }
    return data;
  }, [activities, currentYear]);

  // 3. Year-to-year (Yearly points)
  const yearlyData = useMemo(() => {
    const data = [];
    const targetRangeYears = [currentYear - 2, currentYear - 1, currentYear];
    for (const yr of targetRangeYears) {
      const yearActivities = activities.filter((act) => {
        const actDate = new Date(`${act.tanggal}T00:00:00`);
        return actDate.getFullYear() === yr && act.status === "Selesai";
      });
      const points = yearActivities.reduce((sum, act) => sum + act.poin, 0);
      data.push({ year: yr, points });
    }
    return data;
  }, [activities, currentYear]);

  // Yearly target parameters (aggregated compare)
  const yearlyTargetData = useMemo(() => {
    const yearActivities = activities.filter((act) => {
      const actDate = new Date(`${act.tanggal}T00:00:00`);
      return actDate.getFullYear() === currentYear && act.status === "Selesai";
    });

    const MEETING_TYPES = new Set(["Pertemuan", "Wawancara Penutupan"]);
    const yearMeetings = yearActivities.filter((act) => MEETING_TYPES.has(act.kegiatan)).length;
    const yearSales = yearActivities.filter((act) => act.kegiatan === "Penjualan / Closing").length;
    const yearPoints = yearActivities.reduce((sum, act) => sum + act.poin, 0);
    const yearActiveDays = new Set(yearActivities.map((act) => act.tanggal)).size;

    const targetPointsYr = targets.targetPoints * 12;
    const targetMeetingsYr = targets.targetMeetings * 12;
    const targetSalesYr = targets.targetSales * 12;
    const targetActiveDaysYr = 150; // Reference target for a year

    return {
      pointPct: calculatePercentage(yearPoints, targetPointsYr),
      meetingPct: calculatePercentage(yearMeetings, targetMeetingsYr),
      salesPct: calculatePercentage(yearSales, targetSalesYr),
      activeDaysPct: calculatePercentage(yearActiveDays, targetActiveDaysYr)
    };
  }, [activities, currentYear, targets]);

  // Select dynamic display metrics for the target comparisons chart
  const activePointPct = barFilter === "bulan" ? pointPct : yearlyTargetData.pointPct;
  const activeMeetingPct = barFilter === "bulan" ? meetingPct : yearlyTargetData.meetingPct;
  const activeSalesPct = barFilter === "bulan" ? salesPct : yearlyTargetData.salesPct;
  const activeDaysPctForBar = barFilter === "bulan" ? activeDaysPct : yearlyTargetData.activeDaysPct;

  // Compute cumulative points (monthly cumulative)
  const cumulativeData = useMemo(() => {
    let runningSum = 0;
    return dailyData.map((d) => {
      runningSum += d.points;
      return { day: d.day, points: runningSum };
    });
  }, [dailyData]);

  // SVG dimensions & scales for Tren Poin Harian
  const dailyChartSvg = useMemo(() => {
    const width = 600;
    const height = 220;
    const padding = { top: 20, right: 20, bottom: 35, left: 40 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    let dataset: { label: string; points: number }[] = [];
    if (dailyFilter === "harian") {
      dataset = dailyData.map((d) => ({
        label: `${d.day} ${monthLabel}`,
        points: d.points
      }));
    } else if (dailyFilter === "bulanan") {
      dataset = monthlyData.map((m) => ({
        label: monthsAbbr[m.month],
        points: m.points
      }));
    } else {
      dataset = yearlyData.map((y) => ({
        label: String(y.year),
        points: y.points
      }));
    }
    
    const maxVal = Math.max(100, ...dataset.map((d) => d.points));
    
    // Points coordinates
    const points = dataset.map((d, index) => {
      const x = padding.left + (index / Math.max(1, dataset.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (d.points / maxVal) * chartHeight;
      return { x, y, label: d.label, val: d.points };
    });

    // Generate Path Data
    let linePath = "";
    let areaPath = "";
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
      areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
    }

    // Grid lines (y values)
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const val = Math.round(ratio * maxVal);
      const y = padding.top + chartHeight - ratio * chartHeight;
      return { y, label: val };
    });

    // X axis labels
    const xLabels = [];
    if (dailyFilter === "harian") {
      const interval = 5;
      for (let i = 0; i < dataset.length; i += interval) {
        xLabels.push({ x: points[i].x, label: points[i].label });
      }
      if ((dataset.length - 1) % interval !== 0) {
        const lastIndex = dataset.length - 1;
        xLabels.push({ x: points[lastIndex].x, label: points[lastIndex].label });
      }
    } else if (dailyFilter === "bulanan") {
      // Show every month name
      for (let i = 0; i < dataset.length; i++) {
        xLabels.push({ x: points[i].x, label: points[i].label });
      }
    } else {
      // Show years
      for (let i = 0; i < dataset.length; i++) {
        xLabels.push({ x: points[i].x, label: points[i].label });
      }
    }

    return { width, height, points, linePath, areaPath, gridLines, xLabels };
  }, [dailyFilter, dailyData, monthlyData, yearlyData, monthLabel, monthsAbbr]);

  // SVG dimensions & scales for Akumulasi Poin
  const cumulativeChartSvg = useMemo(() => {
    const width = 500;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxVal = Math.max(targets.targetPoints, 100, ...cumulativeData.map((d) => d.points));
    
    // Points coordinates
    const points = cumulativeData.map((d, index) => {
      const x = padding.left + (index / (cumulativeData.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (d.points / maxVal) * chartHeight;
      return { x, y, day: d.day, val: d.points };
    });

    // Generate Path Data
    let linePath = "";
    let areaPath = "";
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
      areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
    }

    // Target Line Y Coordinate
    const targetY = padding.top + chartHeight - (targets.targetPoints / maxVal) * chartHeight;

    // Grid lines (y values)
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const val = Math.round(ratio * maxVal);
      const y = padding.top + chartHeight - ratio * chartHeight;
      return { y, label: val };
    });

    // X axis labels (1st, 6th, 11th, 16th, 21st, 26th, 31st)
    const xLabels = [];
    const interval = 5;
    for (let i = 0; i < cumulativeData.length; i += interval) {
      xLabels.push({
        x: points[i].x,
        label: `${cumulativeData[i].day} ${monthLabel}`
      });
    }
    if ((cumulativeData.length - 1) % interval !== 0) {
      const lastIndex = cumulativeData.length - 1;
      xLabels.push({
        x: points[lastIndex].x,
        label: `${cumulativeData[lastIndex].day} ${monthLabel}`
      });
    }

    return { width, height, points, linePath, areaPath, gridLines, xLabels, targetY };
  }, [cumulativeData, targets.targetPoints, monthLabel]);

  // Average points per day calculation
  const averagePoints = targets.activeDays 
    ? (targets.totalPoints / targets.activeDays).toFixed(1) 
    : "0";

  // Circular gauge config
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, pointPct) / 100) * circumference;

  return (
    <div className="laporan-aktivitas-wrapper">
      {/* 4 KPI Cards */}
      <div className="kpi-grid">
        {/* Total Poin Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon kpi-icon-red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="kpi-meta">
              <span className="kpi-label">TOTAL POIN BULAN INI</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{targets.totalPoints}</span>
                <span className="kpi-target">/ target {targets.targetPoints}</span>
              </div>
            </div>
          </div>
          <div className="kpi-progress-bar-wrapper">
            <div className="kpi-progress-bar bg-red" style={{ width: `${Math.min(100, pointPct)}%` }} />
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-pct-attained">{pointPct}% Tercapai</span>
            <span className="kpi-weekly-badge">Minggu ini: {targets.totalWeeklyPoints}/{targets.targetWeeklyPoints} ({weeklyPointPct}%)</span>
          </div>
        </div>

        {/* Janji Pertemuan Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon kpi-icon-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="kpi-meta">
              <span className="kpi-label">JANJI PERTEMUAN</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{targets.totalMeetings}</span>
                <span className="kpi-target">/ target {targets.targetMeetings}</span>
              </div>
            </div>
          </div>
          <div className="kpi-progress-bar-wrapper">
            <div className="kpi-progress-bar bg-purple" style={{ width: `${Math.min(100, meetingPct)}%` }} />
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-pct-attained">{meetingPct}% Tercapai</span>
            <span className="kpi-weekly-badge">Minggu ini: {targets.totalWeeklyMeetings}/{targets.targetWeeklyMeetings} ({weeklyMeetingPct}%)</span>
          </div>
        </div>

        {/* Penjualan Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon kpi-icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="kpi-meta">
              <span className="kpi-label">PENJUALAN</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{targets.totalSales}</span>
                <span className="kpi-target">/ target {targets.targetSales}</span>
              </div>
            </div>
          </div>
          <div className="kpi-progress-bar-wrapper">
            <div className="kpi-progress-bar bg-green" style={{ width: `${Math.min(100, salesPct)}%` }} />
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-pct-attained">{salesPct}% Tercapai</span>
            <span className="kpi-weekly-badge">Minggu ini: {targets.totalWeeklySales}/{targets.targetWeeklySales} ({weeklySalesPct}%)</span>
          </div>
        </div>

        {/* Penyelesaian Aktivitas Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon kpi-icon-orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="kpi-meta">
              <span className="kpi-label">PENYELESAIAN AKTIVITAS</span>
              <div className="kpi-value-row-stacked">
                <span className="kpi-value">{activeDaysPct}%</span>
                <span className="kpi-target-label">rata-rata bulan ini</span>
              </div>
            </div>
          </div>
          <div className="kpi-progress-bar-wrapper">
            <div className="kpi-progress-bar bg-orange" style={{ width: `${Math.min(100, activeDaysPct)}%` }} />
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-pct-attained">{targets.activeDays} dari {targets.totalDays} Hari Aktif</span>
          </div>
        </div>
      </div>

      {/* Charts Layout Row */}
      <div className="charts-double-row">
        {/* Line Chart Card */}
        <div className="report-chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Tren Poin Harian</h3>
            <div className="chart-filter-select-wrapper">
              <div className="chart-filter-select" onClick={(e) => { e.stopPropagation(); setIsDailyMenuOpen(!isDailyMenuOpen); }}>
                <span>{dailyFilter === "harian" ? "Harian" : dailyFilter === "bulanan" ? "Bulanan" : "Tahunan"}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              {isDailyMenuOpen && (
                <div className="filter-dropdown-menu">
                  <div className={`filter-option ${dailyFilter === "harian" ? "active" : ""}`} onClick={() => { setDailyFilter("harian"); setIsDailyMenuOpen(false); }}>Harian</div>
                  <div className={`filter-option ${dailyFilter === "bulanan" ? "active" : ""}`} onClick={() => { setDailyFilter("bulanan"); setIsDailyMenuOpen(false); }}>Bulanan</div>
                  <div className={`filter-option ${dailyFilter === "tahunan" ? "active" : ""}`} onClick={() => { setDailyFilter("tahunan"); setIsDailyMenuOpen(false); }}>Tahunan</div>
                </div>
              )}
            </div>
          </div>

          <div className="chart-body">
            <div className="chart-legend-simple">
              <span className="legend-dot bg-red" />
              <span className="legend-label">Poin</span>
            </div>

            <div className="chart-container-svg">
              <svg viewBox={`0 0 ${dailyChartSvg.width} ${dailyChartSvg.height}`} width="100%" height="100%">
                <defs>
                  <linearGradient id="redAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(239, 68, 68, 0.2)" />
                    <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {dailyChartSvg.gridLines.map((line, index) => (
                  <g key={index}>
                    <line
                      x1="40"
                      y1={line.y}
                      x2="580"
                      y2={line.y}
                      stroke="rgba(0,0,0,0.06)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x="32"
                      y={line.y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="var(--color-text-secondary)"
                      fontWeight="500"
                    >
                      {line.label}
                    </text>
                  </g>
                ))}

                {/* Filled Area */}
                {dailyChartSvg.areaPath && (
                  <path d={dailyChartSvg.areaPath} fill="url(#redAreaGrad)" />
                )}

                {/* Line Path */}
                {dailyChartSvg.linePath && (
                  <path
                    d={dailyChartSvg.linePath}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Markers */}
                {dailyChartSvg.points.map((p, index) => (
                  <circle
                    key={index}
                    cx={p.x}
                    cy={p.y}
                    r={p.val > 0 ? "3.5" : "1.5"}
                    fill={p.val > 0 ? "var(--color-primary)" : "rgba(0,0,0,0.15)"}
                    stroke={p.val > 0 ? "white" : "none"}
                    strokeWidth="1.5"
                  />
                ))}

                {/* X Axis Labels */}
                {dailyChartSvg.xLabels.map((lbl, index) => (
                  <text
                    key={index}
                    x={lbl.x}
                    y="210"
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--color-text-secondary)"
                    fontWeight="500"
                  >
                    {lbl.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Grouped Bar Chart Card */}
        <div className="report-chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Pencapaian vs Target</h3>
            <div className="chart-filter-select-wrapper">
              <div className="chart-filter-select" onClick={(e) => { e.stopPropagation(); setIsBarMenuOpen(!isBarMenuOpen); }}>
                <span>{barFilter === "bulan" ? "Bulan Ini" : "Tahun Ini"}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              {isBarMenuOpen && (
                <div className="filter-dropdown-menu">
                  <div className={`filter-option ${barFilter === "bulan" ? "active" : ""}`} onClick={() => { setBarFilter("bulan"); setIsBarMenuOpen(false); }}>Bulan Ini</div>
                  <div className={`filter-option ${barFilter === "tahun" ? "active" : ""}`} onClick={() => { setBarFilter("tahun"); setIsBarMenuOpen(false); }}>Tahun Ini</div>
                </div>
              )}
            </div>
          </div>

          <div className="chart-body flex-col">
            <div className="chart-legend-double">
              <div className="legend-item">
                <span className="legend-box bg-red" />
                <span className="legend-label">Pencapaian</span>
              </div>
              <div className="legend-item">
                <span className="legend-box-dashed stroke-red" />
                <span className="legend-label">Target</span>
              </div>
            </div>

            <div className="bar-chart-container-html">
              {/* Y-Axis scale markers */}
              <div className="bar-y-axis">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Bar Groups Grid */}
              <div className="bar-groups-grid">
                {/* Group 1: Total Poin */}
                <div className="bar-group-column">
                  <div className="bar-visual-wrapper">
                    {/* Gridlines overlay */}
                    <div className="bar-gridlines">
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                    </div>

                    <div className="bar-pair-aligner">
                      {/* Actual Bar */}
                      <div className="bar-pill-outer">
                        <span className="bar-percentage-label val-red">{activePointPct}%</span>
                        <div className="bar-pill-fill bg-red" style={{ height: `${Math.min(100, activePointPct)}%` }} />
                      </div>
                      {/* Target Bar */}
                      <div className="bar-pill-outer target">
                        <span className="bar-percentage-label target">100%</span>
                        <div className="bar-pill-fill-dashed border-red" style={{ height: "100%" }} />
                      </div>
                    </div>
                  </div>
                  <span className="bar-column-label">Total Poin</span>
                </div>

                {/* Group 2: Janji Pertemuan */}
                <div className="bar-group-column">
                  <div className="bar-visual-wrapper">
                    <div className="bar-gridlines">
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                    </div>

                    <div className="bar-pair-aligner">
                      {/* Actual Bar */}
                      <div className="bar-pill-outer">
                        <span className="bar-percentage-label val-purple">{activeMeetingPct}%</span>
                        <div className="bar-pill-fill bg-purple" style={{ height: `${Math.min(100, activeMeetingPct)}%` }} />
                      </div>
                      {/* Target Bar */}
                      <div className="bar-pill-outer target">
                        <span className="bar-percentage-label target">100%</span>
                        <div className="bar-pill-fill-dashed border-purple" style={{ height: "100%" }} />
                      </div>
                    </div>
                  </div>
                  <span className="bar-column-label">Janji Pertemuan</span>
                </div>

                {/* Group 3: Penjualan */}
                <div className="bar-group-column">
                  <div className="bar-visual-wrapper">
                    <div className="bar-gridlines">
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                    </div>

                    <div className="bar-pair-aligner">
                      {/* Actual Bar */}
                      <div className="bar-pill-outer">
                        <span className="bar-percentage-label val-green">{activeSalesPct}%</span>
                        <div className="bar-pill-fill bg-green" style={{ height: `${Math.min(100, activeSalesPct)}%` }} />
                      </div>
                      {/* Target Bar */}
                      <div className="bar-pill-outer target">
                        <span className="bar-percentage-label target">100%</span>
                        <div className="bar-pill-fill-dashed border-green" style={{ height: "100%" }} />
                      </div>
                    </div>
                  </div>
                  <span className="bar-column-label">Penjualan</span>
                </div>

                {/* Group 4: Penyelesaian Aktivitas */}
                <div className="bar-group-column">
                  <div className="bar-visual-wrapper">
                    <div className="bar-gridlines">
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                      <div className="bar-gridline" />
                    </div>

                    <div className="bar-pair-aligner">
                      {/* Actual Bar */}
                      <div className="bar-pill-outer">
                        <span className="bar-percentage-label val-orange">{activeDaysPctForBar}%</span>
                        <div className="bar-pill-fill bg-orange" style={{ height: `${Math.min(100, activeDaysPctForBar)}%` }} />
                      </div>
                      {/* Target Bar */}
                      <div className="bar-pill-outer target">
                        <span className="bar-percentage-label target">100%</span>
                        <div className="bar-pill-fill-dashed border-orange" style={{ height: "100%" }} />
                      </div>
                    </div>
                  </div>
                  <span className="bar-column-label">Penyelesaian Aktivitas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row Section: Monthly Progress Summary Card & Side Metrics */}
      <div className="monthly-progress-summary-row">
        {/* Main Progress Card */}
        <div className="monthly-progress-main-card">
          <h4 className="progress-section-heading">Ringkasan Progres Bulanan</h4>
          
          <div className="progress-card-grid">
            {/* Column 1: Target Stats */}
            <div className="progress-text-col">
              <div className="target-icon-split">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="var(--color-primary)" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="6" stroke="var(--color-primary)" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="2" fill="var(--color-primary)"/>
                </svg>
              </div>
              <div className="progress-mini-item">
                <span className="lbl">Target Poin Bulan Ini</span>
                <span className="val">{targets.targetPoints}</span>
              </div>
              <div className="progress-mini-item">
                <span className="lbl">Total Poin</span>
                <span className="val highlight-red">{targets.totalPoints}</span>
              </div>
            </div>

            {/* Column 2: Circular Progress Gauge */}
            <div className="progress-gauge-col">
              <div className="gauge-svg-wrapper">
                <svg width="128" height="128" viewBox="0 0 128 128">
                  {/* Background Circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke="rgba(0,0,0,0.04)"
                    strokeWidth={strokeWidth}
                  />
                  {/* Foreground Animated Circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform="rotate(-90 64 64)"
                  />
                </svg>
                {/* Center Labels */}
                <div className="gauge-label-center">
                  <span className="gauge-pct">{pointPct}%</span>
                  <span className="gauge-sub">Tercapai</span>
                </div>
              </div>
            </div>

            {/* Column 3: Cumulative Points Line Chart */}
            <div className="progress-line-chart-col">
              <span className="cumulative-chart-title">
                <span className="legend-line border-red" />
                Akumulasi Poin ({monthLabel} Ini)
              </span>

              <div className="cumulative-chart-container">
                <svg viewBox={`0 0 ${cumulativeChartSvg.width} ${cumulativeChartSvg.height}`} width="100%" height="100%">
                  <defs>
                    <linearGradient id="redAreaGradCum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(239, 68, 68, 0.15)" />
                      <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  {cumulativeChartSvg.gridLines.map((line, index) => (
                    <g key={index}>
                      <line
                        x1="40"
                        y1={line.y}
                        x2="480"
                        y2={line.y}
                        stroke="rgba(0,0,0,0.04)"
                        strokeWidth="1"
                      />
                      <text
                        x="32"
                        y={line.y + 4}
                        textAnchor="end"
                        fontSize="9"
                        fill="var(--color-text-secondary)"
                        fontWeight="500"
                      >
                        {line.label}
                      </text>
                    </g>
                  ))}

                  {/* Target Horizontal Line */}
                  <line
                    x1="40"
                    y1={cumulativeChartSvg.targetY}
                    x2="480"
                    y2={cumulativeChartSvg.targetY}
                    stroke="var(--color-text-secondary)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="475"
                    y={cumulativeChartSvg.targetY - 6}
                    textAnchor="end"
                    fontSize="9"
                    fill="var(--color-text-secondary)"
                    fontWeight="600"
                  >
                    Target {targets.targetPoints}
                  </text>

                  {/* Filled Area */}
                  {cumulativeChartSvg.areaPath && (
                    <path d={cumulativeChartSvg.areaPath} fill="url(#redAreaGradCum)" />
                  )}

                  {/* Cumulative Path Line */}
                  {cumulativeChartSvg.linePath && (
                    <path
                      d={cumulativeChartSvg.linePath}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Cumulative End Point Marker */}
                  {cumulativeChartSvg.points.length > 0 && (
                    <circle
                      cx={cumulativeChartSvg.points[cumulativeChartSvg.points.length - 1].x}
                      cy={cumulativeChartSvg.points[cumulativeChartSvg.points.length - 1].y}
                      r="4"
                      fill="var(--color-primary)"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* X Axis Labels */}
                  {cumulativeChartSvg.xLabels.map((lbl, index) => (
                    <text
                      key={index}
                      x={lbl.x}
                      y="172"
                      textAnchor="middle"
                      fontSize="9"
                      fill="var(--color-text-secondary)"
                      fontWeight="500"
                    >
                      {lbl.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Side Metrics Section */}
        <div className="monthly-progress-side-pane">
          <div className="side-metric-item">
            <span className="side-label">Rata-rata Poin per Hari</span>
            <span className="side-value">{averagePoints} <span className="unit">poin</span></span>
          </div>

          <div className="side-metric-item">
            <span className="side-label">Hari Aktif</span>
            <span className="side-value">{targets.activeDays} / {targets.totalDays} <span className="unit">hari</span></span>
          </div>


        </div>
      </div>

      {/* Bottom Footnote */}
      <p className="dashboard-update-footnote">*Data diperbarui setiap hari pukul 00:00 WIB</p>
    </div>
  );
}
