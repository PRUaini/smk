import React from "react";
import { DAYS_OF_WEEK } from "../../../features/dashboard/constants";

export default function DashboardLoading() {
  return (
    <div className="dashboard-layout-new">
      <main className="dashboard-main-new" style={{ width: "100%" }}>
        {/* Header Skeleton */}
        <div className="dashboard-header-new" style={{ background: "white", padding: "1.25rem 2rem", borderRadius: "16px", border: "1px solid rgba(0, 0, 0, 0.03)" }}>
          <div>
            <div className="skeleton-pulse" style={{ width: "180px", height: "1.75rem", borderRadius: "6px", marginBottom: "0.5rem" }} />
            <div className="skeleton-pulse" style={{ width: "120px", height: "0.875rem", borderRadius: "4px" }} />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div className="skeleton-pulse" style={{ width: "130px", height: "38px", borderRadius: "10px" }} />
            <div className="skeleton-pulse" style={{ width: "38px", height: "38px", borderRadius: "50%" }} />
            <div className="skeleton-pulse" style={{ width: "70px", height: "38px", borderRadius: "10px" }} />
          </div>
        </div>

        {/* Tab Selection Skeleton */}
        <div className="dashboard-tab-navigation" style={{ display: "flex", justifyContent: "center" }}>
          <div className="segmented-control" style={{ background: "white", border: "1px solid rgba(0, 0, 0, 0.06)", padding: "0.375rem" }}>
            <div className="skeleton-pulse" style={{ width: "150px", height: "36px", borderRadius: "9px" }} />
            <div className="skeleton-pulse" style={{ width: "150px", height: "36px", borderRadius: "9px" }} />
          </div>
        </div>

        {/* Month Selection Skeleton */}
        <div className="month-tabs-container" style={{ background: "white", border: "1px solid rgba(0, 0, 0, 0.06)", padding: "0.5rem 1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", overflowX: "auto" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-pulse" style={{ width: "80px", height: "32px", borderRadius: "10px", flexShrink: 0 }} />
            ))}
          </div>
        </div>

        {/* Weekly Calendar Grid Skeleton */}
        <div className="weekly-calendar-card" style={{ background: "white", border: "1px solid rgba(0, 0, 0, 0.03)" }}>
          <div className="calendar-grid-header" style={{ display: "grid", gridTemplateColumns: `repeat(${DAYS_OF_WEEK.length}, 1fr)`, borderBottom: "1px solid var(--color-border)" }}>
            {DAYS_OF_WEEK.map((_, i) => (
              <div key={i} className="day-col-header" style={{ height: "60px", display: "flex", flexDirection: "column", gap: "6px", justifyContent: "center", alignItems: "center" }}>
                <div className="skeleton-pulse" style={{ width: "40px", height: "12px", borderRadius: "3px" }} />
                <div className="skeleton-pulse" style={{ width: "24px", height: "12px", borderRadius: "3px" }} />
              </div>
            ))}
          </div>
          <div>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <div key={rowIndex} style={{ display: "grid", gridTemplateColumns: `repeat(${DAYS_OF_WEEK.length}, 1fr)` }}>
                {DAYS_OF_WEEK.map((_, colIndex) => (
                  <div key={colIndex} style={{ height: "80px", borderRight: colIndex === DAYS_OF_WEEK.length - 1 ? "none" : "1px solid var(--color-border)", padding: "8px", position: "relative" }}>
                    {rowIndex === 1 && colIndex === 2 && (
                      <div className="skeleton-pulse" style={{ width: "80%", height: "45px", borderRadius: "6px" }} />
                    )}
                    {rowIndex === 2 && colIndex === 4 && (
                      <div className="skeleton-pulse" style={{ width: "90%", height: "35px", borderRadius: "6px" }} />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
