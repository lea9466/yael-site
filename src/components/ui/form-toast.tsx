"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { createPortal } from "react-dom";

import { IconButton } from "@/components/ui/icon-button";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { getPortalRoot } from "@/lib/portal/get-portal-root";
import { cn } from "@/lib/utils/cn";

export type FormToastVariant = "success" | "error";

type FormToastProps = {
  open: boolean;
  variant: FormToastVariant;
  message: string;
  onClose: () => void;
  autoHideMs?: number;
};

const variantClasses: Record<FormToastVariant, string> = {
  success:
    "border-[var(--color-success)]/25 bg-[var(--color-success-soft)] text-[var(--color-success)]",
  error:
    "border-[var(--color-error)]/30 bg-[var(--color-error-soft)] text-[var(--color-error)]",
};

export function FormToast({
  open,
  variant,
  message,
  onClose,
  autoHideMs,
}: FormToastProps) {
  const isClientReady = useClientReady();

  useEffect(() => {
    if (!open || !autoHideMs) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose();
    }, autoHideMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, autoHideMs, onClose]);

  if (!open || !isClientReady || !message) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-24 z-[var(--z-toast)] flex justify-center px-4"
      aria-live="assertive"
    >
      <div
        role={variant === "error" ? "alert" : "status"}
        className={cn(
          "pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-[var(--radius-xl)] border px-5 py-4 shadow-[var(--shadow-lg)] admin-toast-enter",
          variantClasses[variant]
        )}
      >
        {variant === "success" ? (
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        ) : (
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        )}

        <p className="min-w-0 flex-1 text-sm font-medium leading-6">{message}</p>

        <IconButton
          label="סגירת הודעה"
          size="sm"
          className="shrink-0 text-current hover:bg-black/5"
          onClick={onClose}
        >
          <X aria-hidden="true" className="size-4" />
        </IconButton>
      </div>
    </div>,
    getPortalRoot()
  );
}
