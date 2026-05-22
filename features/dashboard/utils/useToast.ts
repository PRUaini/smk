import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "confirm";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string,
    type: ToastType = "info",
    options?: { onConfirm?: () => void; onCancel?: () => void }
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: Toast = {
      id,
      message,
      type,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
    };
    
    setToasts((prev) => [...prev, newToast]);

    if (type !== "confirm") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }
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
