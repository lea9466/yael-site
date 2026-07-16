"use client";

import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type SettingsSaveBarProps = {
  isDirty: boolean;
  isPending: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export function SettingsSaveBar({
  isDirty,
  isPending,
  onCancel,
  onSave,
}: SettingsSaveBarProps) {
  return (
    <div
      className="admin-form-action-bar fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-[var(--color-border)]/70 bg-[var(--color-surface)]/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)]"
      role="region"
      aria-label="פעולות שמירה"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 lg:px-8">
        <div
          className={cn(
            "flex min-h-6 items-center gap-2 text-caption text-[var(--color-text-muted)]",
            !isDirty && "invisible sm:visible sm:opacity-0"
          )}
          aria-live="polite"
        >
          {isDirty ? (
            <>
              <span
                aria-hidden="true"
                className="size-2 shrink-0 animate-pulse rounded-[var(--radius-full)] bg-[var(--color-warm-gold)]"
              />
              <span>● יש שינויים שלא נשמרו</span>
            </>
          ) : (
            <span className="sr-only">אין שינויים שלא נשמרו</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onCancel}
          >
            ביטול
          </Button>
          <Button
            type="button"
            loading={isPending}
            loadingText="שומר..."
            disabled={!isDirty || isPending}
            onClick={onSave}
          >
            <Save aria-hidden="true" className="size-4" />
            שמירה
          </Button>
        </div>
      </div>
    </div>
  );
}
