import React from "react";
import { Toast } from "../utils/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="toast-container" aria-live="assertive">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <div className="toast-content" style={toast.type === "confirm" ? { flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" } : undefined}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {toast.type === "success" && (
                <svg className="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {toast.type === "error" && (
                <svg className="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              {toast.type === "info" && (
                <svg className="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
              {toast.type === "confirm" && (
                <svg className="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              <span className="toast-message">{toast.message}</span>
            </div>
            {toast.type === "confirm" && (
              <div style={{ display: "flex", gap: "0.5rem", marginLeft: "2.25rem", marginTop: "0.25rem" }}>
                <button
                  onClick={() => {
                    if (toast.onConfirm) toast.onConfirm();
                    onDismiss(toast.id);
                  }}
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.25rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: "none"
                  }}
                >
                  Hapus
                </button>
                <button
                  onClick={() => {
                    if (toast.onCancel) toast.onCancel();
                    onDismiss(toast.id);
                  }}
                  style={{
                    backgroundColor: "var(--color-surface-hover)",
                    color: "var(--color-text-secondary)",
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "0.25rem",
                    fontWeight: "600",
                    border: "1px solid var(--color-border)",
                    cursor: "pointer"
                  }}
                >
                  Batal
                </button>
              </div>
            )}
          </div>
          <button className="toast-close-btn" onClick={() => onDismiss(toast.id)} aria-label="Close notification">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
