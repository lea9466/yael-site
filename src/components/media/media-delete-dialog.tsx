"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";

import { deleteMediaAction } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { MediaListItem } from "@/lib/media/media-types";

type MediaDeleteDialogProps = {
  item: MediaListItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function MediaDeleteDialog({
  item,
  open,
  onClose,
  onSuccess,
}: MediaDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [usages, setUsages] = useState<{ label: string }[]>([]);

  if (!item) {
    return null;
  }

  const displayName = item.original_file_name ?? item.file_name;

  const handleClose = () => {
    if (isPending) {
      return;
    }

    setError("");
    setUsages([]);
    onClose();
  };

  const handleDelete = () => {
    setError("");
    setUsages([]);

    startTransition(async () => {
      const result = await deleteMediaAction(item.id);

      if (!result.success) {
        setError(result.error);
        setUsages(result.usages ?? []);
        return;
      }

      onSuccess();
      handleClose();
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="מחיקת תמונה"
      description="פעולה זו אינה ניתנת לביטול"
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-text)]">
          האם למחוק את <strong>{displayName}</strong>? לא ניתן לשחזר את הקובץ
          לאחר המחיקה.
        </p>

        {error ? (
          <div
            role="alert"
            className="space-y-3 rounded-[var(--radius-md)] bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)]"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>

            {usages.length > 0 ? (
              <div>
                <p className="mb-2 font-medium">מיקומי שימוש:</p>
                <ul className="list-disc space-y-1 pe-4 ps-5">
                  {usages.map((usage) => (
                    <li key={usage.label}>{usage.label}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={isPending} onClick={handleClose}>
            ביטול
          </Button>
          <Button
            variant="danger"
            loading={isPending}
            loadingText="מוחק..."
            disabled={isPending}
            onClick={handleDelete}
          >
            מחיקה לצמיתות
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
