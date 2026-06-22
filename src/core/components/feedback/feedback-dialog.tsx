"use client";

import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ReactNode } from "react";

export type FeedbackDialogVariant = "success" | "error" | "warning" | "info";

export type FeedbackDialogProps = {
  open: boolean;
  variant: FeedbackDialogVariant;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onOpenChange?: (open: boolean) => void;
};

const VARIANT_CLASS: Record<FeedbackDialogVariant, string> = {
  error: "bg-[var(--signal-red-soft)] text-[var(--signal-red-dark)]",
  info: "bg-[var(--signal-blue-soft)] text-[var(--signal-blue)]",
  success: "bg-[var(--signal-green-soft)] text-[var(--signal-green-dark)]",
  warning: "bg-[var(--signal-amber-soft)] text-[var(--signal-amber-dark)]",
};

const VARIANT_ICON: Record<FeedbackDialogVariant, ReactNode> = {
  error: <XCircle aria-hidden="true" size={24} />,
  info: <Info aria-hidden="true" size={24} />,
  success: <CheckCircle2 aria-hidden="true" size={24} />,
  warning: <AlertTriangle aria-hidden="true" size={24} />,
};

export function FeedbackDialog({
  cancelText,
  confirmText = "OK",
  description,
  onCancel,
  onConfirm,
  onOpenChange,
  open,
  title,
  variant,
}: FeedbackDialogProps) {
  if (!open) {
    return null;
  }

  const close = () => {
    onOpenChange?.(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(19,35,31,0.42)] px-4 backdrop-blur-sm">
      <div
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-[var(--rail-border)] bg-[var(--surface-panel)] p-5 shadow-[var(--shadow-ops)]"
        role="dialog"
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${VARIANT_CLASS[variant]}`}
          >
            {VARIANT_ICON[variant]}
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[var(--rail-ink)]">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          {cancelText ? (
            <button
              className="h-10 rounded-lg border border-[var(--rail-border)] px-4 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--signal-blue)] hover:text-[var(--signal-blue)]"
              onClick={() => {
                onCancel?.();
                close();
              }}
              type="button"
            >
              {cancelText}
            </button>
          ) : null}
          <button
            className="h-10 rounded-lg bg-[var(--rail-ink)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--signal-blue)]"
            onClick={() => {
              onConfirm?.();
              close();
            }}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
