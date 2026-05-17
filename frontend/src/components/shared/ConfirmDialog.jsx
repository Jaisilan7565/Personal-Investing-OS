import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

/**
 * ConfirmDialog — reusable delete-confirmation modal.
 *
 * Props:
 *   isOpen      boolean  – whether to show the dialog
 *   title       string   – bold heading  (e.g. "Delete Decision?")
 *   message     string   – body copy
 *   onConfirm   fn       – called when user clicks "Delete"
 *   onCancel    fn       – called when user clicks "Cancel" or the backdrop
 */
export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      {/* Dialog card */}
      <div
        className="glass-card w-full max-w-sm p-6 flex flex-col gap-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-fear/10 text-fear">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-base font-semibold text-on-heading font-sora">
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-on-variant hover:text-on-heading p-1 rounded transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-on-variant leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-surface-border pt-4">
          <button
            onClick={onCancel}
            className="btn-secondary py-2 px-5 text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="py-2 px-5 text-sm font-semibold rounded-lg bg-fear/90 hover:bg-fear text-white transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
