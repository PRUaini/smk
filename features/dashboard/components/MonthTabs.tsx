import React from "react";

interface MonthTabsProps {
  selectedMonth: number; // 0-indexed
  onMonthChange: (month: number) => void;
  selectedYear?: number;
}

export default function MonthTabs({ selectedMonth, onMonthChange, selectedYear }: MonthTabsProps) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="month-tabs-container">
      <div className="month-tabs-scroll">
        {months.map((month, index) => (
          <button
            key={month}
            className={`month-tab-btn ${selectedMonth === index ? "active" : ""}`}
            aria-pressed={selectedMonth === index}
            onClick={() => onMonthChange(index)}
          >
            {month}
          </button>
        ))}
      </div>
      {selectedYear !== undefined && (
        <span className="month-tabs-year-chip">{selectedYear}</span>
      )}
    </div>
  );
}
