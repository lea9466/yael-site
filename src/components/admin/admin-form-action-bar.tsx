import Link from "next/link";
import { Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type AdminFormActionBarProps = {
  cancelHref: string;
  onSave: () => void;
  onPublish?: () => void;
  showPublish?: boolean;
  saveDisabled?: boolean;
  publishDisabled?: boolean;
  isDirty?: boolean;
  isPending?: boolean;
  saveLabel?: string;
  publishLabel?: string;
  className?: string;
};

export function AdminFormActionBar({
  cancelHref,
  onSave,
  onPublish,
  showPublish = false,
  saveDisabled = false,
  publishDisabled = false,
  isDirty = false,
  isPending = false,
  saveLabel = "שמירה",
  publishLabel = "פרסום",
  className,
}: AdminFormActionBarProps) {
  const saveIsDisabled = saveDisabled || isPending || !isDirty;

  return (
    <div
      className={cn(
        "admin-form-action-bar fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-[var(--color-border)]/70 bg-[var(--color-surface)]/95 backdrop-blur-md",
        "pb-[env(safe-area-inset-bottom,0px)]",
        className
      )}
      role="region"
      aria-label="פעולות טופס"
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
              <span>יש שינויים שלא נשמרו</span>
            </>
          ) : (
            <span className="sr-only">אין שינויים שלא נשמרו</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={cancelHref}
            className="admin-btn-outline inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-4 text-sm font-medium"
          >
            ביטול
          </Link>
          <Button
            type="button"
            loading={isPending}
            loadingText="שומר..."
            disabled={saveIsDisabled}
            onClick={onSave}
          >
            <Save aria-hidden="true" className="size-4" />
            {saveLabel}
          </Button>
          {showPublish && onPublish ? (
            <Button
              type="button"
              variant="outline"
              loading={isPending}
              loadingText="מפרסם..."
              disabled={publishDisabled || isPending}
              onClick={onPublish}
            >
              <Send aria-hidden="true" className="size-4" />
              {publishLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
