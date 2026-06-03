"use client";
import * as React from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm min-w-[300px]",
              toast.type === "success" && "bg-green-50 border border-green-200 text-green-800",
              toast.type === "error" && "bg-red-50 border border-red-200 text-red-800",
              toast.type === "info" && "bg-blue-50 border border-blue-200 text-blue-800"
            )}
          >
            {toast.type === "success" && <CheckCircle className="h-4 w-4 shrink-0" />}
            {toast.type === "error" && <XCircle className="h-4 w-4 shrink-0" />}
            {toast.type === "info" && <Info className="h-4 w-4 shrink-0" />}
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
