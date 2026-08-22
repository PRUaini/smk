import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "confirm";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  confirmLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const TOAST_AUTO_DISMISS_MS = 4000;
const CONFIRM_TOAST_AUTO_DISMISS_MS = 10_000;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastType = "info",
    options?: { confirmLabel?: string; onConfirm?: () => void; onCancel?: () => void }
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = {
      id,
      message,
      type,
      confirmLabel: options?.confirmLabel,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
    };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, type === "confirm" ? CONFIRM_TOAST_AUTO_DISMISS_MS : TOAST_AUTO_DISMISS_MS);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.onCancel) {
        toast.onCancel();
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  return {
    toasts,
    showToast,
    dismissToast,
  };
}
