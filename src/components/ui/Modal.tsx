"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

export function Modal({ open, onClose, title, description, children, size = "md", footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/55 backdrop-blur-sm sm:items-center animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl",
          "dark:bg-ink-900 dark:text-ink-50",
          "max-h-[92dvh] flex flex-col animate-slide-up",
          sizes[size]
        )}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4 dark:border-ink-800">
            <div>
              {title && <h2 className="text-base font-semibold text-ink-900 dark:text-ink-50">{title}</h2>}
              {description && (
                <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-ink-100 px-5 py-3 dark:border-ink-800">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button
            className="rounded-xl px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium text-white",
              variant === "danger" ? "bg-danger hover:bg-danger-dark" : "bg-brand-600 hover:bg-brand-700"
            )}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-sm text-ink-600 dark:text-ink-300">{description}</p>
    </Modal>
  );
}
