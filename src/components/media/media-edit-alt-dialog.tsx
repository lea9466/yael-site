"use client";

import { useState, useTransition } from "react";

import { updateMediaAltTextAction } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MediaListItem } from "@/lib/media/media-types";

type MediaEditAltDialogProps = {
  item: MediaListItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type MediaEditAltDialogFormProps = {
  item: MediaListItem;
  onClose: () => void;
  onSuccess: () => void;
};

function MediaEditAltDialogForm({
  item,
  onClose,
  onSuccess,
}: MediaEditAltDialogFormProps) {
  const [isPending, startTransition] = useTransition();
  const [altText, setAltText] = useState(item.alt_text ?? "");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const displayName = item.original_file_name ?? item.file_name;

  const handleClose = () => {
    if (isPending) {
      return;
    }

    onClose();
  };

  const handleSave = () => {
    setError("");
    setSuccessMessage("");

    startTransition(async () => {
      const result = await updateMediaAltTextAction(item.id, altText);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccessMessage("טקסט חלופי עודכן בהצלחה.");
      onSuccess();

      window.setTimeout(() => {
        onClose();
        setSuccessMessage("");
      }, 700);
    });
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      title="עריכת טקסט חלופי"
      description={displayName}
    >
      <div className="space-y-4">
        {error ? (
          <p role="alert" className="rounded-[var(--radius-md)] bg-[var(--color-error-soft)] px-4 py-3 text-sm text-[var(--color-error)]">
            {error}
          </p>
        ) : null}

        {successMessage ? (
          <p role="status" className="rounded-[var(--radius-md)] bg-[var(--color-success-soft)] px-4 py-3 text-sm text-[var(--color-success)]">
            {successMessage}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="edit-media-alt-text" className="block text-sm font-medium">
            טקסט חלופי (ברירת מחדל)
          </label>
          <Input
            id="edit-media-alt-text"
            value={altText}
            disabled={isPending}
            maxLength={250}
            onChange={(event) => setAltText(event.target.value)}
          />
          <p className="text-caption text-[var(--color-text-muted)]">
            עד 250 תווים
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={isPending} onClick={handleClose}>
            ביטול
          </Button>
          <Button
            loading={isPending}
            loadingText="שומר..."
            disabled={isPending}
            onClick={handleSave}
          >
            שמירה
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export function MediaEditAltDialog({
  item,
  open,
  onClose,
  onSuccess,
}: MediaEditAltDialogProps) {
  if (!open || !item) {
    return null;
  }

  return (
    <MediaEditAltDialogForm
      key={item.id}
      item={item}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
