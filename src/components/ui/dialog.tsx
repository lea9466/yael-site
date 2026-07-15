"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { getPortalRoot } from "@/lib/portal/get-portal-root";
import { cn } from "@/lib/utils/cn";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  progressSlot?: React.ReactNode;
  className?: string;
  panelClassName?: string;
  bodyClassName?: string;
  disableEscapeClose?: boolean;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  progressSlot,
  className,
  panelClassName,
  bodyClassName,
  disableEscapeClose = false,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const isClientReady = useClientReady();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;

    if (!panel) {
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !disableEscapeClose) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, disableEscapeClose]);

  if (!open || !isClientReady) {
    return null;
  }

  return createPortal(
    <div
      className={cn("dialog-overlay flex items-center justify-center", className)}
    >
      <button
        type="button"
        aria-label="סגירת חלון"
        className="absolute inset-0 z-0 bg-[var(--color-primary)]/40"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "relative z-10 flex h-full max-h-full w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]",
          footer ? "" : "max-h-[min(90dvh,900px)] max-w-lg",
          panelClassName
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--color-border)] px-[var(--spacing-lg)] py-4 sm:px-[var(--spacing-xl)] sm:py-5">
          <div className="min-w-0 space-y-1">
            <h2 id={titleId} className="text-section-title">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton label="סגירה" size="sm" onClick={onClose}>
            <X aria-hidden="true" className="size-5" />
          </IconButton>
        </div>

        {progressSlot ? (
          <div className="shrink-0 border-b border-[var(--color-border)] px-[var(--spacing-lg)] py-4 sm:px-[var(--spacing-xl)]">
            {progressSlot}
          </div>
        ) : null}

        <div
          className={cn(
            footer ? "upload-dialog-scroll" : "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
            "px-[var(--spacing-lg)] py-4 sm:px-[var(--spacing-xl)] sm:py-5",
            bodyClassName
          )}
        >
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-[var(--color-border)] px-[var(--spacing-lg)] py-4 sm:px-[var(--spacing-xl)]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    getPortalRoot()
  );
}
