"use client";

import { createContext, useContext, useReducer, useEffect, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  open?: boolean;
}

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 300;

type ToastAction =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "UPDATE_TOAST"; toast: Partial<Toast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = { toasts: [] };

function reducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "UPDATE_TOAST":
      return {
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        return {
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        };
      }
      return {
        toasts: state.toasts.map((t) => ({ ...t, open: false })),
      };
    }
    case "REMOVE_TOAST": {
      const { toastId } = action;
      if (toastId) {
        return {
          toasts: state.toasts.filter((t) => t.id !== toastId),
        };
      }
      return { toasts: [] };
    }
  }
}

const ToastContext = createContext<{
  toasts: Toast[];
  toast: (props: Omit<Toast, "id">) => string;
  dismiss: (toastId?: string) => void;
} | null>(null);

function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { lang } = useStore();
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync with reducer
  useEffect(() => {
    setToasts(state.toasts);
  }, [state.toasts]);

  const toast = useCallback((props: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      type: props.type || "info",
      title: props.title,
      description: props.description,
      duration: props.duration ?? 5000,
      action: props.action,
      open: true,
    };
    dispatch({ type: "ADD_TOAST", toast: newToast });

    // Auto dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId });
    if (toastId) {
      setTimeout(() => {
        dispatch({ type: "REMOVE_TOAST", toastId });
      }, TOAST_REMOVE_DELAY);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

function ToastViewport() {
  const { toasts, dismiss } = useToast();
  const { lang } = useStore();

  return (
    <div
      className={cn(
        "fixed top-4 end-4 z-[100] flex flex-col gap-2",
        "pointer-events-none",
        "sm:w-[380px]"
      )}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id?: string) => void }) {
  const { lang } = useStore();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(toast.open ?? true);
  }, [toast.open]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
    error: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
    warning: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
    info: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  };

  const Icon = icons[toast.type];
  const colorClass = colors[toast.type];

  if (!open) return null;

  return (
    <div
      className={cn(
        "relative pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg",
        "animate-in slide-in-from-right duration-300 ease-out",
        "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-200",
        colorClass
      )}
      data-state={open ? "open" : "closed"}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={20} className={cn("text-current", toast.type === "success" && "text-emerald-600", toast.type === "error" && "text-red-600")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 mt-0.5 text-muted hover:text-foreground transition opacity-60 hover:opacity-100"
            aria-label={lang === "ar" ? "إغلاق" : "Close"}
          >
            <X size={14} />
          </button>
        </div>
        {toast.description && (
          <p className="mt-1 text-sm text-muted leading-relaxed">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="mt-3 btn-interactive text-xs font-semibold underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// Hook for easy access
export function useToastActions() {
  const { toast, dismiss } = useToast();
  return {
    success: (title: string, description?: string, action?: Toast["action"]) =>
      toast({ type: "success", title, description, action }),
    error: (title: string, description?: string, action?: Toast["action"]) =>
      toast({ type: "error", title, description, action }),
    warning: (title: string, description?: string, action?: Toast["action"]) =>
      toast({ type: "warning", title, description, action }),
    info: (title: string, description?: string, action?: Toast["action"]) =>
      toast({ type: "info", title, description, action }),
    dismiss,
  };
}