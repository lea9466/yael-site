"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

import { bulkDeleteMediaAction } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { BulkDeleteMediaResult } from "@/lib/media/media-types";
import type { MediaListItem } from "@/lib/media/media-types";

type MediaBulkDeleteDialogProps = {
  items: MediaListItem[];
  open: boolean;
  onClose: () => void;
  onSuccess: (result: BulkDeleteMediaResult) => void;
};

function buildBulkDeleteSummary(result: BulkDeleteMediaResult): string {
  const parts: string[] = [];

  if (result.deleted.length > 0) {
    parts.push(`${result.deleted.length} תמונות נמחקו`);
  }

  if (result.blocked.length > 0) {
    parts.push(
      `${result.blocked.length} תמונות נמצאות בשימוש ולא נמחקו`
    );
  }

  if (result.failed.length > 0) {
    parts.push(`${result.failed.length} תמונות נכשלו במחיקה`);
  }

  if (parts.length === 0) {
    return "לא בוצעה מחיקה.";
  }

  return `${parts.join(". ")}.`;
}

export function MediaBulkDeleteDialog({
  items,
  open,
  onClose,
  onSuccess,
}: MediaBulkDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [result, setResult] = useState<BulkDeleteMediaResult | null>(null);
  const [showBlockedDetails, setShowBlockedDetails] = useState(false);

  if (!open || items.length === 0) {
    return null;
  }

  const handleClose = () => {
    if (isPending) {
      return;
    }

    setError("");
    setResult(null);
    setShowBlockedDetails(false);
    onClose();
  };

  const handleConfirm = () => {
    setError("");
    setResult(null);
    setShowBlockedDetails(false);

    startTransition(async () => {
      const response = await bulkDeleteMediaAction(items.map((item) => item.id));

      if ("error" in response) {
        setError(response.error);
        return;
      }

      setResult(response);
      onSuccess(response);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="מחיקת תמונות נבחרות"
      description="פעולה זו אינה ניתנת לביטול עבור קבצים שנמחקו בהצלחה"
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text)]">
          נבחרו {items.length} תמונות. תמונות שאינן בשימוש יימחקו לצמיתות.
          תמונות שנמצאות בשימוש לא יימחקו.
        </p>

        {error ? (
          <p
            role="alert"
            className="rounded-[var(--radius-md)] bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)]"
          >
            {error}
          </p>
        ) : null}

        {result ? (
          <div
            role="status"
            aria-live="polite"
            className="space-y-3 rounded-[var(--radius-md)] bg-[var(--color-info-soft)] px-4 py-3 text-sm text-[var(--color-info)]"
          >
            <p>{buildBulkDeleteSummary(result)}</p>

            {result.blocked.length > 0 ? (
              <div className="space-y-2">
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]"
                  onClick={() => setShowBlockedDetails((current) => !current)}
                >
                  {showBlockedDetails ? (
                    <ChevronUp aria-hidden="true" className="size-4" />
                  ) : (
                    <ChevronDown aria-hidden="true" className="size-4" />
                  )}
                  הצגת תמונות בשימוש ({result.blocked.length})
                </button>

                {showBlockedDetails ? (
                  <ul className="space-y-3 text-[var(--color-text)]">
                    {result.blocked.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                      >
                        <p className="font-medium">{entry.fileName}</p>
                        <ul className="mt-2 list-disc space-y-1 pe-4 ps-5 text-caption">
                          {entry.usages.map((usage) => (
                            <li key={`${entry.id}-${usage.label}`}>
                              {usage.label}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {result.failed.length > 0 ? (
              <div className="flex items-start gap-2 text-[var(--color-error)]">
                <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <ul className="space-y-1">
                  {result.failed.map((entry) => (
                    <li key={entry.id}>
                      {entry.fileName}: {entry.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={isPending} onClick={handleClose}>
            {result ? "סגירה" : "ביטול"}
          </Button>
          {!result ? (
            <Button
              variant="danger"
              loading={isPending}
              loadingText="מוחק..."
              disabled={isPending}
              onClick={handleConfirm}
            >
              מחיקה לצמיתות
            </Button>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
}
