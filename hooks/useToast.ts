import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 4000,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: "success", duration });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: "error", duration });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      addToast({ message, type: "info", duration });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
  };
}
