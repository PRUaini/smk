"use client";

import { ErrorBoundary } from "react-error-boundary";

interface DashboardWidgetBoundaryProps {
  children: React.ReactNode;
  label: string;
}

export default function DashboardWidgetBoundary({
  children,
  label,
}: DashboardWidgetBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <div className="dashboard-widget-error" role="alert">
          <div className="dashboard-widget-error-icon" aria-hidden="true">
            !
          </div>
          <div className="dashboard-widget-error-copy">
            <p className="dashboard-widget-error-title">{label} tidak dapat ditampilkan</p>
            <p className="dashboard-widget-error-description">Terjadi kendala saat memuat data.</p>
          </div>
          <button
            type="button"
            className="dashboard-widget-error-action"
            onClick={resetErrorBoundary}
          >
            Muat ulang widget
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
