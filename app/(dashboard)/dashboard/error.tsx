"use client";

import React, { useEffect } from "react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="dashboard-layout-new">
      <main className="dashboard-main-new" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", width: "100%" }}>
        <div className="dashboard-widget-error" role="alert" style={{ maxWidth: "480px", padding: "2.5rem", borderRadius: "20px", boxShadow: "var(--shadow-xl)", background: "white", border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div className="dashboard-widget-error-icon" aria-hidden="true" style={{ fontSize: "1.5rem", width: "48px", height: "48px", borderRadius: "50%", background: "var(--color-error-bg)", color: "var(--color-error)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginBottom: "1.25rem" }}>
            !
          </div>
          <div className="dashboard-widget-error-copy" style={{ marginBottom: "1.5rem" }}>
            <h2 className="dashboard-widget-error-title" style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
              Gagal memuat Halaman Dashboard
            </h2>
            <p className="dashboard-widget-error-description" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              {error.message || "Terjadi kendala saat memuat data dari server."}
            </p>
          </div>
          <button type="button" className="dashboard-error-retry-btn" onClick={reset}>
            Muat ulang Halaman
          </button>
        </div>
      </main>
    </div>
  );
}
