"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; text: string };

type ToastContextType = { showToast: (text: string, type?: ToastType) => void };

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const PENDING_KEY = "bloodlines-pending-toast";
const DURATION_MS = 4000;

const TOAST_COLORS: Record<ToastType, string> = {
  success: "bg-[#1E7B3A] text-white",
  error: "bg-[#D32F2F] text-white",
  info: "bg-gray-900 text-white",
};

// For a message that should show after a full page load (e.g. after switching dashboards)
export const queueToast = (text: string, type: ToastType = "success") => {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ text, type }));
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const showToast = useCallback(
    (text: string, type: ToastType = "success") => {
      const id = Date.now() + Math.random();
      setToasts((all) => [...all, { id, type, text }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_KEY);
    if (!pending) return;
    const timer = setTimeout(() => {
      sessionStorage.removeItem(PENDING_KEY);
      try {
        const { text, type } = JSON.parse(pending);
        showToast(text, type);
      } catch {
        // ignore a malformed entry
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-0 bottom-20 md:bottom-6 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto w-full max-w-md rounded-lg px-4 py-3 shadow-lg flex items-start justify-between gap-3 text-sm ${TOAST_COLORS[toast.type]}`}
          >
            <span>{toast.text}</span>
            <button onClick={() => dismiss(toast.id)} aria-label="Dismiss" className="shrink-0 opacity-80 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
