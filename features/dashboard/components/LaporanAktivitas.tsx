import React, { useState, useMemo } from "react";
import { Activity, DashboardTargets } from "../types";
import { CLOSING_TYPES, DAYS_OF_WEEK, MEETING_TYPES } from "../constants";
import { calculatePercentage } from "../utils/percentage";
import { getWeeksInMonth, getWeekDates } from "../utils/date";
import { buildLineChartSvg, getMonthsAbbr, type ChartDatum } from "../utils/report";

interface LaporanAktivitasProps {
  targets: DashboardTargets;
  activities: Activity[];
  selectedMonth: number; // 0-indexed
  selectedYear: number;
}

type ReportPeriod = "yearly" | "monthly" | "weekly";

const YEARLY_ACTIVE_DAYS_TARGET = 150;

export default function LaporanAktivitas({ targets, activities, selectedMonth, selectedYear }: LaporanAktivitasProps) {
  const monthsAbbr = getMonthsAbbr();
  const monthLabel = monthsAbbr[selectedMonth];
  const weeklyDayLabels = useMemo(() => DAYS_OF_WEEK.map((day) => day.slice(0, 3)), []);

  // Interactive Filter States
  const [dailyFilter, setDailyFilter] = useState<"harian" | "bulanan" | "tahunan">("harian");
  const [isDailyMenuOpen, setIsDailyMenuOpen] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("yearly");
  const [weekSelection, setWeekSelection] = useState({ month: selectedMonth, year: selectedYear, week: 0 });
  const selectedWeek = weekSelection.month === selectedMonth && weekSelection.year === selectedYear ? weekSelection.week : 0;

  const weeks = useMemo(() => getWeeksInMonth(selectedMonth, selectedYear), [selectedMonth, selectedYear]);
  const activeWeekIdx = Math.min(selectedWeek, weeks.length - 1);

  const weeklyMetrics = useMemo(() => {
    const weekStartDate = weeks[activeWeekIdx];
    if (!weekStartDate) {
      return { points: 0, meetings: 0, sales: 0, api: 0, activeDays: 0 };
    }
    const dates = getWeekDates(weekStartDate);
    const completedWeeklyActivities = activities.filter(
      (act) => act.status === "Selesai" && dates.includes(act.tanggal)
    );
    const weeklyActivities = activities.filter(
      (act) => dates.includes(act.tanggal)
    );
    const points = completedWeeklyActivities.reduce((sum, act) => sum + act.poin, 0);
    const meetings = completedWeeklyActivities.filter((act) => act.kegiatan.some((k) => MEETING_TYPES.has(k))).length;
    const sales = completedWeeklyActivities.filter((act) => act.kegiatan.some((k) => CLOSING_TYPES.has(k))).length;
    const api = weeklyActivities
      .filter((act) => act.kegiatan.some((k) => CLOSING_TYPES.has(k)))
      .reduce((sum, act) => sum + (act.api || 0), 0);
    const activeDays = new Set(completedWeeklyActivities.map((act) => act.tanggal)).size;
    return { points, meetings, sales, api, activeDays };
  }, [activities, weeks, activeWeekIdx]);

  // Selected report metrics based on view mode (yearly vs monthly vs weekly)
  const isYearly = reportPeriod === "yearly";
  const isWeekly = reportPeriod === "weekly";
  const weeklyPointPct = calculatePercentage(targets.totalWeeklyPoints, targets.targetWeeklyPoints);
  const weeklyMeetingPct = calculatePercentage(targets.totalWeeklyMeetings, targets.targetWeeklyMeetings);
  const weeklyApiPct = calculatePercentage(weeklyMetrics.api, targets.targetApiMingguan);

  // 1. Day-to-day (Daily points in selected month)
  const dailyData = useMemo(() => {
    const data = [];
    for (let d = 1; d <= targets.totalDays; d++) {
      const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayActivities = activities.filter(
        (act) => act.tanggal === dateString && act.status === "Selesai"
      );
      const points = dayActivities.reduce((sum, act) => sum + act.poin, 0);
      data.push({ day: d, points });
    }
    return data;
  }, [activities, selectedMonth, selectedYear, targets.totalDays]);

  // 2. Month-per-month (Monthly points in current year)
  const monthlyData = useMemo(() => {
    const data = [];
    for (let m = 0; m < 12; m++) {
      const monthActivities = activities.filter((act) => {
        const parts = act.tanggal.split("-");
        const yr = parseInt(parts[0], 10);
        const mo = parseInt(parts[1], 10);
        return yr === selectedYear && mo - 1 === m && act.status === "Selesai";
      });
      const points = monthActivities.reduce((sum, act) => sum + act.poin, 0);
      data.push({ month: m, points });
    }
    return data;
  }, [activities, selectedYear]);

  // 3. Year-to-year (Yearly points)
  const yearlyData = useMemo(() => {
    const data = [];
    const targetRangeYears = [selectedYear - 2, selectedYear - 1, selectedYear];
    for (const yr of targetRangeYears) {
      const yearActivities = activities.filter((act) => {
        const yrPart = parseInt(act.tanggal.split("-")[0], 10);
        return yrPart === yr && act.status === "Selesai";
      });
      const points = yearActivities.reduce((sum, act) => sum + act.poin, 0);
      data.push({ year: yr, points });
    }
    return data;
  }, [activities, selectedYear]);

  const yearlyMetrics = useMemo(() => {
    const completedYearActivities = activities.filter((act) => {
      const yrPart = parseInt(act.tanggal.split("-")[0], 10);
      return yrPart === selectedYear && act.status === "Selesai";
    });
    const yearActivities = activities.filter((act) => {
      const yrPart = parseInt(act.tanggal.split("-")[0], 10);
      return yrPart === selectedYear;
    });

    return {
      points: completedYearActivities.reduce((sum, act) => sum + act.poin, 0),
      meetings: completedYearActivities.filter((act) => act.kegiatan.some((k) => MEETING_TYPES.has(k))).length,
      api: yearActivities
        .filter((act) => act.kegiatan.some((k) => CLOSING_TYPES.has(k)))
        .reduce((sum, act) => sum + (act.api || 0), 0),
      activeDays: new Set(completedYearActivities.map((act) => act.tanggal)).size,
    };
  }, [activities, selectedYear]);

  // Yearly target parameters (aggregated compare)
  const activeMonths = Math.max(1, targets.periodeKerjaAkhir - targets.periodeKerjaAwal + 1);
  const yearlyTargetData = useMemo(() => {
    const targetPointsYr = targets.targetPoints * activeMonths;
    const targetMeetingsYr = targets.targetMeetings * activeMonths;

    return {
      pointPct: calculatePercentage(yearlyMetrics.points, targetPointsYr),
      meetingPct: calculatePercentage(yearlyMetrics.meetings, targetMeetingsYr),
      apiPct: calculatePercentage(yearlyMetrics.api, targets.targetApi),
      activeDaysPct: calculatePercentage(yearlyMetrics.activeDays, YEARLY_ACTIVE_DAYS_TARGET)
    };
  }, [targets, yearlyMetrics, activeMonths]);

  const currentPoints = isWeekly ? weeklyMetrics.points : isYearly ? yearlyMetrics.points : targets.totalPoints;
  const targetPoints = isWeekly ? targets.targetWeeklyPoints : isYearly ? targets.targetPoints * activeMonths : targets.targetPoints;
  const pointPct = calculatePercentage(currentPoints, targetPoints);

  const currentMeetings = isWeekly ? weeklyMetrics.meetings : isYearly ? yearlyMetrics.meetings : targets.totalMeetings;
  const targetMeetings = isWeekly ? targets.targetWeeklyMeetings : isYearly ? targets.targetMeetings * activeMonths : targets.targetMeetings;
  const meetingPct = calculatePercentage(currentMeetings, targetMeetings);

  const targetApiPeriod = isWeekly ? targets.targetApiMingguan : isYearly ? targets.targetApi : targets.targetApiBulanan;
  const collectedApiPeriod = isWeekly ? weeklyMetrics.api : isYearly ? yearlyMetrics.api : targets.totalApi;
  const remainingApiPeriod = Math.max(0, targetApiPeriod - collectedApiPeriod);
  const apiPct = calculatePercentage(collectedApiPeriod, targetApiPeriod);

  // Select dynamic display metrics for the target comparisons chart
  const activePointPct =
    reportPeriod === "weekly" ? weeklyPointPct :
    reportPeriod === "monthly" ? calculatePercentage(targets.totalPoints, targets.targetPoints) :
    yearlyTargetData.pointPct;

  const activeMeetingPct =
    reportPeriod === "weekly" ? weeklyMeetingPct :
    reportPeriod === "monthly" ? calculatePercentage(targets.totalMeetings, targets.targetMeetings) :
    yearlyTargetData.meetingPct;

  const activeApiPct =
    reportPeriod === "weekly" ? weeklyApiPct :
    reportPeriod === "monthly" ? calculatePercentage(targets.totalApi, targets.targetApiBulanan) :
    yearlyTargetData.apiPct;

  // Compute cumulative points (monthly or weekly cumulative)
  const cumulativeData = useMemo(() => {
    if (isWeekly) {
      const weekStartDate = weeks[activeWeekIdx];
      if (weekStartDate) {
        const dates = getWeekDates(weekStartDate);
        let runningSum = 0;
        return dates.map((dateStr, idx) => {
          const dayActivities = activities.filter(
            (act) => act.tanggal === dateStr && act.status === "Selesai"
          );
          const points = dayActivities.reduce((sum, act) => sum + act.poin, 0);
          runningSum += points;
          return { day: weeklyDayLabels[idx], points: runningSum };
        });
      }
      return [];
    }
    if (isYearly) {
      let runningSum = 0;
      return monthlyData.map((d) => {
        runningSum += d.points;
        return { day: monthsAbbr[d.month], points: runningSum };
      });
    }
    let runningSum = 0;
    return dailyData.map((d) => {
      runningSum += d.points;
      return { day: String(d.day), points: runningSum };
    });
  }, [isWeekly, isYearly, weeks, activeWeekIdx, activities, dailyData, monthlyData, monthsAbbr, weeklyDayLabels]);

  // SVG dimensions & scales for Tren Poin Harian
  const dailyChartSvg = useMemo(() => {
    let dataset: ChartDatum[] = [];
    if (isWeekly) {
      const weekStartDate = weeks[activeWeekIdx];
      if (weekStartDate) {
        const dates = getWeekDates(weekStartDate);
        dataset = dates.map((dateStr, idx) => {
          const dayActivities = activities.filter(
            (act) => act.tanggal === dateStr && act.status === "Selesai"
          );
          const points = dayActivities.reduce((sum, act) => sum + act.poin, 0);
          return {
            label: weeklyDayLabels[idx] || "",
            points
          };
        });
      }
    } else if (isYearly) {
      dataset = monthlyData.map((m) => ({
        label: monthsAbbr[m.month],
        points: m.points
      }));
    } else if (dailyFilter === "harian") {
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
    
    return buildLineChartSvg(
      dataset,
      { width: 600, height: 220, padding: { top: 20, right: 20, bottom: 35, left: 40 } },
      100,
      !isWeekly && !isYearly && dailyFilter === "harian" ? 5 : 1
    );
  }, [isWeekly, isYearly, weeks, activeWeekIdx, activities, dailyFilter, dailyData, monthlyData, yearlyData, monthLabel, monthsAbbr, weeklyDayLabels]);

  // SVG dimensions & scales for Akumulasi Poin
  const cumulativeChartSvg = useMemo(() => {
    const width = 500;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const activeTarget = targetPoints;
    const maxVal = Math.max(activeTarget, 100, ...cumulativeData.map((d) => d.points));
    
    // Points coordinates
    const points = cumulativeData.map((d, index) => {
      const x = padding.left + (index / Math.max(1, cumulativeData.length - 1)) * chartWidth;
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
    const targetY = padding.top + chartHeight - (activeTarget / maxVal) * chartHeight;

    // Grid lines (y values)
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const val = Math.round(ratio * maxVal);
      const y = padding.top + chartHeight - ratio * chartHeight;
      return { y, label: val };
    });

    // X axis labels
    const xLabels = [];
    if (isWeekly || isYearly) {
      for (let i = 0; i < cumulativeData.length; i++) {
        xLabels.push({
          x: points[i].x,
          label: cumulativeData[i].day
        });
      }
    } else {
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
    }

    return { width, height, points, linePath, areaPath, gridLines, xLabels, targetY };
  }, [isWeekly, isYearly, cumulativeData, targetPoints, monthLabel]);

  // Average points per day calculation
  const averagePoints = isWeekly
    ? (weeklyMetrics.activeDays ? (weeklyMetrics.points / weeklyMetrics.activeDays).toFixed(1) : "0")
    : isYearly
      ? (yearlyMetrics.activeDays ? (yearlyMetrics.points / yearlyMetrics.activeDays).toFixed(1) : "0")
    : (targets.activeDays ? (targets.totalPoints / targets.activeDays).toFixed(1) : "0");

  // Circular gauge config
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, pointPct) / 100) * circumference;

  return (
    <div className="laporan-aktivitas-wrapper">
      {/* Report View Switcher */}
      <div className="laporan-view-switcher" style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="segmented-control" style={{ alignSelf: "flex-start" }}>
          <button
            className={`segmented-tab ${reportPeriod === "yearly" ? "active" : ""}`}
            onClick={() => setReportPeriod("yearly")}
          >
            Tahunan
          </button>
          <button
            className={`segmented-tab ${reportPeriod === "monthly" ? "active" : ""}`}
            onClick={() => setReportPeriod("monthly")}
          >
            Bulanan
          </button>
          <button
            className={`segmented-tab ${reportPeriod === "weekly" ? "active" : ""}`}
            onClick={() => setReportPeriod("weekly")}
          >
            Mingguan
          </button>
        </div>

        {reportPeriod === "weekly" && (
          <div className="month-tabs-container week-tabs-container" style={{ marginTop: 0 }}>
            <div className="month-tabs-scroll">
              {weeks.map((_, index) => (
                <button
                  key={index}
                  className={`month-tab-btn ${activeWeekIdx === index ? "active" : ""}`}
                  onClick={() => setWeekSelection({ month: selectedMonth, year: selectedYear, week: index })}
                >
                  Minggu {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3 KPI Cards */}
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
              <span className="kpi-label">Total Poin</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{currentPoints}</span>
                <span className="kpi-target">dari target {targetPoints}</span>
              </div>
            </div>
          </div>
          <div className="kpi-progress-bar-wrapper">
            <div className="kpi-progress-bar bg-red" style={{ width: `${Math.min(100, pointPct)}%` }} />
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-pct-attained">{pointPct}% Tercapai</span>
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
              <span className="kpi-label">Janji Pertemuan</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{currentMeetings}</span>
                <span className="kpi-target">dari target {targetMeetings}</span>
              </div>
            </div>
          </div>
          <div className="kpi-progress-bar-wrapper">
            <div className="kpi-progress-bar bg-purple" style={{ width: `${Math.min(100, meetingPct)}%` }} />
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-pct-attained">{meetingPct}% Tercapai</span>
          </div>
        </div>

        {/* Target API Card */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <div className="kpi-icon kpi-icon-orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.2 7.7 7.8 8 8.3C5.5 9.5 4 12.2 4 15.5C4 19 7.5 22 12 22C16.5 22 20 19 20 15.5C20 12.2 18.5 9.5 16 8.3C16.3 7.8 16.5 7.2 16.5 6.5C16.5 4 14.5 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 9.5C9.2 9.2 10.6 9 12 9C13.4 9 14.8 9.2 16 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <text x="12" y="17" fill="currentColor" fontSize="8" fontWeight="bold" textAnchor="middle">Rp</text>
              </svg>
            </div>
            <div className="kpi-meta">
              <span className="kpi-label">{isWeekly ? "Sisa Target API Mingguan" : isYearly ? "Sisa Target API Tahunan" : "Sisa Target API Bulanan"}</span>
              <div className="kpi-value-row-stacked">
                <span className="kpi-value">Rp {remainingApiPeriod.toLocaleString("id-ID")}</span>
                <span className="kpi-target-label">dari target Rp {targetApiPeriod.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
          <div className="kpi-progress-bar-wrapper">
            <div className="kpi-progress-bar bg-orange" style={{ width: `${Math.min(100, apiPct)}%` }} />
          </div>
          <div className="kpi-card-footer">
            <span className="kpi-pct-attained">
              Total API Terkumpul: Rp {collectedApiPeriod.toLocaleString("id-ID")} ({apiPct}% Tercapai)
            </span>
          </div>
        </div>
      </div>

      {/* Charts Layout Row */}
      <div className="charts-double-row">
        {/* Line Chart Card */}
        <div className="report-chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">{isWeekly ? "Tren Poin Mingguan" : isYearly ? "Tren Poin Tahunan" : "Tren Poin Harian"}</h3>
            {!isWeekly && !isYearly && (
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
            )}
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
          </div>

          <div className="chart-body flex-col">
            <div className="chart-legend-double">
              <div className="legend-item">
                <span className="legend-box" style={{ backgroundColor: "var(--color-primary)" }} />
                <span className="legend-label">Pencapaian</span>
              </div>
              <div className="legend-item">
                <span className="legend-box-dashed" style={{ borderColor: "var(--color-primary)" }} />
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
                        <span className="bar-percentage-label" style={{ color: "var(--color-primary)" }}>{activePointPct}%</span>
                        <div className="bar-pill-fill" style={{ height: `${Math.min(100, activePointPct)}%`, backgroundColor: "var(--color-primary)" }} />
                      </div>
                      {/* Target Bar */}
                      <div className="bar-pill-outer target">
                        <span className="bar-percentage-label target">100%</span>
                        <div className="bar-pill-fill-dashed" style={{ height: "100%", borderColor: "var(--color-primary)" }} />
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
                        <span className="bar-percentage-label" style={{ color: "var(--color-dashboard-purple)" }}>{activeMeetingPct}%</span>
                        <div className="bar-pill-fill" style={{ height: `${Math.min(100, activeMeetingPct)}%`, backgroundColor: "var(--color-dashboard-purple)" }} />
                      </div>
                      {/* Target Bar */}
                      <div className="bar-pill-outer target">
                        <span className="bar-percentage-label target">100%</span>
                        <div className="bar-pill-fill-dashed" style={{ height: "100%", borderColor: "var(--color-dashboard-purple)" }} />
                      </div>
                    </div>
                  </div>
                  <span className="bar-column-label">Janji Pertemuan</span>
                </div>

                {/* Group 3: Target API */}
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
                        <span className="bar-percentage-label" style={{ color: "var(--color-dashboard-orange)" }}>{activeApiPct}%</span>
                        <div className="bar-pill-fill" style={{ height: `${Math.min(100, activeApiPct)}%`, backgroundColor: "var(--color-dashboard-orange)" }} />
                      </div>
                      {/* Target Bar */}
                      <div className="bar-pill-outer target">
                        <span className="bar-percentage-label target">100%</span>
                        <div className="bar-pill-fill-dashed" style={{ height: "100%", borderColor: "var(--color-dashboard-orange)" }} />
                      </div>
                    </div>
                  </div>
                  <span className="bar-column-label">Target API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row Section: Monthly/Weekly Progress Summary Card & Side Metrics */}
      <div className="monthly-progress-summary-row">
        {/* Main Progress Card */}
        <div className="monthly-progress-main-card">
          <h4 className="progress-section-heading">{isWeekly ? "Ringkasan Progres Mingguan" : isYearly ? "Ringkasan Progres Tahunan" : "Ringkasan Progres Bulanan"}</h4>
          
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
                <span className="lbl">{isWeekly ? "Target Poin Minggu Ini" : isYearly ? "Target Poin Tahun Ini" : "Target Poin Bulan Ini"}</span>
                <span className="val">{targetPoints}</span>
              </div>
              <div className="progress-mini-item">
                <span className="lbl">Total Poin</span>
                <span className="val highlight-red">{currentPoints}</span>
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
                Akumulasi Poin ({isWeekly ? `Minggu ${activeWeekIdx + 1}` : isYearly ? `${selectedYear}` : `${monthLabel} Ini`})
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
                    Target {targetPoints}
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
            <span className="side-value">{isWeekly ? weeklyMetrics.activeDays : isYearly ? yearlyMetrics.activeDays : targets.activeDays} / {isWeekly ? DAYS_OF_WEEK.length : isYearly ? YEARLY_ACTIVE_DAYS_TARGET : targets.totalDays} <span className="unit">hari</span></span>
          </div>
        </div>
      </div>

      {/* Bottom Footnote */}
      <p className="dashboard-update-footnote">*Data diperbarui setiap hari pukul 00:00 WIB</p>
    </div>
  );
}
