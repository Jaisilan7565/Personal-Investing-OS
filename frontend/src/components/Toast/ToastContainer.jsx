import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { removeToast } from "../../store";

// Individual Toast Notification Component
function ToastItem({ toast }) {
  const dispatch = useDispatch();
  const { id, type, message } = toast;

  // Automatically dismiss toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(id));
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, dispatch]);

  // Dynamic configuration mapping per type
  const config = {
    success: {
      borderColor: "border-green-500/20 dark:border-green-500/20",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/10",
      iconColor: "text-emerald-500 dark:text-emerald-400",
      shadowColor: "shadow-emerald-500/10",
      Icon: CheckCircle2,
    },
    error: {
      borderColor: "border-red-500/20 dark:border-red-500/20",
      bgColor: "bg-red-500/10 dark:bg-red-500/10",
      iconColor: "text-red-500 dark:text-red-400",
      shadowColor: "shadow-red-500/10",
      Icon: AlertCircle,
    },
    warning: {
      borderColor: "border-amber-500/20 dark:border-amber-500/20",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/10",
      iconColor: "text-amber-500 dark:text-amber-400",
      shadowColor: "shadow-amber-500/10",
      Icon: AlertTriangle,
    },
    info: {
      borderColor: "border-indigo-500/20 dark:border-indigo-500/20",
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/10",
      iconColor: "text-indigo-500 dark:text-indigo-400",
      shadowColor: "shadow-indigo-500/10",
      Icon: Info,
    },
  };

  const { borderColor, bgColor, iconColor, shadowColor, Icon } =
    config[type] || config.info;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl border ${borderColor} ${bgColor} bg-surface-lowest/90 backdrop-blur-md shadow-lg ${shadowColor} w-full max-w-sm font-inter animate-in slide-in-from-right-12 fade-in duration-300 ease-out`}
      role="alert"
    >
      {/* Dynamic Type Icon */}
      <Icon size={18} className={`${iconColor} shrink-0 mt-0.5`} />

      {/* Message Text */}
      <div className="flex-1 text-xs font-semibold text-on-heading leading-relaxed select-none">
        {message}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => dispatch(removeToast(id))}
        className="text-on-variant hover:text-on-heading p-0.5 rounded-md hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Fixed Queue container to pile up notifications stacked sequentially
export default function ToastContainer() {
  const toasts = useSelector((state) => state.toast.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-6 right-6 z-[99999] flex flex-col gap-3.5 w-full max-w-xs sm:max-w-sm pointer-events-none select-none"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
